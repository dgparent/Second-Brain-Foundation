'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  Shield,
  ShieldOff,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';
type PrivacyAction =
  | 'sensitivity_changed'
  | 'ai_access_allowed'
  | 'ai_access_blocked'
  | 'export_allowed'
  | 'export_blocked'
  | 'share_attempted'
  | 'share_blocked'
  | 'inheritance_applied';

interface AuditEntry {
  id: string;
  entityUid: string;
  action: PrivacyAction;
  actorId: string;
  actorType: 'user' | 'system' | 'ai';
  fromLevel?: SensitivityLevel;
  toLevel?: SensitivityLevel;
  blockedReason?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

interface PrivacyAuditLogProps {
  entityUid?: string;
  limit?: number;
  className?: string;
}

const ACTION_CONFIG: Record<
  PrivacyAction,
  { label: string; color: string; icon: typeof Shield }
> = {
  sensitivity_changed: {
    label: 'Sensitivity Changed',
    color: 'bg-blue-100 text-blue-700',
    icon: Shield,
  },
  ai_access_allowed: {
    label: 'AI Access Allowed',
    color: 'bg-green-100 text-green-700',
    icon: ShieldCheck,
  },
  ai_access_blocked: {
    label: 'AI Access Blocked',
    color: 'bg-red-100 text-red-700',
    icon: ShieldOff,
  },
  export_allowed: {
    label: 'Export Allowed',
    color: 'bg-green-100 text-green-700',
    icon: ShieldCheck,
  },
  export_blocked: {
    label: 'Export Blocked',
    color: 'bg-red-100 text-red-700',
    icon: ShieldOff,
  },
  share_attempted: {
    label: 'Share Attempted',
    color: 'bg-amber-100 text-amber-700',
    icon: ShieldAlert,
  },
  share_blocked: {
    label: 'Share Blocked',
    color: 'bg-red-100 text-red-700',
    icon: ShieldOff,
  },
  inheritance_applied: {
    label: 'Inheritance Applied',
    color: 'bg-purple-100 text-purple-700',
    icon: Shield,
  },
};

const LEVEL_CONFIG: Record<SensitivityLevel, { label: string; color: string }> = {
  public: { label: 'Public', color: 'text-green-600' },
  personal: { label: 'Personal', color: 'text-blue-600' },
  confidential: { label: 'Confidential', color: 'text-amber-600' },
  secret: { label: 'Secret', color: 'text-red-600' },
};

/**
 * PrivacyAuditLog - Displays privacy audit log entries.
 *
 * Shows a table of privacy-related actions with:
 * - Action type with icon
 * - Affected entity
 * - Actor (user, system, or AI)
 * - Timestamp
 * - Details (level changes, reasons, etc.)
 */
export function PrivacyAuditLog({
  entityUid,
  limit = 50,
  className,
}: PrivacyAuditLogProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'blocked'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAuditLog = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
          ...(entityUid && { entityUid }),
          ...(filter === 'blocked' && { filter: 'blocked' }),
        });

        const response = await fetch(`/api/privacy/audit?${params}`);
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Failed to fetch audit log:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLog();
  }, [entityUid, limit, filter, page]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No privacy events recorded</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Showing {entries.length} events
          </span>
        </div>

        <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'blocked')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="blocked">Blocked Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="w-[100px]">Actor</TableHead>
            <TableHead className="w-[120px] text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const config = ACTION_CONFIG[entry.action];
            const Icon = config.icon;

            return (
              <TableRow key={entry.id}>
                <TableCell>
                  <Badge variant="outline" className={cn('gap-1', config.color)}>
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">{entry.entityUid}</TableCell>
                <TableCell>
                  {entry.action === 'sensitivity_changed' && entry.fromLevel && entry.toLevel && (
                    <div className="flex items-center gap-1 text-sm">
                      <span className={LEVEL_CONFIG[entry.fromLevel].color}>
                        {LEVEL_CONFIG[entry.fromLevel].label}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      <span className={LEVEL_CONFIG[entry.toLevel].color}>
                        {LEVEL_CONFIG[entry.toLevel].label}
                      </span>
                    </div>
                  )}
                  {entry.blockedReason && (
                    <span className="text-sm text-red-600">{entry.blockedReason}</span>
                  )}
                  {entry.action === 'inheritance_applied' && entry.toLevel && (
                    <span className="text-sm">
                      Inherited{' '}
                      <span className={LEVEL_CONFIG[entry.toLevel].color}>
                        {LEVEL_CONFIG[entry.toLevel].label}
                      </span>{' '}
                      from parent
                    </span>
                  )}
                  {(entry.action === 'ai_access_allowed' ||
                    entry.action === 'ai_access_blocked') &&
                    entry.metadata?.ai_provider && (
                      <span className="text-sm text-muted-foreground">
                        {String(entry.metadata.ai_provider)} (
                        {String(entry.metadata.ai_type)})
                      </span>
                    )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground capitalize">
                    {entry.actorType}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-muted-foreground" title={formatTimestamp(entry.timestamp)}>
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {entries.length >= limit && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
