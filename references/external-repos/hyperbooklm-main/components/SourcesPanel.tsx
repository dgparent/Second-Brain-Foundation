"use client";

import { useState } from "react";
import { Link, FileUp, Plus, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Source } from "@/lib/types";

interface SourcesPanelProps {
  sources: Source[];
  onAddUrl: (url: string) => Promise<void>;
  onAddFile: (file: File) => Promise<void>;
  onRemoveSource: (id: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export function SourcesPanel({ sources, onAddUrl, onAddFile, onRemoveSource, onAnalyze, isLoading }: SourcesPanelProps) {
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    await onAddUrl(urlInput);
    setUrlInput("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAddFile(file);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  // Count file sources (PDFs and TXTs)
  const fileCount = sources.filter(s => 
    s.url.toLowerCase().endsWith('.pdf') || 
    s.url.toLowerCase().endsWith('.txt') || 
    s.url.startsWith('file-')
  ).length;

  return (
    <div className="flex flex-col h-full bg-white text-black p-4 gap-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Sources</h2>
        <p className="text-sm text-gray-600">Add content to your notebook</p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
        <button
          onClick={() => setActiveTab("url")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "url" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
          }`}
        >
          <Link className="h-4 w-4" />
          URL
        </button>
        <button
          onClick={() => setActiveTab("file")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "file" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
          }`}
        >
          <FileUp className="h-4 w-4" />
          File
        </button>
      </div>

      <div className="flex-none">
        {activeTab === "url" ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="Paste URL (e.g. https://example.com)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus-visible:ring-black"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="w-full bg-black text-white hover:bg-gray-800 hover:text-white font-medium"
              disabled={isLoading || !urlInput.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {isLoading ? "Adding Source..." : "Add Source"}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <label className={`relative h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
              isLoading || fileCount >= 5 
                ? "border-gray-200 bg-gray-100 cursor-not-allowed" 
                : "border-gray-300 bg-gray-50 cursor-pointer hover:border-gray-400"
            }`}>
              <input
                type="file"
                accept=".pdf,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isLoading || fileCount >= 5}
              />
              <FileUp className={`h-8 w-8 ${fileCount >= 5 ? "text-gray-300" : "text-gray-500"}`} />
              <span className={`text-sm font-medium ${fileCount >= 5 ? "text-gray-400" : "text-gray-600"}`}>
                {fileCount >= 5 ? "Max 5 files reached" : "Click to upload PDF or TXT"}
              </span>
              <span className="text-xs text-gray-400">
                {fileCount >= 5 ? "Remove a file to add more" : `${fileCount}/5 files added`}
              </span>
            </label>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing file...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Sources ({sources.length})</h3>
          {sources.filter(s => s.status === "success").length > 0 && (
            <Button
              size="sm"
              onClick={onAnalyze}
              className="bg-black text-white hover:bg-gray-800 hover:text-white h-7 px-3 text-xs font-medium"
            >
              Analyze All
            </Button>
          )}
        </div>
        
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-3">
            {sources.map((source) => (
              <div key={source.id} className="group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors min-h-[100px]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-black mb-2 line-clamp-2 leading-relaxed">
                        {source.title || source.url}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{source.url}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveSource(source.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                    {source.status === "success" ? (
                        <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Ready
                        </span>
                    ) : (
                        <span className="text-yellow-600 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Processing
                        </span>
                    )}
                </div>
              </div>
            ))}
            
            {sources.length === 0 && (
                <div className="text-center text-gray-400 py-8 text-sm">
                    No sources added yet.
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
