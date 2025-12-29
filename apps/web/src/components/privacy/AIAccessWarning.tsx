'use client';

import { AlertTriangle, ShieldOff, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface AIAccessWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockedCount: number;
  allowedCount: number;
  onProceed: () => void;
  onCancel: () => void;
  aiType?: 'cloud' | 'local';
}

/**
 * AIAccessWarning - Dialog warning users about excluded content.
 *
 * Shows when some content is blocked from AI processing due to privacy settings.
 * Allows users to proceed with allowed content or cancel the operation.
 */
export function AIAccessWarning({
  open,
  onOpenChange,
  blockedCount,
  allowedCount,
  onProceed,
  onCancel,
  aiType = 'cloud',
}: AIAccessWarningProps) {
  const allBlocked = allowedCount === 0;
  const aiTypeName = aiType === 'cloud' ? 'Cloud AI' : 'Local AI';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {allBlocked ? 'Content Cannot Be Processed' : 'Some Content Will Be Excluded'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {allBlocked ? (
                <p>
                  Due to privacy settings, <strong>none</strong> of the selected content
                  can be processed by {aiTypeName}.
                </p>
              ) : (
                <>
                  <p>
                    Due to privacy settings,{' '}
                    <strong>{blockedCount} source(s)</strong> cannot be processed by{' '}
                    {aiTypeName} and will be excluded.
                  </p>
                  <p>
                    Only <strong>{allowedCount} source(s)</strong> will be included in
                    this operation.
                  </p>
                </>
              )}

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
                <ShieldOff className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Content marked as{' '}
                  {aiType === 'cloud' ? (
                    <>Personal, Confidential, or Secret</>
                  ) : (
                    <>Secret</>
                  )}{' '}
                  is protected from {aiTypeName} processing to ensure your privacy.
                </span>
              </div>

              {!allBlocked && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    You can change content sensitivity in the entity settings to allow AI
                    processing.
                  </span>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          {!allBlocked && (
            <AlertDialogAction onClick={onProceed}>
              Proceed with {allowedCount} source(s)
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface AIAccessBlockedProps {
  blockedCount: number;
  totalCount: number;
  className?: string;
}

/**
 * AIAccessBlocked - Inline notice for blocked content.
 *
 * Shows a subtle warning when some content was excluded from AI processing.
 */
export function AIAccessBlockedNotice({
  blockedCount,
  totalCount,
  className,
}: AIAccessBlockedProps) {
  if (blockedCount === 0) return null;

  const allBlocked = blockedCount === totalCount;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm',
        allBlocked ? 'text-red-600' : 'text-amber-600',
        className
      )}
    >
      <ShieldOff className="h-4 w-4" />
      <span>
        {allBlocked
          ? 'All content excluded due to privacy settings'
          : `${blockedCount} of ${totalCount} sources excluded due to privacy settings`}
      </span>
    </div>
  );
}
