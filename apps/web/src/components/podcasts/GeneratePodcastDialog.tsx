/**
 * Generate Podcast Dialog
 * 
 * Modal dialog for configuring and generating a new podcast from selected sources.
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Mic,
  FileText,
  Settings,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  Volume2,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

export interface Source {
  id: string;
  title: string;
  type: 'document' | 'webpage' | 'note';
  wordCount?: number;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  style: string;
  previewUrl?: string;
  provider: string;
}

export interface PodcastGenerateConfig {
  title?: string;
  sourceIds: string[];
  style: 'conversational' | 'educational' | 'debate';
  targetLength: 'short' | 'medium' | 'long';
  insights?: string[];
  voiceConfig: {
    host1: string;
    host2: string;
  };
  includeBackgroundMusic: boolean;
}

interface GeneratePodcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: Source[];
  onGenerate: (config: PodcastGenerateConfig) => void;
  isGenerating?: boolean;
}

// =============================================================================
// Voice Options
// =============================================================================

const DEFAULT_VOICES: VoiceOption[] = [
  { id: 'alloy', name: 'Alloy', gender: 'neutral', style: 'Balanced, professional', provider: 'openai' },
  { id: 'echo', name: 'Echo', gender: 'male', style: 'Deep, authoritative', provider: 'openai' },
  { id: 'fable', name: 'Fable', gender: 'neutral', style: 'Warm, storytelling', provider: 'openai' },
  { id: 'onyx', name: 'Onyx', gender: 'male', style: 'Deep, resonant', provider: 'openai' },
  { id: 'nova', name: 'Nova', gender: 'female', style: 'Bright, energetic', provider: 'openai' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', style: 'Clear, expressive', provider: 'openai' },
];

// =============================================================================
// Step Components
// =============================================================================

interface Step1SourcesProps {
  sources: Source[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

function Step1Sources({ sources, selectedIds, onToggle }: Step1SourcesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select sources for the podcast</Label>
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} selected
        </span>
      </div>
      
      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {sources.map((source) => {
          const isSelected = selectedIds.includes(source.id);
          return (
            <button
              key={source.id}
              onClick={() => onToggle(source.id)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted'
              )}
            >
              <div className={cn(
                'flex items-center justify-center h-5 w-5 rounded border',
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground'
              )}>
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{source.title}</p>
                {source.wordCount && (
                  <p className="text-xs text-muted-foreground">
                    ~{source.wordCount.toLocaleString()} words
                  </p>
                )}
              </div>
              <Badge variant="outline" className="shrink-0">
                {source.type}
              </Badge>
            </button>
          );
        })}
      </div>
      
      {sources.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No sources available</p>
          <p className="text-sm">Add some documents first to generate a podcast</p>
        </div>
      )}
    </div>
  );
}

interface Step2StyleProps {
  style: PodcastGenerateConfig['style'];
  targetLength: PodcastGenerateConfig['targetLength'];
  onStyleChange: (style: PodcastGenerateConfig['style']) => void;
  onLengthChange: (length: PodcastGenerateConfig['targetLength']) => void;
}

function Step2Style({ style, targetLength, onStyleChange, onLengthChange }: Step2StyleProps) {
  const styles: { value: PodcastGenerateConfig['style']; label: string; description: string }[] = [
    {
      value: 'conversational',
      label: 'Conversational',
      description: 'Two hosts casually discuss the topic, making it easy to follow',
    },
    {
      value: 'educational',
      label: 'Educational',
      description: 'Structured learning format with clear explanations',
    },
    {
      value: 'debate',
      label: 'Debate',
      description: 'Hosts explore different perspectives and challenge ideas',
    },
  ];
  
  const lengths: { value: PodcastGenerateConfig['targetLength']; label: string; duration: string }[] = [
    { value: 'short', label: 'Short', duration: '5-8 minutes' },
    { value: 'medium', label: 'Medium', duration: '10-15 minutes' },
    { value: 'long', label: 'Long', duration: '20-30 minutes' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <div className="space-y-3">
        <Label>Podcast Style</Label>
        <RadioGroup value={style} onValueChange={(v) => onStyleChange(v as any)}>
          <div className="grid gap-2">
            {styles.map((s) => (
              <label
                key={s.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  style === s.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                )}
              >
                <RadioGroupItem value={s.value} className="mt-0.5" />
                <div>
                  <p className="font-medium">{s.label}</p>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>
      
      {/* Length Selection */}
      <div className="space-y-3">
        <Label>Target Length</Label>
        <div className="grid grid-cols-3 gap-2">
          {lengths.map((l) => (
            <button
              key={l.value}
              onClick={() => onLengthChange(l.value)}
              className={cn(
                'p-3 rounded-lg border text-center transition-colors',
                targetLength === l.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted'
              )}
            >
              <p className="font-medium">{l.label}</p>
              <p className="text-xs text-muted-foreground">{l.duration}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Step3VoicesProps {
  host1Voice: string;
  host2Voice: string;
  onHost1Change: (voiceId: string) => void;
  onHost2Change: (voiceId: string) => void;
  includeMusic: boolean;
  onMusicChange: (include: boolean) => void;
}

function Step3Voices({
  host1Voice,
  host2Voice,
  onHost1Change,
  onHost2Change,
  includeMusic,
  onMusicChange,
}: Step3VoicesProps) {
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null);
  
  const playPreview = (voiceId: string) => {
    setPreviewPlaying(voiceId);
    // Simulate preview duration
    setTimeout(() => setPreviewPlaying(null), 2000);
  };
  
  return (
    <div className="space-y-6">
      {/* Host 1 Voice */}
      <div className="space-y-3">
        <Label>Host 1 Voice (Alex)</Label>
        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => onHost1Change(voice.id)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border text-left transition-colors',
                host1Voice === voice.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted',
                host2Voice === voice.id && 'opacity-50'
              )}
              disabled={host2Voice === voice.id}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{voice.name}</p>
                <p className="text-xs text-muted-foreground truncate">{voice.style}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  playPreview(voice.id);
                }}
              >
                {previewPlaying === voice.id ? (
                  <Volume2 className="h-3 w-3 animate-pulse" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </button>
          ))}
        </div>
      </div>
      
      {/* Host 2 Voice */}
      <div className="space-y-3">
        <Label>Host 2 Voice (Jordan)</Label>
        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => onHost2Change(voice.id)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border text-left transition-colors',
                host2Voice === voice.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted',
                host1Voice === voice.id && 'opacity-50'
              )}
              disabled={host1Voice === voice.id}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{voice.name}</p>
                <p className="text-xs text-muted-foreground truncate">{voice.style}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  playPreview(voice.id);
                }}
              >
                {previewPlaying === voice.id ? (
                  <Volume2 className="h-3 w-3 animate-pulse" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </button>
          ))}
        </div>
      </div>
      
      {/* Background Music */}
      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div>
          <p className="font-medium">Background Music</p>
          <p className="text-sm text-muted-foreground">
            Add subtle ambient music to enhance the listening experience
          </p>
        </div>
        <Switch checked={includeMusic} onCheckedChange={onMusicChange} />
      </div>
    </div>
  );
}

