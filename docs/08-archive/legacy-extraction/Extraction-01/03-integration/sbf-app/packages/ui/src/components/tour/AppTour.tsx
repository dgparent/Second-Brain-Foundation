/**
 * Interactive App Tour Component
 * 
 * Guided tour for first-time users using react-joyride
 */

import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, Step, STATUS, EVENTS } from 'react-joyride';

export interface AppTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
  run?: boolean;
}

export const AppTour: React.FC<AppTourProps> = ({
  onComplete,
  onSkip,
  run = false,
}) => {
  const [runTour, setRunTour] = useState(run);

  useEffect(() => {
    setRunTour(run);
  }, [run]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">👋 Welcome to Second Brain Foundation!</h2>
          <p>Let's take a quick tour to help you get started with organizing your knowledge.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="chat-interface"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">💬 Chat Interface</h3>
          <p>Ask questions about your notes or request organization actions. The AI assistant will help you create entities and manage relationships.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="message-input"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">✍️ Ask Anything</h3>
          <p>Try: "What projects am I working on?" or "Create a new project entity for my research"</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="sidebar-tabs"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">📋 Sidebar Tabs</h3>
          <p>Switch between the Queue (pending actions) and Entities (your knowledge graph)</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="queue-panel"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">⏳ Organization Queue</h3>
          <p>Review AI suggestions before they're applied to your vault. Approve or reject each action.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="entity-browser"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">🗂️ Entity Browser</h3>
          <p>Browse and manage all your knowledge entities: People, Places, Topics, and Projects.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="settings-button"]',
      content: (
        <div>
          <h3 className="font-bold mb-1">⚙️ Settings</h3>
          <p>Configure your vault path, AI provider, and other preferences anytime.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-lg font-bold mb-2">🎉 You're All Set!</h2>
          <p className="mb-3">You now know the basics. Start capturing your thoughts and let the AI help organize them!</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tip: You can restart this tour anytime from the Help menu.
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      
      if (status === STATUS.FINISHED) {
        onComplete?.();
      } else if (status === STATUS.SKIPPED) {
        onSkip?.();
      }
    }

    // Handle close button click
    if (type === EVENTS.TOUR_END && status === STATUS.SKIPPED) {
      onSkip?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 14,
        },
        tooltipContent: {
          padding: '12px 4px',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          borderRadius: 6,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 8,
        },
        buttonSkip: {
          color: '#6b7280',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

export default AppTour;
