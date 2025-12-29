'use client';

/**
 * Visualization Page
 * 
 * Interactive page for viewing and generating mind maps and knowledge graphs.
 */
import React, { useState, useCallback } from 'react';
import { MindMap } from '@/components/visualization/MindMap';
import { KnowledgeGraph } from '@/components/visualization/KnowledgeGraph';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Network, GitBranch, Sparkles } from 'lucide-react';
import {
  useGenerateMindMap,
  useGenerateKnowledgeGraph,
  transformMindMapResponse,
  transformKnowledgeGraphResponse,
} from '@/hooks/use-visualization';
import type { MindMapData, KnowledgeGraphData } from '@/components/visualization/types';

// =============================================================================
// Demo Data
// =============================================================================

const DEMO_MIND_MAP: MindMapData = {
  id: 'demo-mind-map',
  title: 'Climate Change Overview',
  description: 'A comprehensive overview of climate change topics',
  nodes: [
    { id: 'root', label: 'Climate Change', type: 'root', description: 'Global environmental challenge', parentId: null, childCount: 4, isExpanded: true },
    { id: 'causes', label: 'Causes', type: 'topic', description: 'Factors contributing to climate change', parentId: 'root', childCount: 3, isExpanded: true },
    { id: 'effects', label: 'Effects', type: 'topic', description: 'Impacts of climate change', parentId: 'root', childCount: 3, isExpanded: true },
    { id: 'solutions', label: 'Solutions', type: 'topic', description: 'Ways to address climate change', parentId: 'root', childCount: 3, isExpanded: true },
    { id: 'action', label: 'Taking Action', type: 'topic', description: 'Individual and collective actions', parentId: 'root', childCount: 2, isExpanded: true },
    { id: 'greenhouse', label: 'Greenhouse Gases', type: 'subtopic', description: 'CO2, methane, etc.', parentId: 'causes', childCount: 0, isExpanded: true },
    { id: 'deforestation', label: 'Deforestation', type: 'subtopic', description: 'Loss of forests', parentId: 'causes', childCount: 0, isExpanded: true },
    { id: 'industry', label: 'Industrial Activity', type: 'subtopic', description: 'Manufacturing emissions', parentId: 'causes', childCount: 0, isExpanded: true },
    { id: 'rising-temps', label: 'Rising Temperatures', type: 'subtopic', description: 'Global temperature increase', parentId: 'effects', childCount: 0, isExpanded: true },
    { id: 'sea-level', label: 'Sea Level Rise', type: 'subtopic', description: 'Coastal flooding risk', parentId: 'effects', childCount: 0, isExpanded: true },
    { id: 'weather', label: 'Extreme Weather', type: 'subtopic', description: 'More frequent storms', parentId: 'effects', childCount: 0, isExpanded: true },
    { id: 'renewable', label: 'Renewable Energy', type: 'subtopic', description: 'Solar, wind, hydro', parentId: 'solutions', childCount: 0, isExpanded: true },
    { id: 'policy', label: 'Policy Changes', type: 'subtopic', description: 'Government regulations', parentId: 'solutions', childCount: 0, isExpanded: true },
    { id: 'tech', label: 'Technology', type: 'subtopic', description: 'Carbon capture, EVs', parentId: 'solutions', childCount: 0, isExpanded: true },
    { id: 'individual', label: 'Individual Actions', type: 'subtopic', description: 'Personal choices', parentId: 'action', childCount: 0, isExpanded: true },
    { id: 'community', label: 'Community Efforts', type: 'subtopic', description: 'Local initiatives', parentId: 'action', childCount: 0, isExpanded: true },
  ],
  edges: [
    { id: 'e1', source: 'root', target: 'causes' },
    { id: 'e2', source: 'root', target: 'effects' },
    { id: 'e3', source: 'root', target: 'solutions' },
    { id: 'e4', source: 'root', target: 'action' },
    { id: 'e5', source: 'causes', target: 'greenhouse' },
    { id: 'e6', source: 'causes', target: 'deforestation' },
    { id: 'e7', source: 'causes', target: 'industry' },
    { id: 'e8', source: 'effects', target: 'rising-temps' },
    { id: 'e9', source: 'effects', target: 'sea-level' },
    { id: 'e10', source: 'effects', target: 'weather' },
    { id: 'e11', source: 'solutions', target: 'renewable' },
    { id: 'e12', source: 'solutions', target: 'policy' },
    { id: 'e13', source: 'solutions', target: 'tech' },
    { id: 'e14', source: 'action', target: 'individual' },
    { id: 'e15', source: 'action', target: 'community' },
  ],
};

