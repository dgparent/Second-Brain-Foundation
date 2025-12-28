"use client";

import React, { useState } from "react";
import { Play, Pause, FileText, Share2, Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MindMap } from "./MindMap";

function FormattedSummary({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!text) return <p className="text-gray-400 italic text-sm">Summary will appear here after analysis...</p>;

  // Normalize newlines and split
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const shouldTruncate = lines.length > 5;
  const displayedLines = expanded || !shouldTruncate ? lines : lines.slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {displayedLines.map((line, i) => {
          const trimmed = line.trim();
          
          // Heading (bold with **)
          if (trimmed.includes('**')) {
             const cleanLine = trimmed.replace(/\*\*/g, '').replace(/^#+\s*/, '').replace(/:$/, ''); 
             return <h4 key={i} className="font-bold text-black mt-4 first:mt-0 mb-1 text-sm uppercase tracking-wide">{cleanLine}</h4>
          }
          
          // Bullet point
          if (trimmed.startsWith('-') || trimmed.startsWith('* ')) {
              const content = trimmed.replace(/^[-*]\s*/, '');
              return (
                  <div key={i} className="flex gap-2 text-sm text-gray-700 ml-2 items-start">
                      <span className="text-black mt-2 h-1 w-1 rounded-full bg-black shrink-0" />
                      <span className="leading-relaxed">{content}</span>
                  </div>
              )
          }
          
          // Regular paragraph
          return <p key={i} className="text-sm text-gray-700 leading-relaxed">{trimmed}</p>
        })}
      </div>
      
      {shouldTruncate && (
        <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black mt-2 transition-colors"
        >
            {expanded ? (
                <>Show Less <ChevronUp className="h-3 w-3" /></>
            ) : (
                <>Read More <ChevronDown className="h-3 w-3" /></>
            )}
        </button>
      )}
    </div>
  )
}

interface OutputsPanelProps {
  summary: string | null;
  slides: any[];
  audioUrl: string | null;
  mindmapData: any;
  isGeneratingAudio: boolean;
  isGeneratingSlides: boolean;
  isGeneratingMindmap: boolean;
  onGenerateAudio: () => void;
  onGenerateSlides: () => void;
  onGenerateMindmap: () => void;
}

export function OutputsPanel({
  summary,
  slides,
  audioUrl,
  mindmapData,
  isGeneratingAudio,
  isGeneratingSlides,
  isGeneratingMindmap,
  onGenerateAudio,
  onGenerateSlides,
  onGenerateMindmap,
}: OutputsPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownloadSlides = () => {
    if (slides.length === 0) return;

    const content = slides.map(slide => 
      `# ${slide.title}\n${slide.bullets.map((b: string) => `* ${b}`).join('\n')}\n`
    ).join('\n---\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation-slides.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full gap-6 p-4">
      {/* Audio Overview */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Audio Overview</h3>
          {!audioUrl && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onGenerateAudio}
              disabled={isGeneratingAudio}
              className="text-xs h-8 bg-black text-white hover:bg-gray-800 hover:text-white border-none"
            >
              {isGeneratingAudio ? <Loader2 className="h-3 w-3 animate-spin" /> : "Generate"}
            </Button>
          )}
        </div>
        
        {audioUrl ? (
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full p-2 pr-4 shadow-sm w-full max-w-sm mx-auto">
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-black text-white hover:bg-gray-800 hover:text-white shrink-0"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>
            
            <div className="flex-1 flex items-center justify-center gap-[2px] h-8 overflow-hidden">
               {/* Minimal waveform viz */}
               {Array.from({ length: 30 }).map((_, i) => (
                 <div 
                    key={i} 
                    className="w-[3px] bg-black/80 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" 
                    style={{ 
                        height: `${Math.max(15, Math.random() * 80)}%`,
                        animationDelay: `${i * 0.05}s`,
                        opacity: isPlaying ? 1 : 0.3
                    }} 
                 />
               ))}
            </div>
            
            <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)}
                className="hidden"
            />
          </div>
        ) : (
          <div className="h-12 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300 rounded bg-white">
            No audio generated yet
          </div>
        )}
      </section>

      {/* Mindmap Preview */}
      <section className="min-h-[400px] h-[400px] flex flex-col relative group">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-black">Mindmap Preview</h3>
            <Button 
                size="sm" 
                variant="outline" 
                onClick={onGenerateMindmap}
                disabled={isGeneratingMindmap}
                className="text-xs h-8 bg-black text-white hover:bg-gray-800 hover:text-white border-none"
            >
                {isGeneratingMindmap ? <Loader2 className="h-3 w-3 animate-spin" /> : "Generate"}
            </Button>
        </div>
        <div className="flex-1 w-full">
          <MindMap data={mindmapData} /> 
        </div>
      </section>

      {/* Research Summary */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-black mb-2">Research Summary</h3>
        <FormattedSummary text={summary || ""} />
      </section>

      {/* Slides Generation */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Presentation Slides</h3>
          <div className="flex gap-2">
            {slides.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownloadSlides}
                className="text-xs h-8 text-black hover:bg-gray-100"
                title="Download as Markdown"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onGenerateSlides}
              disabled={isGeneratingSlides}
              className="text-xs h-8 bg-black text-white hover:bg-gray-800 hover:text-white border-none"
            >
              {isGeneratingSlides ? <Loader2 className="h-3 w-3 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </div>
        
        {slides.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
                {slides.map((slide, i) => (
                    <div key={i} className="aspect-video bg-white rounded border border-gray-200 p-2 overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-sm">
                        <h4 className="text-[10px] font-bold text-black truncate">{slide.title}</h4>
                        <ul className="mt-1 space-y-0.5">
                            {slide.bullets.slice(0,3).map((b: string, j: number) => (
                                <li key={j} className="text-[8px] text-gray-600 truncate">• {b}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300 rounded bg-white">
                No slides generated
            </div>
        )}
      </section>
    </div>
  );
}