interface Step4InsightsProps {
  title: string;
  insights: string[];
  onTitleChange: (title: string) => void;
  onInsightsChange: (insights: string[]) => void;
}

function Step4Insights({ title, insights, onTitleChange, onInsightsChange }: Step4InsightsProps) {
  const [insightText, setInsightText] = useState(insights.join('\n'));
  
  const handleInsightsBlur = () => {
    const parsed = insightText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    onInsightsChange(parsed);
  };
  
  return (
    <div className="space-y-4">
      {/* Custom Title */}
      <div className="space-y-2">
        <Label htmlFor="podcast-title">Podcast Title (optional)</Label>
        <Input
          id="podcast-title"
          placeholder="Leave empty for auto-generated title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      
      {/* Key Insights */}
      <div className="space-y-2">
        <Label htmlFor="insights">Key Insights to Highlight (optional)</Label>
        <Textarea
          id="insights"
          placeholder="Enter key points you want the podcast to cover, one per line..."
          value={insightText}
          onChange={(e) => setInsightText(e.target.value)}
          onBlur={handleInsightsBlur}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          The AI will naturally weave these insights into the conversation
        </p>
      </div>
      
      {/* Preview */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">AI will generate:</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Natural two-host dialogue</li>
                <li>• Engaging introduction and conclusion</li>
                <li>• Key insights woven throughout</li>
                <li>• Professional audio quality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

const STEPS = ['Sources', 'Style', 'Voices', 'Customize'];

export function GeneratePodcastDialog({
  open,
  onOpenChange,
  sources,
  onGenerate,
  isGenerating,
}: GeneratePodcastDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<PodcastGenerateConfig>({
    sourceIds: [],
    style: 'conversational',
    targetLength: 'medium',
    voiceConfig: {
      host1: 'alloy',
      host2: 'echo',
    },
    includeBackgroundMusic: false,
    insights: [],
  });
  
  // Reset on close
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setConfig({
        sourceIds: [],
        style: 'conversational',
        targetLength: 'medium',
        voiceConfig: { host1: 'alloy', host2: 'echo' },
        includeBackgroundMusic: false,
        insights: [],
      });
    }
  }, [open]);
  
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return config.sourceIds.length > 0;
      default:
        return true;
    }
  };
  
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };
  
  const handleGenerate = () => {
    onGenerate(config);
  };
  
  const toggleSource = (id: string) => {
    setConfig((c) => ({
      ...c,
      sourceIds: c.sourceIds.includes(id)
        ? c.sourceIds.filter((sid) => sid !== id)
        : [...c.sourceIds, id],
    }));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Create Podcast
          </DialogTitle>
          <DialogDescription>
            Generate an engaging podcast from your sources
          </DialogDescription>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium transition-colors',
                  i < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : i === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-1',
                    i < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        <div className="py-4 min-h-[300px]">
          {currentStep === 0 && (
            <Step1Sources
              sources={sources}
              selectedIds={config.sourceIds}
              onToggle={toggleSource}
            />
          )}
          {currentStep === 1 && (
            <Step2Style
              style={config.style}
              targetLength={config.targetLength}
              onStyleChange={(s) => setConfig((c) => ({ ...c, style: s }))}
              onLengthChange={(l) => setConfig((c) => ({ ...c, targetLength: l }))}
            />
          )}
          {currentStep === 2 && (
            <Step3Voices
              host1Voice={config.voiceConfig.host1}
              host2Voice={config.voiceConfig.host2}
              onHost1Change={(v) =>
                setConfig((c) => ({ ...c, voiceConfig: { ...c.voiceConfig, host1: v } }))
              }
              onHost2Change={(v) =>
                setConfig((c) => ({ ...c, voiceConfig: { ...c.voiceConfig, host2: v } }))
              }
              includeMusic={config.includeBackgroundMusic}
              onMusicChange={(m) => setConfig((c) => ({ ...c, includeBackgroundMusic: m }))}
            />
          )}
          {currentStep === 3 && (
            <Step4Insights
              title={config.title || ''}
              insights={config.insights || []}
              onTitleChange={(t) => setConfig((c) => ({ ...c, title: t || undefined }))}
              onInsightsChange={(i) => setConfig((c) => ({ ...c, insights: i }))}
            />
          )}
        </div>
        
        {/* Footer */}
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isGenerating}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleGenerate} disabled={isGenerating || !canProceed()}>
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Podcast
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GeneratePodcastDialog;
