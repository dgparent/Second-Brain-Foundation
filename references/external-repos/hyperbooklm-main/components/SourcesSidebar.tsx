"use client";

import { FileTextIcon, Trash2Icon } from "lucide-react";
import { Source } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { truncateUrl } from "@/lib/utils";

interface SourcesSidebarProps {
  sources: Source[];
  onRemoveSource: (id: string) => void;
}

export function SourcesSidebar({
  sources,
  onRemoveSource,
}: SourcesSidebarProps) {
  return (
    <div className="flex h-full flex-col border-r bg-muted/10">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">
          Sources ({sources.length})
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Documents used for context
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sources.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No sources added yet. Add a URL to get started.
            </div>
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                className="group relative rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <FileTextIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium line-clamp-2 mb-1">
                      {source.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {truncateUrl(source.url, 35)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveSource(source.id)}
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
