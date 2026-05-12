import ScootersMarketClient from '@/components/scooters/ScootersMarketClient'

export const metadata = {
  title: 'إسكوترات مستعملة | سوق الإسكوترات | WeBikers',
  description: 'تصفح عروض الإسكوترات المستعملة مع تفاصيل العداد والحالة.',
  openGraph: {
    title: 'إسكوترات مستعملة | سوق الإسكوترات | WeBikers',
    description: 'تصفح عروض الإسكوترات المستعملة مع تفاصيل العداد والحالة.',
    type: 'website',
    locale: 'ar_EG',
  },
}

export default function UsedScootersPage() {
  return (
    <ScootersMarketClient
      type="used"
      title="الإسكوترات المستعملة"
      subtitle="ابحث عن أفضل الإسكوترات المستعملة المناسبة لميزانيتك."
    />
  )
}
