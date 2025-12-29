/**
 * Models Settings Page - Configure default AI models
 */
'use client';

import { useEffect, useState } from 'react';
import { Bot, Check, TestTube, Loader2, Zap, Shield, Cloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { modelsApi, Model, DefaultModels } from '@/lib/api/models';

export default function ModelsSettingsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [defaults, setDefaults] = useState<DefaultModels | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Say hello in 10 words or less.');
  const [testModelId, setTestModelId] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelsData, defaultsData] = await Promise.all([
          modelsApi.listModels(),
          modelsApi.getDefaults(),
        ]);
        setModels(modelsData);
        setDefaults(defaultsData);
        if (modelsData.length > 0) {
          setTestModelId(modelsData[0].id);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
        // Use mock data for now
        setDefaults({
          default_chat_model: '',
          default_transformation_model: '',
          default_embedding_model: '',
          default_tts_model: '',
          default_stt_model: '',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDefaultChange = (key: keyof DefaultModels, value: string) => {
    setDefaults((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleSave = async () => {
    if (!defaults) return;

    setIsSaving(true);
    try {
      await modelsApi.updateDefaults(defaults);
      toast({
        title: 'Settings saved',
        description: 'Your model preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: 'Could not update model preferences.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestModel = async () => {
    if (!testModelId || !testPrompt) return;

    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await modelsApi.testModel(testModelId, testPrompt);
      setTestResult(result.response);
      toast({
        title: 'Test complete',
        description: `Response received in ${result.latency}ms using ${result.tokens} tokens.`,
      });
    } catch (error) {
      toast({
        title: 'Test failed',
        description: error instanceof Error ? error.message : 'Model test failed.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const modelsByType = (type: string) => models.filter((m) => m.type === type);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Default Models Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Default Models
          </CardTitle>
          <CardDescription>
            Configure which AI models are used by default for different tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chat Model */}
          <div className="space-y-2">
            <Label>Chat Model</Label>
            <Select
              value={defaults?.default_chat_model || ''}
              onValueChange={(v) => handleDefaultChange('default_chat_model', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {modelsByType('language').map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                      {model.isLocal && (
                        <Shield className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Used for chat conversations and RAG queries.
            </p>
          </div>

          {/* Transformation Model */}
          <div className="space-y-2">
            <Label>Transformation Model</Label>
            <Select
              value={defaults?.default_transformation_model || ''}
              onValueChange={(v) =>
                handleDefaultChange('default_transformation_model', v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {modelsByType('language').map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Used for summaries, insights, and other content transformations.
            </p>
          </div>

          {/* Embedding Model */}
          <div className="space-y-2">
            <Label>Embedding Model</Label>
            <Select
              value={defaults?.default_embedding_model || ''}
              onValueChange={(v) =>
                handleDefaultChange('default_embedding_model', v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {modelsByType('embedding').map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Used for semantic search and vector indexing.
            </p>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Model Test Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Model
          </CardTitle>
          <CardDescription>
            Test a model with a simple prompt to verify it&apos;s working.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={testModelId} onValueChange={setTestModelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model to test" />
              </SelectTrigger>
              <SelectContent>
                {models
                  .filter((m) => m.type === 'language')
                  .map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Test Prompt</Label>
            <Input
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a test prompt..."
            />
          </div>

          <Button
            onClick={handleTestModel}
            disabled={isTesting || !testModelId || !testPrompt}
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Test
              </>
            )}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-500 mb-2 block">Response:</Label>
              <p className="text-sm">{testResult}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Models List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
          <CardDescription>
            Models available for use in your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No models available. Configure API keys to enable models.
            </p>
          ) : (
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-gray-500">
                      {model.provider} · {model.type}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.supportsStreaming && (
                      <Zap
                        className="h-4 w-4 text-yellow-500"
                        aria-label="Supports streaming"
                      />
                    )}
                    {model.isLocal ? (
                      <Badge variant="success" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Local
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Cloud className="h-3 w-3 mr-1" />
                        Cloud
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
