/**
 * Settings Panel Component
 * 
 * Comprehensive settings interface with tabs for:
 * - General settings
 * - AI Provider configuration
 * - Advanced options
 * - About/Help
 */

import React, { useState } from 'react';

export interface AppSettings {
  vaultPath: string;
  defaultView: 'chat' | 'entities';
  theme: 'light' | 'dark' | 'system';
  aiProvider: 'openai' | 'anthropic' | 'ollama';
  apiKey?: string;
  model: string;
  ollamaUrl?: string;
  autoApproveQueue: boolean;
  debugMode: boolean;
}

export interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

type Tab = 'general' | 'ai-provider' | 'advanced' | 'about';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings: initialSettings,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    // Simulate API test (replace with actual test)
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        message: 'Connection successful! ✅',
      });
    }, 1500);
  };

  // Tab: General
  const renderGeneral = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          General Settings
        </h3>
      </div>

      {/* Vault Path */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Vault Location
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.vaultPath}
            onChange={(e) => updateSetting('vaultPath', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Browse
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The folder where your markdown files are stored
        </p>
      </div>

      {/* Default View */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default View
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateSetting('defaultView', 'chat')}
            className={`p-4 border-2 rounded-lg transition-colors text-left ${
              settings.defaultView === 'chat'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-1">💬</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">Chat</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Start with conversation
            </div>
          </button>
          
          <button
            onClick={() => updateSetting('defaultView', 'entities')}
            className={`p-4 border-2 rounded-lg transition-colors text-left ${
              settings.defaultView === 'entities'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-1">📚</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">Entities</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Browse knowledge graph
            </div>
          </button>
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['light', 'dark', 'system'].map((theme) => (
            <button
              key={theme}
              onClick={() => updateSetting('theme', theme as AppSettings['theme'])}
              className={`p-3 border-2 rounded-lg transition-colors capitalize ${
                settings.theme === theme
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="text-xl mb-1">
                  {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {theme}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Tab: AI Provider
  const renderAIProvider = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          AI Provider Configuration
        </h3>
      </div>

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          AI Provider
        </label>
        <div className="space-y-3">
          {[
            { value: 'openai', label: 'OpenAI', icon: '🤖', desc: 'GPT-4 Turbo' },
            { value: 'anthropic', label: 'Anthropic', icon: '🧠', desc: 'Claude 3.5 Sonnet' },
            { value: 'ollama', label: 'Ollama', icon: '🔒', desc: 'Local AI' },
          ].map((provider) => (
            <button
              key={provider.value}
              onClick={() => updateSetting('aiProvider', provider.value as AppSettings['aiProvider'])}
              className={`w-full p-4 border-2 rounded-lg transition-colors text-left flex items-center gap-3 ${
                settings.aiProvider === provider.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="text-2xl">{provider.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {provider.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {provider.desc}
                </div>
              </div>
              {settings.aiProvider === provider.value && (
                <div className="text-blue-600 dark:text-blue-400">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* API Key (for cloud providers) */}
      {(settings.aiProvider === 'openai' || settings.aiProvider === 'anthropic') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey || ''}
              onChange={(e) => updateSetting('apiKey', e.target.value)}
              placeholder={settings.aiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showApiKey ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your API key is stored securely on your device
          </p>
        </div>
      )}

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Model
        </label>
        <select
          value={settings.model}
          onChange={(e) => updateSetting('model', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {settings.aiProvider === 'openai' && (
            <>
              <option value="gpt-4-turbo-preview">GPT-4 Turbo (Recommended)</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, cheaper)</option>
            </>
          )}
          {settings.aiProvider === 'anthropic' && (
            <>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
              <option value="claude-3-opus-20240229">Claude 3 Opus (Most capable)</option>
              <option value="claude-3-haiku-20240307">Claude 3 Haiku (Fastest)</option>
            </>
          )}
          {settings.aiProvider === 'ollama' && (
            <>
              <option value="llama3.2:latest">Llama 3.2 (Recommended)</option>
              <option value="mistral:latest">Mistral</option>
              <option value="phi3:latest">Phi-3</option>
            </>
          )}
        </select>
      </div>

      {/* Ollama URL */}
      {settings.aiProvider === 'ollama' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ollama URL
          </label>
          <input
            type="text"
            value={settings.ollamaUrl || 'http://localhost:11434'}
            onChange={(e) => updateSetting('ollamaUrl', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Test Connection */}
      <div className="pt-4">
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="w-full px-4 py-2 border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        {testResult && (
          <div className={`mt-3 p-3 rounded-lg ${
            testResult.success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );

  // Tab: Advanced
  const renderAdvanced = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Advanced Settings
        </h3>
      </div>

      {/* Auto-Approve Queue */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Auto-Approve Queue Items
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatically approve AI organization suggestions
          </p>
        </div>
        <button
          onClick={() => updateSetting('autoApproveQueue', !settings.autoApproveQueue)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.autoApproveQueue ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.autoApproveQueue ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Debug Mode */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Debug Mode
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Show detailed logs in console
          </p>
        </div>
        <button
          onClick={() => updateSetting('debugMode', !settings.debugMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.debugMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.debugMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Cache Management */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Cache Management
        </h4>
        <div className="space-y-3">
          <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="font-medium text-gray-900 dark:text-gray-100">Clear AI Cache</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Remove cached AI responses
            </div>
          </button>
          
          <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
            <div className="font-medium text-gray-900 dark:text-gray-100">Rebuild Index</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Re-index all entities
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 border-t border-red-200 dark:border-red-900">
        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
          Danger Zone
        </h4>
        <button className="w-full px-4 py-2 border-2 border-red-600 text-red-600 dark:border-red-400 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          Reset All Settings
        </button>
      </div>
    </div>
  );

  // Tab: About
  const renderAbout = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🧠</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Second Brain Foundation
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Version 2.0.0-alpha</p>
      </div>

      <div className="space-y-4 pt-4">
        <a
          href="#"
          className="block p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">📚</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">Documentation</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                User guides and tutorials
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </div>
        </a>

        <a
          href="#"
          className="block p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">🐛</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">Report an Issue</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Found a bug? Let us know
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </div>
        </a>

        <a
          href="#"
          className="block p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">💬</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">Community</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Join discussions
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </div>
        </a>

        <a
          href="#"
          className="block p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚖️</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">License</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                MIT License
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </div>
        </a>
      </div>

      <div className="pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Made with ❤️ by the SBF Team
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-1">
              {[
                { id: 'general', label: 'General', icon: '⚙️' },
                { id: 'ai-provider', label: 'AI Provider', icon: '🤖' },
                { id: 'advanced', label: 'Advanced', icon: '🔧' },
                { id: 'about', label: 'About', icon: 'ℹ️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && renderGeneral()}
            {activeTab === 'ai-provider' && renderAIProvider()}
            {activeTab === 'advanced' && renderAdvanced()}
            {activeTab === 'about' && renderAbout()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            {hasChanges && (
              <span className="text-sm text-orange-600 dark:text-orange-400">
                • Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
