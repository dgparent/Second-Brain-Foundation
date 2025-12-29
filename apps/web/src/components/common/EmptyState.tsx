import type { LucideIcon } from 'lucide-react';
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Search, 
  Inbox 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  notebook: BookOpen,
  source: FileText,
  chat: MessageSquare,
  search: Search,
  inbox: Inbox,
  default: Inbox,
};

interface EmptyStateProps {
  icon?: keyof typeof icons | LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon = 'default', 
  title, 
  description, 
  action,
  className,
}: EmptyStateProps) {
  // Handle both string keys and direct LucideIcon components
  const Icon = typeof icon === 'string' 
    ? icons[icon] || icons.default
    : icon;
  
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
