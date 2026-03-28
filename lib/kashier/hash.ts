import crypto from 'crypto';

/**
 * Kashier Hash Generation Utility
 * Based on Kashier HPP documentation: https://developers.kashier.io/payment/payment-ui#hpp
 */

interface OrderData {
  orderId: string;
  amount: string; // Must be a string with 2 decimal places (e.g., "100.00")
  currency?: string; // Default: EGP
}

/**
 * Generate HMAC SHA256 hash for Kashier payment
 * Hash Path Format: /?payment={merchantId}.{orderId}.{amount}.{currency}
 * 
 * @param orderData - Order information
 * @returns Hash string for Kashier payment request
 */
export function generateOrderHash(orderData: OrderData): string {
  const merchantId = process.env.KASHIER_MERCHANT_ID;
  const mode = process.env.KASHIER_MODE || 'test';
  const apiKey = mode === 'test' 
    ? process.env.KASHIER_TEST_API_KEY 
    : process.env.KASHIER_API_KEY;

  if (!merchantId || !apiKey) {
    throw new Error('Kashier credentials not configured');
  }

  const { orderId, amount, currency = 'EGP' } = orderData;

  // Validate amount format (must have 2 decimal places)
  if (!/^\d+\.\d{2}$/.test(amount)) {
    throw new Error('Amount must be formatted with 2 decimal places (e.g., "100.00")');
  }

  // Build the path string exactly as Kashier expects
  const path = `/?payment=${merchantId}.${orderId}.${amount}.${currency}`;

  // Generate HMAC SHA256 hash using API Key
  const hash = crypto
    .createHmac('sha256', apiKey)
    .update(path)
    .digest('hex');

  return hash;
}

/**
 * Validate Kashier response signature
 * Used to verify webhook and redirect callbacks
 * 
 * @param queryString - The query string from Kashier response (excluding signature and mode)
 * @param receivedSignature - The signature parameter from Kashier
 * @returns boolean indicating if signature is valid
 */
export function validateSignature(queryString: string, receivedSignature: string): boolean {
  const mode = process.env.KASHIER_MODE || 'test';
  const apiKey = mode === 'test' 
    ? process.env.KASHIER_TEST_API_KEY 
    : process.env.KASHIER_API_KEY;

  if (!apiKey) {
    throw new Error('Kashier API key not configured');
  }

  // Decode query string to handle any URL encoding
  const decodedQueryString = decodeURIComponent(queryString);

  // Generate expected signature using API Key
  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(decodedQueryString)
    .digest('hex');

  console.log('🔐 Signature Validation:');
  console.log('Query String:', decodedQueryString);
  console.log('Expected:', expectedSignature);
  console.log('Received:', receivedSignature);

  // Compare signatures (case-insensitive)
  return expectedSignature.toLowerCase() === receivedSignature.toLowerCase();
}

/**
 * Build complete Kashier HPP redirect URL
 * 
 * @param orderData - Order information
 * @param options - Additional options for the payment
 * @returns Complete Kashier payment URL
 */
export interface KashierPaymentOptions {
  orderId: string;
  amount: string;
  currency?: string;
  merchantRedirect?: string; // Success redirect URL
  failureRedirect?: string; // Failure redirect URL
  serverWebhook?: string; // Webhook URL for payment confirmation
  displayLang?: 'ar' | 'en';
  allowedMethods?: string; // Comma-separated payment methods
  brandColor?: string; // Hex color code (e.g., '#BD8D1D')
}

export function buildKashierURL(options: KashierPaymentOptions): string {
  const merchantId = process.env.KASHIER_MERCHANT_ID;
  const mode = process.env.KASHIER_MODE || 'test';

  if (!merchantId) {
    throw new Error('Kashier merchant ID not configured');
  }

  const {
    orderId,
    amount,
    currency = 'EGP',
    merchantRedirect,
    failureRedirect,
    serverWebhook,
    displayLang = 'ar',
    allowedMethods,
    brandColor
  } = options;

  // Generate hash
  const hash = generateOrderHash({ orderId, amount, currency });

  // Build query parameters
  const params = new URLSearchParams({
    merchantId,
    orderId,
    amount,
    currency,
    hash,
    mode,
    display: displayLang, // Arabic language
  });

  // Add optional parameters
  if (merchantRedirect) params.append('merchantRedirect', merchantRedirect);
  if (failureRedirect) params.append('failureRedirect', failureRedirect);
  if (serverWebhook) params.append('serverWebhook', serverWebhook);
  if (allowedMethods) params.append('allowedMethods', allowedMethods);
  if (brandColor) params.append('brandColor', encodeURIComponent(brandColor));
  
  // Redirect method: 'parent' to close popup and open success page in parent window
  params.append('redirectMethod', 'parent');

  // Kashier HPP URL (الـ URL الصحيح)
  const kashierURL = `https://payments.kashier.io/?${params.toString()}`;

  return kashierURL;
}

/**
 * Parse and validate Kashier callback query string
 * Removes signature and mode before validation
 * 
 * @param fullQueryString - Complete query string from Kashier redirect
 * @returns Object with parsed data and validation result
 */
export function parseKashierCallback(fullQueryString: string) {
  const params = new URLSearchParams(fullQueryString);
  const signature = params.get('signature');
  const mode = params.get('mode');

  if (!signature) {
    throw new Error('Missing signature in Kashier response');
  }

  // Remove signature and mode from query string for validation
  params.delete('signature');
  params.delete('mode');

  // Rebuild query string without signature and mode
  const cleanQueryString = params.toString();

  // Validate signature
  const isValid = validateSignature(cleanQueryString, signature);

  // Kashier uses different parameter names in redirect vs webhook
  const orderId = params.get('merchantOrderId') || params.get('orderId');
  const status = params.get('paymentStatus') || params.get('status');
  
  return {
    isValid,
    orderId: orderId,
    amount: params.get('amount'),
    currency: params.get('currency'),
    status: status,
    paymentMethod: params.get('payment_method'),
    transactionId: params.get('transactionId'),
    cardNumber: params.get('maskedCard') || params.get('card_number'),
    orderReference: params.get('orderReference'),
    cardBrand: params.get('cardBrand'),
    mode,
    signature,
    rawParams: Object.fromEntries(params.entries()) // للـ debugging
  };
}
