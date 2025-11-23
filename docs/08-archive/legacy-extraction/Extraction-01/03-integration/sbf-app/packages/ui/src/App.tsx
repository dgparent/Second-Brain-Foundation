/**
 * Main App Component
 * 
 * Integrates chat interface with organization queue
 */

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ChatContainer } from './components/ChatContainer';
import { QueuePanel, QueueItemData } from './components/QueuePanel';
import { EntityBrowser } from './components/entities/EntityBrowser';
import { MessageProps } from './components/ChatMessage';
import { OnboardingWizard, OnboardingConfig } from './components/onboarding/OnboardingWizard';
import { SettingsPanel, AppSettings } from './components/settings/SettingsPanel';
import { AppTour } from './components/tour/AppTour';
import { apiClient } from './api/client';
import { getUserFriendlyError, getErrorToastMessage } from './utils/user-friendly-errors';

export const App: React.FC = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItemData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'queue' | 'entities'>('queue');
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    vaultPath: 'C:\\!Projects\\SecondBrainFoundation\\vault',
    defaultView: 'chat',
    theme: 'system',
    aiProvider: 'openai',
    model: 'gpt-4-turbo-preview',
    autoApproveQueue: false,
    debugMode: false,
  });

  // Handle wikilink clicks
  const handleWikilinkClick = (entityName: string) => {
    setSelectedEntityName(entityName);
    setSidebarTab('entities');
    setShowSidebar(true);
  };

  // Check if we need to show onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('sbf-onboarding-complete');
    const hasCompletedTour = localStorage.getItem('sbf-tour-complete');
    const savedSettings = localStorage.getItem('sbf-settings');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    } else {
      initializeApp(settings);
      
      // Show tour after onboarding is complete (first time only)
      if (!hasCompletedTour) {
        setTimeout(() => {
          setRunTour(true);
        }, 1000);
      }
    }
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = (config: OnboardingConfig) => {
    const newSettings: AppSettings = {
      ...settings,
      vaultPath: config.vaultPath,
      aiProvider: config.aiProvider,
      apiKey: config.apiKey,
      model: config.model,
      ollamaUrl: config.ollamaUrl,
    };
    
    setSettings(newSettings);
    localStorage.setItem('sbf-settings', JSON.stringify(newSettings));
    localStorage.setItem('sbf-onboarding-complete', 'true');
    setShowOnboarding(false);
    initializeApp(newSettings);
  };

  // Initialize the backend service
  const initializeApp = async (appSettings: AppSettings) => {
    try {

  // Initialize the backend service
  const initializeApp = async (appSettings: AppSettings) => {
    try {
      const result = await apiClient.initialize({
        vaultPath: appSettings.vaultPath,
        agentConfig: {
          userId: 'default-user',
          llmProvider: appSettings.aiProvider,
          openaiApiKey: appSettings.aiProvider === 'openai' ? appSettings.apiKey : undefined,
          anthropicApiKey: appSettings.aiProvider === 'anthropic' ? appSettings.apiKey : undefined,
          model: appSettings.model,
        },
        autoStartWatcher: true,
      });

      if (result.success) {
        setInitialized(true);
        setError(null);
        toast.success('✅ Second Brain Foundation initialized successfully!');
        
        // Start polling for queue updates
        loadQueue();
      } else {
        const errorMsg = result.error || 'Failed to initialize';
        const friendlyError = getUserFriendlyError(errorMsg);
        setError(friendlyError.message);
        toast.error(`❌ ${friendlyError.title}`);
      }
    } catch (err) {
      const friendlyError = getUserFriendlyError(err as Error);
      setError(friendlyError.message);
      toast.error(getErrorToastMessage(err as Error));
    }
  };

  // Handle settings update
  const handleSettingsUpdate = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('sbf-settings', JSON.stringify(newSettings));
    setShowSettings(false);
    toast.success('Settings updated successfully!');
    
    // Re-initialize if critical settings changed
    if (
      newSettings.vaultPath !== settings.vaultPath ||
      newSettings.aiProvider !== settings.aiProvider ||
      newSettings.apiKey !== settings.apiKey
    ) {
      setInitialized(false);
      initializeApp(newSettings);
    }
  };

  // Poll queue items
  const loadQueue = async () => {
    try {
      const result = await apiClient.getQueueItems();
      if (result.success && result.items) {
        setQueueItems(result.items.map(item => ({
          id: item.id,
          fileName: item.event.path,
          action: item.processingResult?.action || 'unknown',
          reason: item.processingResult?.reason || 'No reason',
          status: item.status,
          timestamp: item.addedAt,
        })));
      }
    } catch (err) {
      console.error('Error loading queue:', err);
    }
  };

  // Poll queue every 2 seconds
  useEffect(() => {
    if (!initialized) return;

    const interval = setInterval(loadQueue, 2000);
    return () => clearInterval(interval);
  }, [initialized]);

  const handleSendMessage = async (message: string) => {
    setIsProcessing(true);

    try {
      const result = await apiClient.sendMessage(message);

      if (result.success && result.response) {
        // Add assistant messages
        result.response.messages
          .filter(msg => msg.role === 'assistant')
          .forEach(msg => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: msg.content,
              timestamp: Date.now(),
            }]);
          });
      } else {
        const friendlyError = getUserFriendlyError(result.error || 'Failed to send message');
        toast.error(`❌ ${friendlyError.title}`);
      }
    } catch (error) {
      toast.error(getErrorToastMessage(error as Error));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.approveQueueItem(id);
      toast.success('✅ Item approved');
      await loadQueue();
    } catch (err) {
      toast.error(getErrorToastMessage(err as Error));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.rejectQueueItem(id);
      toast.success('✅ Item rejected');
      await loadQueue();
    } catch (err) {
      toast.error(getErrorToastMessage(err as Error));
    }
  };

  const handleApproveAll = async () => {
    const pending = queueItems.filter(item => item.status === 'pending');
    if (pending.length === 0) {
      toast('ℹ️ No pending items to approve');
      return;
    }
    
    const loadingToast = toast.loading(`Approving ${pending.length} items...`);
    try {
      for (const item of pending) {
        await apiClient.approveQueueItem(item.id);
      }
      toast.success(`✅ ${pending.length} items approved`, { id: loadingToast });
      await loadQueue();
    } catch (err) {
      toast.error(`❌ Error approving items`, { id: loadingToast });
    }
  };

  // Show onboarding
  if (showOnboarding) {
    return (
      <>
        <Toaster position="top-right" />
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={() => {
            localStorage.setItem('sbf-onboarding-complete', 'true');
            setShowOnboarding(false);
            initializeApp(settings);
          }}
        />
      </>
    );
  }

  // Show initialization error with better messaging
  if (error && !initialized) {
    const friendlyError = getUserFriendlyError(error);
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {friendlyError.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{friendlyError.message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setShowOnboarding(true);
                setError(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Run Setup Again
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Check Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🧠</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Initializing Second Brain Foundation...
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Setting up agent and file watcher
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* App Tour */}
      <AppTour
        run={runTour}
        onComplete={() => {
          localStorage.setItem('sbf-tour-complete', 'true');
          setRunTour(false);
        }}
        onSkip={() => {
          localStorage.setItem('sbf-tour-complete', 'true');
          setRunTour(false);
        }}
      />

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Error Banner (legacy - can be removed since we have toasts) */}
      {error && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-white">✕</button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 ${showSidebar ? 'mr-96' : ''} transition-all`}>
        <ChatContainer
          initialMessages={messages}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          onWikilinkClick={handleWikilinkClick}
          onSettingsClick={() => setShowSettings(true)}
        />
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div className="fixed right-0 top-0 bottom-0 w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col">
          {/* Toggle Button */}
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 left-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
            aria-label="Hide sidebar"
          >
            ✕
          </button>

          {/* Tab Buttons */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" data-tour="sidebar-tabs">
            <button
              onClick={() => setSidebarTab('queue')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'queue'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Queue
              {queueItems.filter(i => i.status === 'pending').length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full">
                  {queueItems.filter(i => i.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSidebarTab('entities')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'entities'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Entities
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {sidebarTab === 'queue' ? (
              <div className="p-4 h-full overflow-y-auto">
                <QueuePanel
                  items={queueItems}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onApproveAll={handleApproveAll}
                />
              </div>
            ) : (
              <EntityBrowser onEntitySelect={(entityName) => setSelectedEntityName(entityName)} />
            )}
          </div>
        </div>
      )}

      {/* Show Sidebar Button (when hidden) */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed right-4 top-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>Queue</span>
          {queueItems.filter(i => i.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-800 rounded-full">
              {queueItems.filter(i => i.status === 'pending').length}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default App;
