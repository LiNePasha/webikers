const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_CONTACT_PHONE
  ? `2${process.env.NEXT_PUBLIC_CONTACT_PHONE}`
  : '201030351075'

export interface ScooterModel {
  id: number
  name: string
  brand: string
  cc: string
}

// Add or remove scooters freely — images must match: public/images/keys/{id}.webp
export const scooterModels: ScooterModel[] = [
  { id: 1,  name: 'بصمة جيت X',        brand: 'SYM',   cc: '125cc' },
  { id: 2,  name: 'بصمة سكوتر JET 14',     brand: 'SYM',   cc: '200cc' },
  { id: 3,  name: 'بصمة كيواي XDV',        brand: 'Keeway',   cc: '125cc' },
  { id: 4,  name: 'Yamaha NMAX',      brand: 'Yamaha',  cc: '155cc' },
  { id: 5,  name: 'Yamaha Aerox',     brand: 'Yamaha',  cc: '155cc' },
  { id: 6,  name: 'Vespa Sprint',     brand: 'Vespa',   cc: '150cc' },
  { id: 7,  name: 'Vespa Primavera',  brand: 'Vespa',   cc: '150cc' },
  { id: 8,  name: 'Kymco Agility',    brand: 'Kymco',   cc: '125cc' },
  { id: 9,  name: 'Sym Jet',          brand: 'Sym',     cc: '125cc' },
  { id: 10, name: 'Piaggio Fly',      brand: 'Piaggio', cc: '125cc' },
  { id: 11, name: 'TVS Ntorq',        brand: 'TVS',     cc: '125cc' },
  { id: 12, name: 'Suzuki Address',   brand: 'Suzuki',  cc: '125cc' },
]

export function getWhatsAppLink(scooterName: string): string {
  const message = encodeURIComponent(`عايز أطلب بصمة ${scooterName}`)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
}
