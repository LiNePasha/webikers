import type {
  BostaShippingRequest,
  BostaShippingResponse,
  BostaShipmentRequest,
  BostaShipmentResponse,
} from '@/types'

// ============================================
// BOSTA API CONFIGURATION
// ============================================

const BOSTA_API_URL = process.env.BOSTA_API_URL || 'https://app.bosta.co/api/v2'
const BOSTA_API_KEY = process.env.BOSTA_API_KEY || ''
const BOSTA_BUSINESS_ID = process.env.BOSTA_BUSINESS_ID || ''

// ============================================
// BOSTA API CLIENT
// ============================================

/**
 * Calculate shipping cost using Bosta API
 */
export async function calculateBostaShipping(
  request: BostaShippingRequest
): Promise<BostaShippingResponse> {
  try {
    // Validate API credentials
    if (!BOSTA_API_KEY || !BOSTA_BUSINESS_ID) {
      return {
        success: false,
        error: 'Bosta API credentials not configured',
      }
    }

    // Map city/district to Bosta zone
    // This would normally call Bosta's pricing API
    const response = await fetch(`${BOSTA_API_URL}/deliveries/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOSTA_API_KEY}`,
      },
      body: JSON.stringify({
        businessId: BOSTA_BUSINESS_ID,
        city: request.city,
        district: request.district,
        weight: request.weight,
        cod: request.cod,
        codAmount: request.codAmount || 0,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'فشل حساب تكلفة الشحن',
      }
    }

    const data = await response.json()

    return {
      success: true,
      deliveryFees: data.deliveryFees || 0,
      estimatedDays: data.estimatedDays || 3,
      zoneId: data.zoneId,
    }
  } catch (error) {
    console.error('Bosta shipping calculation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء حساب تكلفة الشحن',
    }
  }
}

/**
 * Create shipment in Bosta
 */
export async function createBostaShipment(
  request: BostaShipmentRequest
): Promise<BostaShipmentResponse> {
  try {
    // Validate API credentials
    if (!BOSTA_API_KEY || !BOSTA_BUSINESS_ID) {
      return {
        success: false,
        error: 'Bosta API credentials not configured',
      }
    }

    const response = await fetch(`${BOSTA_API_URL}/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOSTA_API_KEY}`,
      },
      body: JSON.stringify({
        businessId: BOSTA_BUSINESS_ID,
        type: 'SEND', // Delivery type
        specs: {
          packageType: 'Parcel',
          size: 'SMALL',
          weight: request.weight,
          itemsCount: request.itemsCount,
          description: request.description,
        },
        dropOffAddress: {
          firstLine: request.address,
          city: request.city,
          district: request.district,
          buildingNumber: request.building,
          floor: request.floor,
          apartment: request.apartment,
          secondLine: request.landmark,
        },
        receiver: {
          firstName: request.customerName.split(' ')[0] || request.customerName,
          lastName: request.customerName.split(' ').slice(1).join(' ') || '',
          phone: request.customerPhone,
        },
        notes: request.notes,
        cod: request.cod ? request.codAmount : 0,
        allowToOpenPackage: false,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/bosta`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'فشل إنشاء الشحنة',
      }
    }

    const data = await response.json()

    return {
      success: true,
      trackingNumber: data.trackingNumber,
      _id: data._id,
      state: data.state,
    }
  } catch (error) {
    console.error('Bosta shipment creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الشحنة',
    }
  }
}

/**
 * Get Bosta tracking info
 */
export async function getBostaTracking(trackingNumber: string) {
  try {
    if (!BOSTA_API_KEY) {
      throw new Error('Bosta API key not configured')
    }

    const response = await fetch(
      `${BOSTA_API_URL}/deliveries/${trackingNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${BOSTA_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch tracking info')
    }

    return await response.json()
  } catch (error) {
    console.error('Bosta tracking error:', error)
    throw error
  }
}

/**
 * Cancel Bosta shipment
 */
export async function cancelBostaShipment(trackingNumber: string) {
  try {
    if (!BOSTA_API_KEY) {
      throw new Error('Bosta API key not configured')
    }

    const response = await fetch(
      `${BOSTA_API_URL}/deliveries/${trackingNumber}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOSTA_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to cancel shipment')
    }

    return await response.json()
  } catch (error) {
    console.error('Bosta shipment cancellation error:', error)
    throw error
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map Egypt city/district to Bosta zone
 * This is a simplified version - in production, you'd have a complete mapping
 */
export function getCityZone(cityId: string): string {
  const zoneMapping: Record<string, string> = {
    // Cairo & Giza - Zone 1 (lowest cost)
    'cairo': 'zone1',
    'giza': 'zone1',
    'new-cairo': 'zone1',
    '6th-october': 'zone1',
    'qalyubia': 'zone1',
    
    // Alexandria - Zone 2
    'alexandria': 'zone2',
    'borg-el-arab': 'zone2',
    
    // Delta cities - Zone 2
    'beheira': 'zone2',
    'dakahlia': 'zone2',
    'gharbia': 'zone2',
    'monufia': 'zone2',
    'kafr-el-sheikh': 'zone2',
    'damietta': 'zone2',
    'sharqia': 'zone2',
    
    // Canal cities - Zone 3
    'ismailia': 'zone3',
    'port-said': 'zone3',
    'suez': 'zone3',
    
    // Upper Egypt - Zone 4 (highest cost)
    'faiyum': 'zone4',
    'beni-suef': 'zone4',
    'minya': 'zone4',
    'asyut': 'zone4',
    'sohag': 'zone4',
    'qena': 'zone4',
    'luxor': 'zone4',
    'aswan': 'zone4',
    
    // Red Sea & Sinai - Zone 5 (special pricing)
    'red-sea': 'zone5',
    'hurghada': 'zone5',
    'south-sinai': 'zone5',
    'north-sinai': 'zone5',
  }
  
  return zoneMapping[cityId] || 'zone3' // Default to zone 3
}

/**
 * Estimate delivery days based on zone
 */
export function estimateDeliveryDays(zoneId: string): number {
  const deliveryDays: Record<string, number> = {
    'zone1': 1, // Cairo/Giza - same day or next day
    'zone2': 2, // Alexandria & Delta - 2 days
    'zone3': 3, // Canal - 3 days
    'zone4': 4, // Upper Egypt - 4 days
    'zone5': 5, // Red Sea & Sinai - 5 days
  }
  
  return deliveryDays[zoneId] || 3
}
