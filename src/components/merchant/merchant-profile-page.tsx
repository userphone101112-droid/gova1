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
import { MERCHANT } from '@/platform/ui';


interface MerchantProfilePageProps {
  merchantId?: string;
  className?: string;
}

export function MerchantProfilePage({ className }: MerchantProfilePageProps) {
  const data = mockMerchantProfile;

  return (
    <main data-ui-uuid={MERCHANT.MERCHANT_PROFILE.PAGE_MAIN.uuid} className={className}>
      <MerchantHero merchant={data.merchant} />

      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PAGE_L30.uuid} className="container px-4 sm:px-6 py-8 space-y-8">
        <MerchantOverview overview={data.overview} />

        <QuickActions actions={data.quickActions} />

        <PerformanceDashboard performance={data.performance} />

        <FeaturedCollections collections={data.collections} />

        <BestSellingProducts products={data.bestSellingProducts} />

        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PAGE_L41.uuid} className="grid gap-6 lg:grid-cols-3">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PAGE_L42.uuid} className="lg:col-span-2 space-y-6">
            <RecentOrders orders={data.recentOrders} />
            <CustomerReviews
              reviews={data.reviews}
              ratingDistribution={data.ratingDistribution}
              averageRating={data.merchant.metrics.rating}
              totalReviews={data.merchant.metrics.reviewCount}
            />
          </div>
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_PAGE_L51.uuid} className="space-y-6">
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
