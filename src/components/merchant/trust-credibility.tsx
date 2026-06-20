'use client';

import {
  UiCard,
  UiDiv,
  UiH2,
  UiH4,
  UiLabel,
  UiBadge,
  MERCHANT,
  COMMON_LAYOUT,
  COMMON_TYPOGRAPHY,
  COMMON_COMPONENTS,
  useTranslation,
} from '@/platform/ui';
import type { TrustCredential, Achievement, SellerBadge } from '@/lib/merchant/types';
import { getAchievementRarityColor } from '@/lib/merchant/utils';
import { ShieldCheck, Lock, Truck, RefreshCw, Trophy, Star, Zap, Leaf, Crown, Palette, Globe, Flame, Award } from 'lucide-react';

interface TrustCredibilityProps {
  credentials: TrustCredential[];
  achievements: Achievement[];
  badges: SellerBadge[];
  className?: string;
}

const credentialIcons: Record<string, any> = {
  ShieldCheck,
  Lock,
  Truck,
  RefreshCw,
};

const achievementIcons: Record<string, any> = {
  Trophy,
  Star,
  Zap,
  Leaf,
};

const badgeIcons: Record<string, any> = {
  Crown,
  Palette,
  Globe,
  Flame,
};

export function TrustCredibility({
  credentials,
  achievements,
  badges,
  className,
}: TrustCredibilityProps) {
  const { t } = useTranslation();
  return (
    <UiCard ui={MERCHANT.MERCHANT_PROFILE.TRUST.CONTAINER} className={`overflow-hidden ${className}`}>
      <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="p-6">
        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex items-center gap-2 mb-4">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-yellow-100 p-2">
            <Award className="h-5 w-5 text-yellow-600" />
          </UiDiv>
          <UiH2 ui={MERCHANT.MERCHANT_PROFILE.TRUST.TITLE} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.TRUST.TITLE)}</UiH2>
        </UiDiv>

        <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-6">
          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((credential) => {
              const IconComponent = credentialIcons[credential.icon] || ShieldCheck;
              return (
                <UiDiv
                  key={credential.id}
                  ui={COMMON_LAYOUT.CONTAINER}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50"
                >
                  <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="rounded-full bg-green-100 p-2">
                    <IconComponent className="h-4 w-4 text-green-600" />
                  </UiDiv>
                  <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex-1 min-w-0">
                    <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm">{credential.title}</UiH4>
                    <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-xs text-muted-foreground mt-0.5">{credential.description}</UiLabel>
                  </UiDiv>
                </UiDiv>
              );
            })}
          </UiDiv>

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
            <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.TRUST.ACHIEVEMENTS)}</UiH4>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap gap-2">
              {achievements.map((achievement) => {
                const IconComponent = achievementIcons[achievement.icon] || Trophy;
                return (
                  <UiBadge
                    key={achievement.id}
                    ui={COMMON_COMPONENTS.BADGE.LABEL}
                    variant="outline"
                    className={`gap-1.5 py-1.5 px-3 border ${getAchievementRarityColor(achievement.rarity)}`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{achievement.name}</UiLabel>
                  </UiBadge>
                );
              })}
            </UiDiv>
          </UiDiv>

          <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="space-y-3">
            <UiH4 ui={COMMON_TYPOGRAPHY.H4} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.TRUST.SELLER_BADGES)}</UiH4>
            <UiDiv ui={COMMON_LAYOUT.CONTAINER} className="flex flex-wrap gap-2">
              {badges.filter((b) => b.earned).map((badge) => {
                const IconComponent = badgeIcons[badge.icon] || Crown;
                return (
                  <UiBadge
                    key={badge.id}
                    ui={COMMON_COMPONENTS.BADGE.LABEL}
                    className="gap-1.5 py-1.5 px-3 bg-yellow-100 text-yellow-800 border-yellow-200"
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <UiLabel ui={COMMON_TYPOGRAPHY.P} className="font-medium">{badge.name}</UiLabel>
                  </UiBadge>
                );
              })}
              {badges.filter((b) => b.earned).length === 0 && (
                <UiLabel ui={COMMON_TYPOGRAPHY.P} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.TRUST.NO_BADGES_EARNED)}</UiLabel>
              )}
            </UiDiv>
          </UiDiv>
        </UiDiv>
      </UiDiv>
    </UiCard>
  );
}

export default TrustCredibility;
