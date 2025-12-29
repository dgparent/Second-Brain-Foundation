'use client';

import { Shield, ShieldAlert, ShieldCheck, ShieldOff, LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

interface SensitivityBadgeProps {
  level: SensitivityLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

interface BadgeConfig {
  icon: LucideIcon;
  className: string;
  label: string;
  tooltip: string;
}

const BADGE_CONFIG: Record<SensitivityLevel, BadgeConfig> = {
  public: {
    icon: ShieldCheck,
    className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
    label: 'Public',
    tooltip: 'Shareable anywhere, any AI can process',
  },
  personal: {
    icon: Shield,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
    label: 'Personal',
    tooltip: 'Local AI only, no cloud sharing',
  },
  confidential: {
    icon: ShieldAlert,
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-300',
    label: 'Confidential',
    tooltip: 'Local AI only, no export or sync',
  },
  secret: {
    icon: ShieldOff,
    className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
    label: 'Secret',
    tooltip: 'No AI processing, not in search',
  },
};

const SIZE_CONFIG = {
  sm: {
    icon: 'h-3 w-3',
    badge: 'text-xs px-1.5 py-0.5',
    gap: 'gap-1',
  },
  md: {
    icon: 'h-4 w-4',
    badge: 'text-sm px-2 py-0.5',
    gap: 'gap-1.5',
  },
  lg: {
    icon: 'h-5 w-5',
    badge: 'text-base px-3 py-1',
    gap: 'gap-2',
  },
};

/**
 * SensitivityBadge - Displays the sensitivity level of content.
 *
 * Shows a colored badge with an icon indicating the privacy level.
 * Hover tooltip explains what the level means.
 */
export function SensitivityBadge({
  level,
  size = 'sm',
  showLabel = true,
  showTooltip = true,
  className,
}: SensitivityBadgeProps) {
  const config = BADGE_CONFIG[level];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        sizeConfig.badge,
        'inline-flex items-center',
        sizeConfig.gap,
        className
      )}
    >
      <Icon className={sizeConfig.icon} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Get the icon component for a sensitivity level.
 */
export function getSensitivityIcon(level: SensitivityLevel): LucideIcon {
  return BADGE_CONFIG[level].icon;
}

/**
 * Get the color class for a sensitivity level.
 */
export function getSensitivityColorClass(level: SensitivityLevel): string {
  return BADGE_CONFIG[level].className;
}

/**
 * Get the display label for a sensitivity level.
 */
export function getSensitivityLabel(level: SensitivityLevel): string {
  return BADGE_CONFIG[level].label;
}
