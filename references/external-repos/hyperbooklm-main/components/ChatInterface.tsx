"use client";

import { useEffect, useRef, useState } from "react";
import { SendIcon, Loader2Icon, Sparkles } from "lucide-react";
import { Message } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInterfaceProps {
  messages: Message[];
  streamingContent: string;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  hasSource: boolean;
}

export function ChatInterface({
  messages,
  streamingContent,
  isLoading,
  onSendMessage,
  hasSource,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasSource) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-white text-black p-4 gap-4">
      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-inner">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.length === 0 && !streamingContent && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center opacity-50">
                <Sparkles className="h-12 w-12 mb-4 text-black" />
                <h3 className="text-xl font-medium text-black mb-2">
                  {hasSource ? "Research Assistant Ready" : "Waiting for Sources"}
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  {hasSource
                    ? "Ask questions to explore your sources deeper. I can help synthesize information."
                    : "Upload a URL or file to begin your research journey."}
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user' 
                      ? 'bg-black text-white rounded-tr-sm' 
                      : 'bg-white text-black rounded-tl-sm border border-gray-200 shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming message with reveal effect */}
            {streamingContent && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 justify-start"
              >
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-5 py-3 bg-white text-black border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    <Sparkles className="h-3 w-3 text-black" />
                    <span className="text-xs font-medium uppercase tracking-wider text-black">Generating</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {streamingContent}
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-4 ml-1 bg-black align-middle"
                    />
                  </p>
                </div>
              </motion.div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <Input
            placeholder={hasSource ? "Ask a question about your sources..." : "Add a source to start chatting"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || !hasSource}
            className="w-full bg-white border-gray-200 text-black placeholder:text-gray-400 h-14 pl-5 pr-14 rounded-full focus-visible:ring-1 focus-visible:ring-black transition-all shadow-lg"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || !hasSource}
            className="absolute right-2 top-2 h-10 w-10 rounded-full bg-black text-white hover:bg-gray-800 hover:text-white transition-colors"
          >
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
