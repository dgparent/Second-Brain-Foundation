/**
 * Onboarding Wizard Component
 * 
 * Professional multi-step setup wizard for first-time users
 * Replaces browser prompts with guided configuration
 */

import React, { useState } from 'react';

export interface OnboardingConfig {
  vaultPath: string;
  aiProvider: 'openai' | 'anthropic' | 'ollama';
  apiKey?: string;
  model: string;
  ollamaUrl?: string;
}

export interface OnboardingWizardProps {
  onComplete: (config: OnboardingConfig) => void;
  onSkip?: () => void;
}

type Step = 'welcome' | 'vault' | 'provider' | 'api-key' | 'success';

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState<Step>('welcome');
  const [config, setConfig] = useState<Partial<OnboardingConfig>>({
    aiProvider: 'openai',
    model: 'gpt-4-turbo-preview',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customVaultPath, setCustomVaultPath] = useState('');

  const steps: Step[] = ['welcome', 'vault', 'provider', 'api-key', 'success'];
  const currentStepIndex = steps.indexOf(step);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  // Validation
  const validateVaultPath = (path: string): boolean => {
    if (!path || path.trim().length === 0) {
      setErrors({ vault: 'Vault path is required' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateApiKey = (key: string): boolean => {
    if (config.aiProvider === 'ollama') return true;
    
    if (!key || key.trim().length === 0) {
      setErrors({ apiKey: 'API key is required' });
      return false;
    }
    if (config.aiProvider === 'openai' && !key.startsWith('sk-')) {
      setErrors({ apiKey: 'OpenAI API keys should start with "sk-"' });
      return false;
    }
    setErrors({});
    return true;
  };

  // Navigation
  const nextStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // Handlers
  const handleVaultSelect = (path: string) => {
    if (validateVaultPath(path)) {
      setConfig({ ...config, vaultPath: path });
      nextStep();
    }
  };

  const handleProviderSelect = (provider: OnboardingConfig['aiProvider']) => {
    const defaultModels = {
      openai: 'gpt-4-turbo-preview',
      anthropic: 'claude-3-5-sonnet-20241022',
      ollama: 'llama3.2:latest',
    };
    
    setConfig({
      ...config,
      aiProvider: provider,
      model: defaultModels[provider],
    });
    nextStep();
  };

  const handleApiKeySubmit = (key: string) => {
    if (validateApiKey(key)) {
      setConfig({ ...config, apiKey: key });
      nextStep();
    }
  };

  const handleFinish = () => {
    if (config.vaultPath && config.aiProvider && config.model) {
      onComplete(config as OnboardingConfig);
    }
  };

  // Step: Welcome
  const renderWelcome = () => (
    <div className="text-center">
      <div className="text-6xl mb-6">🧠</div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Welcome to Second Brain Foundation!
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
        Your AI-augmented personal knowledge management system.
        Let's get you set up in just a few steps.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Capture</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Take notes naturally in markdown
          </p>
        </div>
        
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Organize</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI suggests organization automatically
          </p>
        </div>
        
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-3xl mb-2">🔗</div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Connect</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Build a graph of connected knowledge
          </p>
        </div>
      </div>

      <button
        onClick={nextStep}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
      >
        Get Started →
      </button>
      
      {onSkip && (
        <button
          onClick={onSkip}
          className="ml-4 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Skip setup
        </button>
      )}
    </div>
  );

  // Step: Vault Path
  const renderVaultPath = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Choose Your Vault Location
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Your "vault" is where all your markdown files are stored. This can be a new or existing folder.
      </p>

      <div className="space-y-4 mb-6">
        <button
          onClick={() => handleVaultSelect('C:\\!Projects\\SecondBrainFoundation\\vault')}
          className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">📁</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                Use Default Vault
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                C:\!Projects\SecondBrainFoundation\vault
              </div>
            </div>
            <div className="text-blue-600 dark:text-blue-400">Recommended</div>
          </div>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Vault Path
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customVaultPath}
              onChange={(e) => setCustomVaultPath(e.target.value)}
              placeholder="C:\Users\YourName\Documents\MyVault"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleVaultSelect(customVaultPath)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose
            </button>
          </div>
          {errors.vault && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.vault}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-xl">💡</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Tip:</strong> You can use an existing folder with markdown files, or create a new empty folder. 
            Second Brain Foundation works with any markdown editor like Obsidian or VS Code.
          </div>
        </div>
      </div>
    </div>
  );

  // Step: AI Provider
  const renderProviderSelect = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Choose Your AI Provider
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select which AI service you'd like to use for organization assistance.
      </p>

      <div className="space-y-4">
        <button
          onClick={() => handleProviderSelect('openai')}
          className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                OpenAI (GPT-4)
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Most powerful and reliable. Requires OpenAI API key.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Cost: ~$0.01-0.03 per request • Speed: Fast • Quality: Excellent
              </div>
            </div>
            <div className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Popular →
            </div>
          </div>
        </button>

        <button
          onClick={() => handleProviderSelect('anthropic')}
          className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">🧠</div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                Anthropic (Claude)
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Great for longer context. Requires Anthropic API key.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Cost: ~$0.01-0.03 per request • Speed: Fast • Quality: Excellent
              </div>
            </div>
            <div className="text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Choose →
            </div>
          </div>
        </button>

        <button
          onClick={() => handleProviderSelect('ollama')}
          className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔒</div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                Ollama (Local)
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                100% private, runs on your computer. Requires Ollama installed.
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Cost: Free • Speed: Depends on hardware • Quality: Good
              </div>
            </div>
            <div className="text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Private →
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-xl">ℹ️</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            You can change this later in Settings. All providers work well, choose based on your privacy and budget preferences.
          </div>
        </div>
      </div>
    </div>
  );

  // Step: API Key
  const renderApiKey = () => {
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [showKey, setShowKey] = useState(false);

    if (config.aiProvider === 'ollama') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Ollama Configuration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Make sure Ollama is running on your computer.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ✅ Ollama Setup Checklist
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-mono">1.</span>
                <span>Download Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">ollama.ai</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono">2.</span>
                <span>Install and start Ollama</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono">3.</span>
                <span>Run: <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">ollama pull llama3.2</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono">4.</span>
                <span>Verify it's running at <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">http://localhost:11434</code></span>
              </li>
            </ol>
          </div>

          <button
            onClick={() => handleApiKeySubmit('')}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Continue with Ollama →
          </button>
        </div>
      );
    }

    const providerName = config.aiProvider === 'openai' ? 'OpenAI' : 'Anthropic';
    const keyPrefix = config.aiProvider === 'openai' ? 'sk-' : 'sk-ant-';
    const docsUrl = config.aiProvider === 'openai' 
      ? 'https://platform.openai.com/api-keys'
      : 'https://console.anthropic.com/settings/keys';

    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Enter Your {providerName} API Key
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This key allows Second Brain Foundation to use {providerName}'s AI for organization.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={keyPrefix + '...'}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.apiKey && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.apiKey}</p>
          )}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <div className="text-xl">🔐</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Privacy Note:</strong> Your API key is stored locally on your computer and never sent to our servers. 
              It's only used to communicate directly with {providerName}.
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Don't have an API key?
          </h3>
          <ol className="space-y-1 text-sm text-gray-700 dark:text-gray-300 mb-3">
            <li>1. Visit <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{providerName} API Keys</a></li>
            <li>2. Create a new API key</li>
            <li>3. Copy and paste it here</li>
          </ol>
        </div>

        <button
          onClick={() => handleApiKeySubmit(apiKeyInput)}
          disabled={!apiKeyInput}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    );
  };

  // Step: Success
  const renderSuccess = () => (
    <div className="text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        You're All Set!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Second Brain Foundation is ready to help you organize your knowledge.
      </p>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Start Tips:
        </h3>
        <div className="space-y-3 text-left text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <strong>Chat:</strong> Ask questions like "What am I working on?" or "Create a new project"
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">✅</span>
            <div>
              <strong>Queue:</strong> Review and approve AI organization suggestions
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🔗</span>
            <div>
              <strong>Entities:</strong> Click [[wikilinks]] to explore your knowledge graph
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">⚙️</span>
            <div>
              <strong>Settings:</strong> Change configuration anytime from the gear icon
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleFinish}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-lg font-medium shadow-lg"
      >
        Start Using Second Brain Foundation! 🚀
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          {step !== 'welcome' && step !== 'success' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(progressPercent)}% complete
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
            {step === 'welcome' && renderWelcome()}
            {step === 'vault' && renderVaultPath()}
            {step === 'provider' && renderProviderSelect()}
            {step === 'api-key' && renderApiKey()}
            {step === 'success' && renderSuccess()}
          </div>

          {/* Navigation */}
          {step !== 'welcome' && step !== 'success' && (
            <div className="mt-6 flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← Back
              </button>
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="px-6 py-2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
                >
                  Skip for now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
