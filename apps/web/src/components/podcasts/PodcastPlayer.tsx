/**
 * Podcast Player Component
 * 
 * Full-featured audio player for podcasts with waveform visualization,
 * playback controls, and transcript synchronization.
 */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface PodcastSegment {
  id: string;
  speaker: string;
  text: string;
  startTime?: number;
  endTime?: number;
}

interface PodcastPlayerProps {
  audioUrl: string;
  title: string;
  duration?: number;
  segments?: PodcastSegment[];
  onClose?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
  autoPlay?: boolean;
  compact?: boolean;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// Playback Speed Options
// =============================================================================

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// =============================================================================
// Main Component
// =============================================================================

export function PodcastPlayer({
  audioUrl,
  title,
  duration: initialDuration,
  segments = [],
  onClose,
  onDownload,
  onShare,
  className,
  autoPlay = false,
  compact = false,
}: PodcastPlayerProps) {
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [buffered, setBuffered] = useState(0);
  
  // Controls state
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Transcript state
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  
  // ==========================================================================
  // Audio Event Handlers
  // ==========================================================================
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Update buffered amount
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }
      
      // Find active segment
      if (segments.length > 0) {
        const activeSegment = segments.find(
          (seg) =>
            seg.startTime !== undefined &&
            seg.endTime !== undefined &&
            audio.currentTime >= seg.startTime &&
            audio.currentTime < seg.endTime
        );
        setActiveSegmentId(activeSegment?.id || null);
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [segments]);
  
  // Auto-play
  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [autoPlay, audioUrl]);
  
  // ==========================================================================
  // Playback Controls
  // ==========================================================================
  
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);
  
  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(audio.currentTime);
  }, [duration]);
  
  const skip = useCallback((seconds: number) => {
    seek(currentTime + seconds);
  }, [currentTime, seek]);
  
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  }, [duration, seek]);
  
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);
  
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);
  
  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);
  
  const jumpToSegment = useCallback((segment: PodcastSegment) => {
    if (segment.startTime !== undefined) {
      seek(segment.startTime);
      if (!isPlaying) {
        audioRef.current?.play().catch(() => {});
      }
    }
  }, [seek, isPlaying]);
  
  // ==========================================================================
  // Keyboard Shortcuts
  // ==========================================================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, skip, toggleMute]);
  
  // ==========================================================================
  // Progress Percentage
  // ==========================================================================
  
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;
  
  // ==========================================================================
  // Render
  // ==========================================================================
  
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 bg-card rounded-lg border',
        className
      )}>
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={togglePlayPause}
          className="h-8 w-8 shrink-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {onClose && (
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn(
      'bg-card rounded-lg border shadow-lg',
      isExpanded && 'fixed inset-4 z-50 flex flex-col',
      className
    )}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold truncate">{title}</h3>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className={cn('flex-1 overflow-hidden', isExpanded && 'flex')}>
        {/* Transcript (when expanded) */}
        {isExpanded && segments.length > 0 && (
          <div className="w-1/2 p-4 overflow-y-auto border-r">
            <h4 className="font-medium mb-3">Transcript</h4>
            <div className="space-y-4">
              {segments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => jumpToSegment(segment)}
                  className={cn(
                    'block w-full text-left p-3 rounded-lg transition-colors',
                    activeSegmentId === segment.id
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="font-medium text-sm">{segment.speaker}</span>
                  {segment.startTime !== undefined && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatTime(segment.startTime)}
                    </span>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{segment.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Waveform / Visualization Area */}
        <div className={cn('p-6', isExpanded && 'flex-1 flex flex-col justify-center')}>
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-12 bg-muted rounded-lg cursor-pointer overflow-hidden mb-4"
          >
            {/* Buffered */}
            <div
              className="absolute inset-y-0 left-0 bg-muted-foreground/20"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-primary/50"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-primary"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between text-sm text-muted-foreground mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Volume */}
          <div className="flex items-center gap-2 w-32">
            <Button size="icon" variant="ghost" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
          
          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => skip(-10)}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlayPause}
              className="h-12 w-12 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => skip(10)}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Right: Settings */}
          <div className="flex items-center gap-1 w-32 justify-end">
            {/* Playback Speed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {playbackSpeed}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PLAYBACK_SPEEDS.map((speed) => (
                  <DropdownMenuItem
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={playbackSpeed === speed ? 'bg-accent' : ''}
                  >
                    {speed}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {onDownload && (
                  <DropdownMenuItem onClick={onDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => seek(0)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PodcastPlayer;
