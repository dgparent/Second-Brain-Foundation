'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldOff, LucideIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

interface SensitivityPickerProps {
  value: SensitivityLevel;
  onChange: (level: SensitivityLevel, reason?: string) => void | Promise<void>;
  showDescription?: boolean;
  disabled?: boolean;
  requireReasonForDowngrade?: boolean;
  className?: string;
}

interface LevelConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  description: string;
}

const SENSITIVITY_CONFIG: Record<SensitivityLevel, LevelConfig> = {
  public: {
    icon: ShieldCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Public',
    description: 'Can be shared anywhere, processed by any AI',
  },
  personal: {
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Personal',
    description: 'Local AI only, can be exported but not shared',
  },
  confidential: {
    icon: ShieldAlert,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Confidential',
    description: 'Local AI only, no export or cloud sync',
  },
  secret: {
    icon: ShieldOff,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Secret',
    description: 'Never processed by any AI, not searchable',
  },
};

const SENSITIVITY_ORDER: SensitivityLevel[] = ['public', 'personal', 'confidential', 'secret'];

/**
 * SensitivityPicker - Allows users to select and change sensitivity levels.
 *
 * Features:
 * - Dropdown selection of sensitivity levels
 * - Visual indicators (icons, colors)
 * - Confirmation dialog for making content less restrictive
 * - Optional reason input for downgrades
 */
export function SensitivityPicker({
  value,
  onChange,
  showDescription = true,
  disabled = false,
  requireReasonForDowngrade = true,
  className,
}: SensitivityPickerProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<SensitivityLevel | null>(null);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const currentConfig = SENSITIVITY_CONFIG[value];
  const Icon = currentConfig.icon;

  const isDowngrade = (from: SensitivityLevel, to: SensitivityLevel): boolean => {
    const fromIndex = SENSITIVITY_ORDER.indexOf(from);
    const toIndex = SENSITIVITY_ORDER.indexOf(to);
    return toIndex < fromIndex; // Lower index = less restrictive
  };

  const handleChange = (newValue: SensitivityLevel) => {
    if (newValue === value) return;

    // Check if this is a downgrade (making more permissive)
    if (requireReasonForDowngrade && isDowngrade(value, newValue)) {
      setPendingLevel(newValue);
      setShowConfirm(true);
    } else {
      // Upgrade (more restrictive) - apply immediately
      applyChange(newValue);
    }
  };

  const applyChange = async (level: SensitivityLevel, changeReason?: string) => {
    setIsUpdating(true);
    try {
      await onChange(level, changeReason);
    } finally {
      setIsUpdating(false);
      setShowConfirm(false);
      setPendingLevel(null);
      setReason('');
    }
  };

  return (
    <>
      <div className={cn('space-y-2', className)}>
        <Label className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', currentConfig.color)} />
          Sensitivity Level
        </Label>

        <Select
          value={value}
          onValueChange={(v) => handleChange(v as SensitivityLevel)}
          disabled={disabled || isUpdating}
        >
          <SelectTrigger
            className={cn(
              currentConfig.bgColor,
              currentConfig.borderColor,
              'w-full'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SENSITIVITY_ORDER.map((level) => {
              const config = SENSITIVITY_CONFIG[level];
              const ItemIcon = config.icon;
              return (
                <SelectItem key={level} value={level}>
                  <div className="flex items-center gap-2">
                    <ItemIcon className={cn('h-4 w-4', config.color)} />
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {showDescription && (
          <p className="text-xs text-muted-foreground">{currentConfig.description}</p>
        )}
      </div>

      {/* Confirmation Dialog for Downgrades */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Sensitivity Change</DialogTitle>
            <DialogDescription>
              You are making this content <strong>more accessible</strong> by changing
              from <strong>{SENSITIVITY_CONFIG[value].label}</strong> to{' '}
              <strong>{pendingLevel && SENSITIVITY_CONFIG[pendingLevel].label}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {pendingLevel && (
              <div
                className={cn(
                  'p-3 rounded-lg text-sm',
                  SENSITIVITY_CONFIG[pendingLevel].bgColor,
                  SENSITIVITY_CONFIG[pendingLevel].color
                )}
              >
                <strong>This will allow:</strong>
                <p>{SENSITIVITY_CONFIG[pendingLevel].description}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for change (recommended)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you making this content more accessible?"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                This will be recorded in the audit log.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirm(false);
                setPendingLevel(null);
                setReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => pendingLevel && applyChange(pendingLevel, reason || undefined)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
