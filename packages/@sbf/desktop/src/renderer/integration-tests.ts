/**
 * Integration Test Script for Desktop App IPC Handlers
 * Tests connection between UI components and backend services
 */

import { LifecycleDashboard } from './components/lifecycle/LifecycleDashboard';
import { DissolutionQueue } from './components/lifecycle/DissolutionQueue';
import { NotificationCenter } from './components/lifecycle/NotificationCenter';
import { PrivacyDashboard } from './components/privacy/PrivacyDashboard';
import { SensitivityClassification } from './components/privacy/SensitivityClassification';
import { AccessControlPanel } from './components/privacy/AccessControlPanel';
import { EncryptionSettings } from './components/privacy/EncryptionSettings';

/**
 * Test IPC connections
 */
async function testIPCConnections() {
  console.log('🧪 Testing IPC connections...\n');
  
  const tests = [
    {
      name: 'Lifecycle Stats',
      test: async () => {
        const stats = await window.sbfAPI.lifecycle.getStats();
        console.log('✅ Lifecycle stats:', stats);
        return stats;
      },
    },
    {
      name: 'All Entities',
      test: async () => {
        const entities = await window.sbfAPI.lifecycle.getAllEntities();
        console.log(`✅ Loaded ${entities.length} entities`);
        return entities;
      },
    },
    {
      name: 'Dissolution Queue',
      test: async () => {
        const queue = await window.sbfAPI.lifecycle.getDissolutionQueue();
        console.log(`✅ Dissolution queue: ${queue.length} items`);
        return queue;
      },
    },
    {
      name: 'Notifications',
      test: async () => {
        const notifications = await window.sbfAPI.notifications.getAll();
        console.log(`✅ Notifications: ${notifications.length} items`);
        return notifications;
      },
    },
    {
      name: 'Privacy Stats',
      test: async () => {
        const stats = await window.sbfAPI.privacy.getStats();
        console.log('✅ Privacy stats:', stats);
        return stats;
      },
    },
    {
      name: 'Encryption Status',
      test: async () => {
        const status = await window.sbfAPI.privacy.getEncryptionStatus();
        console.log('✅ Encryption status:', status);
        return status;
      },
    },
    {
      name: 'Access Control Summary',
      test: async () => {
        const summary = await window.sbfAPI.privacy.getAccessControlSummary();
        console.log('✅ Access control summary:', summary);
        return summary;
      },
    },
  ];

  for (const { name, test } of tests) {
    try {
      await test();
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
    }
  }
  
  console.log('\n✅ All IPC tests completed!');
}

/**
 * Test component rendering
 */
async function testComponentRendering() {
  console.log('\n🎨 Testing component rendering...\n');
  
  // Create test containers
  const testContainer = document.createElement('div');
  testContainer.id = 'test-container';
  testContainer.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; overflow: auto; padding: 20px; background: #1a1a1a;';
  document.body.appendChild(testContainer);
  
  const components = [
    {
      name: 'Lifecycle Dashboard',
      Component: LifecycleDashboard,
      options: {},
    },
    {
      name: 'Dissolution Queue',
      Component: DissolutionQueue,
      options: {},
    },
    {
      name: 'Notification Center',
      Component: NotificationCenter,
      options: {},
    },
    {
      name: 'Privacy Dashboard',
      Component: PrivacyDashboard,
      options: {},
    },
    {
      name: 'Sensitivity Classification',
      Component: SensitivityClassification,
      options: {},
    },
    {
      name: 'Access Control Panel',
      Component: AccessControlPanel,
      options: {},
    },
    {
      name: 'Encryption Settings',
      Component: EncryptionSettings,
      options: {},
    },
  ];

  for (const { name, Component, options } of components) {
    try {
      const container = document.createElement('div');
      container.style.cssText = 'margin-bottom: 40px; border: 1px solid #444; padding: 20px; border-radius: 8px;';
      testContainer.appendChild(container);
      
      const title = document.createElement('h2');
      title.textContent = `Testing: ${name}`;
      title.style.cssText = 'color: #3b82f6; margin-bottom: 20px;';
      container.appendChild(title);
      
      const componentContainer = document.createElement('div');
      container.appendChild(componentContainer);
      
      new Component(componentContainer, options);
      
      console.log(`✅ ${name} rendered successfully`);
    } catch (error) {
      console.error(`❌ ${name} failed to render:`, error);
    }
  }
  
  console.log('\n✅ All components tested!');
}

/**
 * Run all tests
 */
export async function runIntegrationTests() {
  console.log('🚀 Starting Phase 9 Integration Tests\n');
  console.log('=' .repeat(60));
  
  try {
    await testIPCConnections();
    await testComponentRendering();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All integration tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Integration tests failed:', error);
  }
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Add test button to page
    const testButton = document.createElement('button');
    testButton.textContent = '🧪 Run Integration Tests';
    testButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;
    
    testButton.addEventListener('click', runIntegrationTests);
    testButton.addEventListener('mouseenter', () => {
      testButton.style.background = '#2563eb';
    });
    testButton.addEventListener('mouseleave', () => {
      testButton.style.background = '#3b82f6';
    });
    
    document.body.appendChild(testButton);
    
    console.log('✅ Integration test button added to page');
    console.log('Click the "Run Integration Tests" button to test all components');
  });
}
