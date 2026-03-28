/**
 * Calculate wallet/payment gateway fees
 * For Instapay: 3% with min 5 EGP and max 30 EGP
 */

const ENABLE_WALLET_FEES = process.env.NEXT_PUBLIC_ENABLE_WALLET_FEES === 'yes'
const WALLET_FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_WALLET_FEE_PERCENTAGE || '3')
const WALLET_FEE_MIN = parseFloat(process.env.NEXT_PUBLIC_WALLET_FEE_MIN || '5')
const WALLET_FEE_MAX = parseFloat(process.env.NEXT_PUBLIC_WALLET_FEE_MAX || '30')

export function calculateWalletFee(orderTotal: number): number {
  // If fees are disabled, return 0
  if (!ENABLE_WALLET_FEES) {
    return 0
  }
  
  // Calculate percentage
  const feeAmount = (orderTotal * WALLET_FEE_PERCENTAGE) / 100
  
  // Apply min and max limits
  if (feeAmount < WALLET_FEE_MIN) {
    return WALLET_FEE_MIN
  }
  
  if (feeAmount > WALLET_FEE_MAX) {
    return WALLET_FEE_MAX
  }
  
  return Math.round(feeAmount * 100) / 100 // Round to 2 decimals
}

export function getWalletFeeInfo() {
  return {
    enabled: ENABLE_WALLET_FEES,
    percentage: WALLET_FEE_PERCENTAGE,
    min: WALLET_FEE_MIN,
    max: WALLET_FEE_MAX,
    description: ENABLE_WALLET_FEES 
      ? `رسوم المحفظة ${WALLET_FEE_PERCENTAGE}% (الحد الأدنى ${WALLET_FEE_MIN} جنيه، الحد الأقصى ${WALLET_FEE_MAX} جنيه)`
      : 'بدون رسوم إضافية'
  }
}
