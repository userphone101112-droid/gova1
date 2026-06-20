'use client';
import { ShieldCheck, Lock, Truck, RefreshCw, Trophy, Star, Zap, Leaf, Crown, Palette, Globe, Flame, Award } from 'lucide-react';

import type { TrustCredential, Achievement, SellerBadge } from '@/lib/merchant/types';
import { getAchievementRarityColor } from '@/lib/merchant/utils';
import { MERCHANT, useTranslation } from '@/platform/ui';



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
    <div data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.CONTAINER.uuid} className={`overflow-hidden ${className}`}>
      <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_TITLE_CONTAINER_L47.uuid} className="p-6">
        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_TITLE_CONTAINER_L48.uuid} className="flex items-center gap-2 mb-4">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_TITLE_CONTAINER_L49.uuid} className="rounded-full bg-warning-container p-2">
            <Award className="h-5 w-5 text-warning" />
          </div>
          <h2 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.TITLE.uuid} className="text-lg">{t(MERCHANT.MERCHANT_PROFILE.TRUST.TITLE)}</h2>
        </div>

        <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_ACHIEVEMENTS_CONTAINER_L55.uuid} className="space-y-6">
          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_ACHIEVEMENTS_CONTAINER_L56.uuid} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((credential) => {
              const IconComponent = credentialIcons[credential.icon] || ShieldCheck;
              return (
                <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_ACHIEVEMENTS_CONTAINER_L60.uuid} key={credential.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
                  <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_ACHIEVEMENTS_CONTAINER_L61.uuid} className="rounded-full bg-success-container p-2">
                    <IconComponent className="h-4 w-4 text-success" />
                  </div>
                  <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_ACHIEVEMENTS_CONTAINER_L64.uuid} className="flex-1 min-w-0">
                    <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.CREDENTIAL_TITLE.uuid} data-ui-instance-id={credential.id} className="font-medium text-sm">{credential.title}</h4>
                    <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.CREDENTIAL_DESCRIPTION.uuid} data-ui-instance-id={credential.id} className="text-xs text-muted-foreground mt-0.5">{credential.description}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_ACHIEVEMENTS_CONTAINER_L73.uuid} className="space-y-3">
            <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.ACHIEVEMENTS_HEADING.uuid} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.TRUST.ACHIEVEMENTS)}</h4>
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_ACHIEVEMENTS_CONTAINER_L75.uuid} className="flex flex-wrap gap-2">
              {achievements.map((achievement) => {
                const IconComponent = achievementIcons[achievement.icon] || Trophy;
                return (
                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.ACHIEVEMENT_BADGE.uuid} data-ui-instance-id={achievement.id} key={achievement.id} className={`gap-1.5 py-1.5 px-3 border ${getAchievementRarityColor(achievement.rarity)}`}>
                    <IconComponent className="h-3.5 w-3.5" />
                    <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.ACHIEVEMENT_NAME.uuid} data-ui-instance-id={achievement.id} className="font-medium">{achievement.name}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_SELLER_BADGES_CONTAINER_L88.uuid} className="space-y-3">
            <h4 data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.SELLER_BADGES_HEADING.uuid} className="font-medium text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.TRUST.SELLER_BADGES)}</h4>
            <div data-ui-uuid={MERCHANT.SHELL.MERCHANT_PROFILE_TRUST_NO_BADGES_EARNED_CONTAINER_L90.uuid} className="flex flex-wrap gap-2">
              {badges.filter((b) => b.earned).map((badge) => {
                const IconComponent = badgeIcons[badge.icon] || Crown;
                return (
                  <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.SELLER_BADGE.uuid} data-ui-instance-id={badge.id} key={badge.id} className="gap-1.5 py-1.5 px-3 bg-warning-container text-on-warning-container border-warning">
                    <IconComponent className="h-3.5 w-3.5" />
                    <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.SELLER_BADGE_NAME.uuid} data-ui-instance-id={badge.id} className="font-medium">{badge.name}</span>
                  </span>
                );
              })}
              {badges.filter((b) => b.earned).length === 0 && (
                <span data-ui-uuid={MERCHANT.MERCHANT_PROFILE.TRUST.NO_BADGES_TEXT.uuid} className="text-sm text-muted-foreground">{t(MERCHANT.MERCHANT_PROFILE.TRUST.NO_BADGES_EARNED)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrustCredibility;
