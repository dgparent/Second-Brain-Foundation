"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SourcesPanel } from "@/components/SourcesPanel";
import { ChatInterface } from "@/components/ChatInterface";
import { OutputsPanel } from "@/components/OutputsPanel";
import { Source, Message } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  
  // State
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mindmapData, setMindmapData] = useState<any>(null);
  
  // Loading States
  const [isScraping, setIsScraping] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [isGeneratingMindmap, setIsGeneratingMindmap] = useState(false);

  // Handlers
  const generateSummary = async (currentSources: Source[]) => {
    const context = currentSources
      .filter((s) => s.status === "success")
      .map((s) => `Title: ${s.title}\nContent: ${s.text?.slice(0, 2000)}`)
      .join("\n\n");

    if (!context) return;

    try {
      setSummary("Generating summary...");
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }
      
      if (data.summary) {
        setSummary(data.summary);
      } else {
        throw new Error("No summary returned from API");
      }
    } catch (e) {
      console.error("Summary generation failed", e);
      setSummary("Failed to generate summary.");
      toast({
        title: "Failed to generate summary",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const handleAddUrl = async (url: string) => {
    setIsScraping(true);
    const tempId = `source-${Date.now()}`;
    // Add optimistic source
    const newSource: Source = { 
        id: tempId, 
        url, 
        status: "loading", 
        addedAt: Date.now() 
    };
    
    setSources(prev => [...prev, newSource]);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to scrape");

      const updatedSource = { 
            ...newSource,
            status: "success" as const, 
            title: data.title, 
            content: data.content,
            text: data.text 
      };

      setSources(prev => prev.map(s => s.id === tempId ? updatedSource : s));

      toast({ title: "Source added successfully" });

    } catch (error) {
      console.error(error);
      setSources(prev => prev.map(s => 
        s.id === tempId ? { ...s, status: "error", error: "Failed to load" } : s
      ));
      toast({ 
        title: "Failed to add source", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleAddFile = async (file: File) => {
    setIsScraping(true);
    const tempId = `file-${Date.now()}`;
    
    // Add optimistic source
    const newSource: Source = {
      id: tempId,
      url: file.name, // Use filename as identifier
      title: file.name,
      status: "loading",
      addedAt: Date.now(),
    };
    
    setSources(prev => [...prev, newSource]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to upload PDF");

      const updatedSource = {
        ...newSource,
        status: "success" as const,
        title: data.title || file.name,
        text: data.text,
        content: data.content,
      };

      setSources(prev => prev.map(s => s.id === tempId ? updatedSource : s));

      toast({ title: "PDF added successfully" });

    } catch (error) {
      console.error(error);
      setSources(prev => prev.map(s =>
        s.id === tempId ? { ...s, status: "error", error: "Failed to process PDF" } : s
      ));
      toast({
        title: "Failed to add PDF",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleRemoveSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleAnalyzeSources = () => {
    generateSummary(sources);
    handleGenerateMindmap();
    handleGenerateSlides();
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsChatting(true);
    setStreamingContent("");

    try {
      // Build context from sources
      const context = sources
        .filter(s => s.status === "success")
        .map(s => `Title: ${s.title}\nContent: ${s.text?.slice(0, 2000)}`) // Truncate for token limits
        .join("\n\n");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMessage].map(m => ({ role: m.role, content: m.content })),
          context
        }),
      });

      if (!response.ok || !response.body) throw new Error("Chat failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        fullResponse += text;
        setStreamingContent(prev => prev + text);
      }

      setMessages(prev => [...prev, {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: fullResponse,
        timestamp: Date.now(),
      }]);
      setStreamingContent("");

    } catch (error) {
      console.error(error);
      toast({ title: "Chat failed", variant: "destructive" });
    } finally {
      setIsChatting(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!summary && messages.length === 0) {
        toast({ title: "Nothing to generate audio from", description: "Add sources or chat first." });
        return;
    }
    
    setIsGeneratingAudio(true);
    try {
        const textToSpeak = summary || messages[messages.length - 1]?.content || "No content available.";
        
        const res = await fetch("/api/audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textToSpeak.slice(0, 1000) }), // Limit length for demo
        });

        if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401 && data.error?.includes("missing_permissions")) {
            throw new Error("API Key missing 'text_to_speech' permission");
        }
        throw new Error(data.error || "Audio generation failed");
      }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        toast({ title: "Audio generated" });
    } catch (error) {
        console.error(error);
        toast({ 
            title: "Audio generation failed", 
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive" 
        });
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (sources.filter(s => s.status === "success").length === 0) {
        toast({ title: "No sources available", description: "Add sources to generate slides." });
        return;
    }

    setIsGeneratingSlides(true);
    try {
        const res = await fetch("/api/gemini/slides", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                notebookId: "nb-1", 
                sources: sources 
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        setSlides(data.slides);
        toast({ title: "Slides generated" });
    } catch (error) {
        console.error(error);
        toast({ title: "Failed to generate slides", variant: "destructive" });
    } finally {
        setIsGeneratingSlides(false);
    }
  };

  const handleGenerateMindmap = async () => {
    if (sources.filter(s => s.status === "success").length === 0) {
        toast({ title: "No sources available", description: "Add sources to generate mindmap." });
        return;
    }

    setIsGeneratingMindmap(true);
    try {
        const res = await fetch("/api/gpt/mindmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                notebookId: "nb-1", 
                sources: sources 
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        setMindmapData(data.root); // We should ideally process this into ReactFlow nodes
        toast({ title: "Mindmap generated" });
    } catch (error) {
        console.error(error);
        toast({ title: "Failed to generate mindmap", variant: "destructive" });
    } finally {
        setIsGeneratingMindmap(false);
    }
  };

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<"sources" | "chat" | "outputs">("sources");

  return (
    <div className="flex flex-col h-screen bg-white text-black font-sans overflow-hidden">
      <Navbar />
      
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setMobileTab("sources")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === "sources" ? "bg-white border-b-2 border-black" : "text-gray-500"
          }`}
        >
          Sources {sources.length > 0 && `(${sources.length})`}
        </button>
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === "chat" ? "bg-white border-b-2 border-black" : "text-gray-500"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMobileTab("outputs")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === "outputs" ? "bg-white border-b-2 border-black" : "text-gray-500"
          }`}
        >
          Outputs
        </button>
      </div>

      {/* Desktop: 3-column layout, Mobile: Single column based on active tab */}
      <div className="flex-1 grid lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left: Sources */}
        <div className={`${mobileTab === "sources" ? "block" : "hidden"} lg:block lg:col-span-3 border-r border-gray-200 h-full overflow-hidden`}>
          <SourcesPanel 
            sources={sources}
            onAddUrl={handleAddUrl}
            onAddFile={handleAddFile}
            onRemoveSource={handleRemoveSource}
            onAnalyze={handleAnalyzeSources}
            isLoading={isScraping}
          />
        </div>

        {/* Middle: Chat */}
        <div className={`${mobileTab === "chat" ? "block" : "hidden"} lg:block lg:col-span-5 border-r border-gray-200 h-full overflow-hidden`}>
          <ChatInterface 
            messages={messages}
            streamingContent={streamingContent}
            isLoading={isChatting}
            onSendMessage={handleSendMessage}
            hasSource={sources.length > 0}
          />
        </div>

        {/* Right: Outputs */}
        <div className={`${mobileTab === "outputs" ? "block" : "hidden"} lg:block lg:col-span-4 h-full overflow-hidden bg-white`}>
          <div className="h-full overflow-y-auto">
            <OutputsPanel 
                summary={summary}
                slides={slides}
                audioUrl={audioUrl}
                mindmapData={mindmapData}
                isGeneratingAudio={isGeneratingAudio}
                isGeneratingSlides={isGeneratingSlides}
                isGeneratingMindmap={isGeneratingMindmap}
                onGenerateAudio={handleGenerateAudio}
                onGenerateSlides={handleGenerateSlides}
                onGenerateMindmap={handleGenerateMindmap}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
