/**
 * Settings Layout - Settings page navigation and layout
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Bot, Settings, Key, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsTabs = [
  { href: '/settings', icon: User, label: 'Profile', exact: true },
  { href: '/settings/models', icon: Bot, label: 'Models' },
  { href: '/settings/api-keys', icon: Key, label: 'API Keys' },
  { href: '/settings/preferences', icon: Settings, label: 'Preferences' },
  { href: '/settings/usage', icon: CreditCard, label: 'Usage' },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex gap-8">
        {/* Settings Nav */}
        <nav className="w-48 flex-shrink-0 space-y-1">
          {settingsTabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings Content */}
        <div className="flex-1 max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
