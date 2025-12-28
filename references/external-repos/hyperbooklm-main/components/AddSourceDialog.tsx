"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AddSourceDialogProps {
  onAddSource: (url: string) => Promise<void>;
  isLoading: boolean;
  canAddMore: boolean;
}

export function AddSourceDialog({
  onAddSource,
  isLoading,
  canAddMore,
}: AddSourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a URL",
      });
      return;
    }

    try {
      await onAddSource(url.trim());
      setUrl("");
      setOpen(false);
      toast({
        title: "Source added",
        description: "The webpage has been successfully scraped and added",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add source",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canAddMore || isLoading} size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
            <DialogDescription>
              Enter a URL to scrape and add as a source. The content will be
              used to answer your questions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !url.trim()}>
              {isLoading ? "Adding..." : "Add Source"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
