'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Plus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { notebookApi, sourceApi } from '@/lib/api';
import type { Notebook, Source } from '@/lib/api/types';
import { formatRelativeDate } from '@/lib/utils';

interface DashboardStats {
  totalNotebooks: number;
  totalSources: number;
  totalChats: number;
  recentActivity: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentNotebooks, setRecentNotebooks] = useState<Notebook[]>([]);
  const [recentSources, setRecentSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [notebooksRes, sourcesRes] = await Promise.all([
          notebookApi.list({ limit: 5 }),
          sourceApi.list({ limit: 5 }),
        ]);

        setRecentNotebooks(notebooksRes.data);
        setRecentSources(sourcesRes.data);
        setStats({
          totalNotebooks: notebooksRes.total,
          totalSources: sourcesRes.total,
          totalChats: 0, // TODO: Add chat stats
          recentActivity: notebooksRes.data.length + sourcesRes.data.length,
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    href 
  }: { 
    title: string; 
    value: number; 
    icon: React.ElementType; 
    href: string;
  }) => (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          <Icon className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your Second Brain today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Notebooks"
          value={stats?.totalNotebooks ?? 0}
          icon={BookOpen}
          href="/notebooks"
        />
        <StatCard
          title="Total Sources"
          value={stats?.totalSources ?? 0}
          icon={FileText}
          href="/sources"
        />
        <StatCard
          title="Chat Sessions"
          value={stats?.totalChats ?? 0}
          icon={MessageSquare}
          href="/chat"
        />
        <StatCard
          title="This Week"
          value={stats?.recentActivity ?? 0}
          icon={TrendingUp}
          href="/activity"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/notebooks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Notebook
          </Button>
        </Link>
        <Link href="/sources/add">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Notebooks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Notebooks</CardTitle>
              <CardDescription>Your recently updated notebooks</CardDescription>
            </div>
            <Link href="/notebooks">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentNotebooks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notebooks yet</p>
                <Link href="/notebooks/new">
                  <Button variant="link" size="sm">
                    Create your first notebook
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotebooks.map((notebook) => (
                  <Link
                    key={notebook.id}
                    href={`/notebooks/${notebook.id}`}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{notebook.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeDate(notebook.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Sources</CardTitle>
              <CardDescription>Recently added sources</CardDescription>
            </div>
            <Link href="/sources">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSources.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sources yet</p>
                <Link href="/sources/add">
                  <Button variant="link" size="sm">
                    Add your first source
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSources.map((source) => (
                  <Link
                    key={source.id}
                    href={`/sources/${source.id}`}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{source.title}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {source.type} • {formatRelativeDate(source.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
