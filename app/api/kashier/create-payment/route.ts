import { NextRequest, NextResponse } from 'next/server';
import { buildKashierURL } from '@/lib/kashier/hash';

/**
 * Kashier Payment Initialization API
 * POST /api/kashier/create-payment
 * 
 * Returns Kashier payment URL for popup window
 */

interface CreatePaymentRequest {
  orderId: string;
  amount: number; // Amount in EGP
  currency?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: 'card' | 'wallet'; // طريقة الدفع المختارة
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json();

    // Validate required fields
    if (!body.orderId || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and amount' },
        { status: 400 }
      );
    }

    // Validate amount (must be positive)
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate payment method (default to card)
    const paymentMethod = body.paymentMethod || 'card';
    if (!['card', 'wallet'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method. Use "card" or "wallet"' },
        { status: 400 }
      );
    }

    // Format amount to 2 decimal places (Kashier requirement)
    const formattedAmount = body.amount.toFixed(2);

    // Get site URL from environment
    const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://spare2app.com';

    // Build Kashier payment URL with selected payment method only
    const kashierURL = buildKashierURL({
      orderId: body.orderId,
      amount: formattedAmount,
      currency: body.currency || 'EGP',
      merchantRedirect: `${siteURL}/checkout/success/${body.orderId}`, // ✅ Redirect to checkout success with orderId
      failureRedirect: `${siteURL}/checkout?payment=failed&orderId=${body.orderId}`,
      serverWebhook: `${siteURL}/api/kashier/webhook`,
      displayLang: 'ar',
      allowedMethods: paymentMethod // فقط الطريقة المختارة
    });

    console.log('🔗 Generated Kashier URL:', kashierURL);
    console.log('📋 Payment details:', {
      orderId: body.orderId,
      amount: formattedAmount,
      method: paymentMethod,
      mode: process.env.KASHIER_MODE
    });

    return NextResponse.json({
      success: true,
      paymentUrl: kashierURL,
      orderId: body.orderId,
      amount: formattedAmount
    });

  } catch (error) {
    console.error('Error creating Kashier payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
