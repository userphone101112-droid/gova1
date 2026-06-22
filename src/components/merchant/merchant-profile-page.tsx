'use client';
import {
  MerchantHero,
  MerchantOverview,
  QuickActions,
  StoreInformation,
  PerformanceDashboard,
  FeaturedCollections,
  BestSellingProducts,
  RecentOrders,
  CustomerReviews,
  TrustCredibility,
} from '@/components/merchant';
import { mockMerchantProfile } from '@/lib/merchant/mock-data';


interface MerchantProfilePageProps {
  merchantId?: string;
  className?: string;
}

export function MerchantProfilePage({ className }: MerchantProfilePageProps) {
  const data = mockMerchantProfile;

  return (
    <main className={className}>
      <MerchantHero merchant={data.merchant} />

      <div className="container px-4 sm:px-6 py-8 space-y-8">
        <MerchantOverview overview={data.overview} />

        <QuickActions actions={data.quickActions} />

        <PerformanceDashboard performance={data.performance} />

        <FeaturedCollections collections={data.collections} />

        <BestSellingProducts products={data.bestSellingProducts} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <RecentOrders orders={data.recentOrders} />
            <CustomerReviews
              reviews={data.reviews}
              ratingDistribution={data.ratingDistribution}
              averageRating={data.merchant.metrics.rating}
              totalReviews={data.merchant.metrics.reviewCount}
            />
          </div>
          <div className="space-y-6">
            <StoreInformation store={data.storeInformation} />
            <TrustCredibility
              credentials={data.trustCredentials}
              achievements={data.achievements}
              badges={data.badges}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default MerchantProfilePage;
