/**
 * ModelSelector - Dropdown to select AI model for chat
 */
'use client';

import { useState, useEffect } from 'react';
import { Bot, ChevronDown, Zap, Shield, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { modelsApi, Model } from '@/lib/api/models';

interface ModelSelectorProps {
  value?: string;
  onChange: (modelId: string) => void;
  type?: 'language' | 'embedding';
  showPrivacyBadge?: boolean;
  className?: string;
}

export function ModelSelector({
  value,
  onChange,
  type = 'language',
  showPrivacyBadge = true,
  className,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await modelsApi.listModels(type);
        setModels(data);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModels();
  }, [type]);

  const selectedModel = models.find((m) => m.id === value);

  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    const provider = model.provider;
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  const providerOrder = ['openai', 'anthropic', 'google', 'groq', 'mistral', 'together', 'ollama'];
  const sortedProviders = Object.keys(modelsByProvider).sort(
    (a, b) => providerOrder.indexOf(a) - providerOrder.indexOf(b)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={className}
          disabled={isLoading}
        >
          <Bot className="h-4 w-4 mr-2" />
          {isLoading ? (
            'Loading...'
          ) : selectedModel ? (
            <span className="flex items-center gap-2">
              {selectedModel.name}
              {showPrivacyBadge && selectedModel.isLocal && (
                <Shield className="h-3 w-3 text-green-600" />
              )}
            </span>
          ) : (
            'Select model'
          )}
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        {sortedProviders.map((provider, index) => (
          <div key={provider}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="capitalize text-xs text-gray-500">
              {provider}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {modelsByProvider[provider].map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onChange(model.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    {model.description && (
                      <span className="text-xs text-gray-500 truncate max-w-[180px]">
                        {model.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {model.supportsStreaming && (
                      <Zap className="h-3 w-3 text-yellow-500" aria-label="Supports streaming" />
                    )}
                    {model.isLocal ? (
                      <Shield className="h-3 w-3 text-green-600" aria-label="Local/Private" />
                    ) : (
                      <Cloud className="h-3 w-3 text-blue-500" aria-label="Cloud" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </div>
        ))}

        {models.length === 0 && !isLoading && (
          <div className="px-2 py-4 text-center text-sm text-gray-500">
            No models available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ModelSelector;
