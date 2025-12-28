"use client";

import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UserIcon, BotIcon } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-muted/50" : "bg-background"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <UserIcon className="h-4 w-4" />
        ) : (
          <BotIcon className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="text-sm font-medium">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="text-sm whitespace-pre-wrap break-words prose prose-sm max-w-none dark:prose-invert">
          {message.content}
        </div>
      </div>
    </div>
  );
}
