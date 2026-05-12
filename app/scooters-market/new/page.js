import ScootersMarketClient from '@/components/scooters/ScootersMarketClient'

export const metadata = {
  title: 'إسكوترات جديدة | سوق الإسكوترات | WeBikers',
  description: 'اكتشف أحدث عروض الإسكوترات الجديدة مع فلاتر ذكية وسريعة.',
  openGraph: {
    title: 'إسكوترات جديدة | سوق الإسكوترات | WeBikers',
    description: 'اكتشف أحدث عروض الإسكوترات الجديدة مع فلاتر ذكية وسريعة.',
    type: 'website',
    locale: 'ar_EG',
  },
}

export default function NewScootersPage() {
  return (
    <ScootersMarketClient
      type="new"
      title="الإسكوترات الجديدة"
      subtitle="تصفح أحدث موديلات الإسكوترات الجديدة المتاحة الآن."
    />
  )
}
