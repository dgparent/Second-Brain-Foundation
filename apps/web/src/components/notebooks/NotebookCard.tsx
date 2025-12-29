'use client';

import Link from 'next/link';
import { MoreHorizontal, Edit, Archive, Trash2, ArchiveRestore, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeDate } from '@/lib/utils';
import type { Notebook } from '@/lib/api/types';

interface NotebookCardProps {
  notebook: Notebook;
  onEdit?: (notebook: Notebook) => void;
  onArchive?: (notebook: Notebook) => void;
  onUnarchive?: (notebook: Notebook) => void;
  onDelete?: (notebook: Notebook) => void;
}

export function NotebookCard({
  notebook,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}: NotebookCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/notebooks/${notebook.id}`} className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate hover:text-blue-600 transition-colors">
              {notebook.name}
            </CardTitle>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(notebook)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {notebook.archived && onUnarchive ? (
                <DropdownMenuItem onClick={() => onUnarchive(notebook)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive
                </DropdownMenuItem>
              ) : onArchive && (
                <DropdownMenuItem onClick={() => onArchive(notebook)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(notebook)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2">
          {notebook.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{notebook.sourceCount ?? 0} sources</span>
          </div>
          <span>Updated {formatRelativeDate(notebook.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
