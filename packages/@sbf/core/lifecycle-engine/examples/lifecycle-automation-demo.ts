/**
 * Lifecycle Automation Demo
 * Shows how to use the lifecycle automation service
 */

import { LifecycleAutomationService } from '../src/LifecycleAutomationService';

// Example: Initialize and start lifecycle automation
async function setupLifecycleAutomation(
  entityManager: any,
  aiProvider: any
) {
  const automation = new LifecycleAutomationService({
    entityManager,
    aiProvider,
    checkIntervalMinutes: 60,
    enableAutoDissolution: true,
  });

  await automation.initialize();

  automation.on('automation:started', () => {
    console.log('Lifecycle automation started');
  });

  automation.on('automation:dissolution:batch', (results) => {
    console.log(`Dissolved ${results.length} daily notes`);
  });

  automation.start();
  return automation;
}

export { setupLifecycleAutomation };
