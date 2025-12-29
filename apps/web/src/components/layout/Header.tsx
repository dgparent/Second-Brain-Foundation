'use client';

import { Menu, Bell, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserMenu } from './UserMenu';
import { useUIStore } from '@/lib/stores/ui-store';

export function Header() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Search bar */}
        <div className="hidden md:flex items-center relative w-96">
          <SearchIcon className="absolute left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search notebooks, sources, insights..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>
        
        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