const DEMO_KNOWLEDGE_GRAPH: KnowledgeGraphData = {
  id: 'demo-knowledge-graph',
  title: 'AI Research Landscape',
  entities: [
    { id: 'openai', name: 'OpenAI', type: 'organization', description: 'AI research company', confidence: 1.0, importance: 0.9 },
    { id: 'google', name: 'Google DeepMind', type: 'organization', description: 'AI research lab', confidence: 1.0, importance: 0.9 },
    { id: 'anthropic', name: 'Anthropic', type: 'organization', description: 'AI safety company', confidence: 1.0, importance: 0.85 },
    { id: 'gpt', name: 'GPT Models', type: 'concept', description: 'Large language models', confidence: 1.0, importance: 0.95 },
    { id: 'transformer', name: 'Transformer Architecture', type: 'concept', description: 'Neural network architecture', confidence: 1.0, importance: 0.9 },
    { id: 'attention', name: 'Attention Mechanism', type: 'concept', description: 'Key innovation in transformers', confidence: 1.0, importance: 0.8 },
    { id: 'rlhf', name: 'RLHF', type: 'concept', description: 'Reinforcement learning from human feedback', confidence: 1.0, importance: 0.75 },
    { id: 'sam', name: 'Sam Altman', type: 'person', description: 'CEO of OpenAI', confidence: 1.0, importance: 0.7 },
    { id: 'dario', name: 'Dario Amodei', type: 'person', description: 'CEO of Anthropic', confidence: 1.0, importance: 0.65 },
    { id: 'vaswani', name: 'Ashish Vaswani', type: 'person', description: 'Transformer paper author', confidence: 1.0, importance: 0.6 },
    { id: 'chatgpt', name: 'ChatGPT Launch', type: 'event', description: 'November 2022 release', confidence: 1.0, importance: 0.85 },
    { id: 'safety', name: 'AI Safety', type: 'topic', description: 'Research on safe AI', confidence: 1.0, importance: 0.8 },
  ],
  relations: [
    { id: 'r1', sourceId: 'openai', targetId: 'gpt', type: 'part_of', label: 'develops' },
    { id: 'r2', sourceId: 'gpt', targetId: 'transformer', type: 'part_of', label: 'based on' },
    { id: 'r3', sourceId: 'transformer', targetId: 'attention', type: 'part_of', label: 'uses' },
    { id: 'r4', sourceId: 'sam', targetId: 'openai', type: 'associated_with', label: 'leads' },
    { id: 'r5', sourceId: 'dario', targetId: 'anthropic', type: 'associated_with', label: 'leads' },
    { id: 'r6', sourceId: 'anthropic', targetId: 'safety', type: 'related_to', label: 'focuses on' },
    { id: 'r7', sourceId: 'openai', targetId: 'chatgpt', type: 'leads_to', label: 'released' },
    { id: 'r8', sourceId: 'gpt', targetId: 'rlhf', type: 'part_of', label: 'trained with' },
    { id: 'r9', sourceId: 'vaswani', targetId: 'transformer', type: 'associated_with', label: 'invented' },
    { id: 'r10', sourceId: 'google', targetId: 'transformer', type: 'associated_with', label: 'originated' },
    { id: 'r11', sourceId: 'anthropic', targetId: 'openai', type: 'related_to', label: 'founded by former' },
  ],
};

// =============================================================================
// Component
// =============================================================================

export default function VisualizationPage() {
  const [activeTab, setActiveTab] = useState<'mind-map' | 'knowledge-graph'>('mind-map');
  const [inputText, setInputText] = useState('');
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(DEMO_MIND_MAP);
  const [knowledgeGraphData, setKnowledgeGraphData] = useState<KnowledgeGraphData | null>(DEMO_KNOWLEDGE_GRAPH);

  const generateMindMap = useGenerateMindMap();
  const generateKnowledgeGraph = useGenerateKnowledgeGraph();

  const handleGenerateMindMap = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      const result = await generateMindMap.mutateAsync({
        text: inputText,
        title: 'Generated Mind Map',
      });
      setMindMapData(transformMindMapResponse(result));
    } catch (error) {
      console.error('Failed to generate mind map:', error);
    }
  }, [inputText, generateMindMap]);

  const handleGenerateKnowledgeGraph = useCallback(async () => {
    if (!inputText.trim()) return;

    try {
      const result = await generateKnowledgeGraph.mutateAsync({
        text: inputText,
        title: 'Generated Knowledge Graph',
      });
      setKnowledgeGraphData(transformKnowledgeGraphResponse(result));
    } catch (error) {
      console.error('Failed to generate knowledge graph:', error);
    }
  }, [inputText, generateKnowledgeGraph]);

  const handleExport = useCallback(
    (format: 'png' | 'svg' | 'pdf' | 'json', data?: string) => {
      if (format === 'json' && data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visualization-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      // Other formats would require canvas/svg export logic
    },
    []
  );

  const isGenerating = generateMindMap.isPending || generateKnowledgeGraph.isPending;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visualizations</h1>
          <p className="text-muted-foreground">
            Generate interactive mind maps and knowledge graphs from your content
          </p>
        </div>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Visualization
          </CardTitle>
          <CardDescription>
            Enter or paste text to generate a mind map or knowledge graph
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text">Content</Label>
            <Textarea
              id="input-text"
              placeholder="Paste your text here to generate a visualization..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateMindMap}
              disabled={!inputText.trim() || isGenerating}
            >
              {generateMindMap.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <GitBranch className="h-4 w-4 mr-2" />
              )}
              Generate Mind Map
            </Button>
            <Button
              onClick={handleGenerateKnowledgeGraph}
              disabled={!inputText.trim() || isGenerating}
              variant="outline"
            >
              {generateKnowledgeGraph.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Network className="h-4 w-4 mr-2" />
              )}
              Generate Knowledge Graph
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="mind-map" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Mind Map
          </TabsTrigger>
          <TabsTrigger value="knowledge-graph" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Knowledge Graph
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mind-map" className="mt-0">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {mindMapData ? (
                <div className="h-[600px]">
                  <MindMap
                    data={mindMapData}
                    onExport={handleExport}
                    showMinimap
                    showControls
                  />
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <GitBranch className="h-12 w-12 mx-auto opacity-50" />
                    <p>No mind map generated yet</p>
                    <p className="text-sm">Enter some text above to generate one</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge-graph" className="mt-0">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {knowledgeGraphData ? (
                <div className="h-[600px]">
                  <KnowledgeGraph
                    data={knowledgeGraphData}
                    onExport={handleExport}
                    showMinimap
                    showControls
                    showDetailPanel
                  />
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Network className="h-12 w-12 mx-auto opacity-50" />
                    <p>No knowledge graph generated yet</p>
                    <p className="text-sm">Enter some text above to generate one</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
