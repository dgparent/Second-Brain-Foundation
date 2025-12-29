/**
 * API Keys Settings Page - Manage provider API keys
 */
'use client';

import { useState } from 'react';
import { Key, Plus, Trash2, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface ApiKey {
  id: string;
  provider: string;
  name: string;
  maskedKey: string;
  createdAt: string;
  lastUsed?: string;
}

const providers = [
  { value: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { value: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { value: 'google', label: 'Google AI', placeholder: 'AIza...' },
  { value: 'groq', label: 'Groq', placeholder: 'gsk_...' },
  { value: 'together', label: 'Together AI', placeholder: '' },
  { value: 'mistral', label: 'Mistral', placeholder: '' },
];

export default function ApiKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKeyProvider, setNewKeyProvider] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddKey = async () => {
    if (!newKeyProvider || !newKeyValue) return;

    setIsAdding(true);
    try {
      // Mock adding key - replace with actual API call
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        provider: newKeyProvider,
        name: newKeyName || `${newKeyProvider} Key`,
        maskedKey: maskKey(newKeyValue),
        createdAt: new Date().toISOString(),
      };

      setApiKeys((prev) => [...prev, newKey]);
      setIsAddDialogOpen(false);
      setNewKeyProvider('');
      setNewKeyName('');
      setNewKeyValue('');
      setShowNewKey(false);

      toast({
        title: 'API key added',
        description: `Your ${newKeyProvider} API key has been saved.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to add key',
        description: 'Could not save the API key.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    setDeletingId(keyId);
    try {
      // Mock deleting key - replace with actual API call
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      toast({
        title: 'API key deleted',
        description: 'The API key has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: 'Could not delete the API key.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for AI providers. Keys are encrypted and stored securely.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add API Key</DialogTitle>
                  <DialogDescription>
                    Add an API key for an AI provider. The key will be encrypted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={newKeyProvider} onValueChange={setNewKeyProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Name (optional)</Label>
                    <Input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="My API Key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="relative">
                      <Input
                        type={showNewKey ? 'text' : 'password'}
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder={
                          providers.find((p) => p.value === newKeyProvider)
                            ?.placeholder || 'Enter your API key'
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewKey(!showNewKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddKey}
                    disabled={!newKeyProvider || !newKeyValue || isAdding}
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Key'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No API keys configured</p>
              <p className="text-sm mt-1">
                Add API keys to enable AI models from different providers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Key className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{key.name}</span>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {key.provider}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {key.maskedKey}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      Added {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteKey(key.id)}
                      disabled={deletingId === key.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === key.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Security Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                API keys are encrypted at rest and never exposed in full after initial entry.
                Rotate your keys periodically and never share them publicly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function maskKey(key: string): string {
  if (key.length < 8) return '****';
  return `${key.slice(0, 4)}${'*'.repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`;
}
