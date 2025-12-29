/**
 * Usage Settings Page - View token usage and costs
 */
'use client';

import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, Loader2, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { modelsApi, UsageSummary, ModelUsage } from '@/lib/api/models';

type Period = 'day' | 'week' | 'month' | 'all';

export default function UsageSettingsPage() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsage = async () => {
      setIsLoading(true);
      try {
        const data = await modelsApi.getUsage(period);
        setUsage(data);
      } catch (error) {
        console.error('Failed to load usage:', error);
        // Use mock data
        setUsage({
          totalCost: 0,
          totalTokens: 0,
          totalRequests: 0,
          byModel: [],
          period: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
          },
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadUsage();
  }, [period]);

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(cost);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Usage Overview</h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 hours</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(usage?.totalCost || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(usage?.totalTokens || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(usage?.totalRequests || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage by Model
          </CardTitle>
          <CardDescription>
            Breakdown of token usage and costs per model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!usage?.byModel || usage.byModel.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No usage data yet</p>
              <p className="text-sm mt-1">
                Usage statistics will appear here once you start using AI features.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {usage.byModel.map((model: ModelUsage) => (
                <div
                  key={model.modelId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{model.modelName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatNumber(model.totalTokens)} tokens ·{' '}
                      {formatNumber(model.requestCount)} requests
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCost(model.totalCost)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Input: {formatNumber(model.inputTokens)} · Output:{' '}
                      {formatNumber(model.outputTokens)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing
          </CardTitle>
          <CardDescription>
            Your current billing status and payment information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Current Plan</div>
              <div className="text-sm text-gray-500 mt-1">
                Usage-based pricing · No monthly fee
              </div>
            </div>
            <Badge variant="secondary">Pay-as-you-go</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            You are charged based on actual API usage. Costs are calculated using
            your own API keys.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
