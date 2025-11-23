/**
 * Watcher System Usage Examples
 * 
 * Demonstrates how to use the file watcher system for automated organization.
 */

import { createWatcherService, QueueItem } from './watcher-service';
import { Vault } from '../filesystem/vault';
import { EntityFileManager } from '../entities/entity-file-manager';

// ============================================================================
// Example 1: Basic Watcher Setup
// ============================================================================

async function basicWatcherExample() {
  const vault = new Vault('/path/to/vault');
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
    queueConfig: {
      autoApprove: false, // Require manual approval
    },
  });

  // Listen for events
  watcher.on('file-detected', (event) => {
    console.log(`File detected: ${event.type} - ${event.path}`);
  });

  watcher.on('queue-item-added', (item) => {
    console.log(`Added to queue: ${item.processingResult.action}`);
  });

  watcher.on('processing-needed', (item) => {
    console.log(`Processing needed: ${item.id}`);
  });

  // Start watching
  await watcher.start();

  console.log('Watcher is running. Make changes to files in the vault...');

  // Later: stop watching
  // await watcher.stop();
}

// ============================================================================
// Example 2: Auto-Approve Minor Changes
// ============================================================================

async function autoApproveExample() {
  const vault = new Vault('/path/to/vault');
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
    queueConfig: {
      autoApprove: false,
      autoApproveActions: ['update_metadata'], // Auto-approve metadata updates
    },
  });

  watcher.on('queue-item-added', (item) => {
    if (item.status === 'approved') {
      console.log(`Auto-approved: ${item.processingResult.reason}`);
    } else {
      console.log(`Needs approval: ${item.processingResult.reason}`);
    }
  });

  await watcher.start();
}

// ============================================================================
// Example 3: Manual Approval Workflow
// ============================================================================

async function manualApprovalExample() {
  const vault = new Vault('/path/to/vault');
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
  });

  await watcher.start();

  // Check for pending items periodically
  setInterval(() => {
    const pending = watcher.getPendingItems();
    
    if (pending.length > 0) {
      console.log(`\n${pending.length} items need approval:`);
      
      pending.forEach((item, index) => {
        console.log(`${index + 1}. ${item.processingResult.action}: ${item.event.path}`);
        console.log(`   Reason: ${item.processingResult.reason}`);
      });

      // Example: Auto-approve the first item
      // In real app, this would be user-driven
      const firstItem = pending[0];
      watcher.approveItem(firstItem.id);
      console.log(`Approved: ${firstItem.id}`);
    }
  }, 5000);
}

// ============================================================================
// Example 4: Integration with Entity Extraction
// ============================================================================

async function entityExtractionExample() {
  const vault = new Vault('/path/to/vault');
  const entityManager = new EntityFileManager(vault);
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
    queueConfig: {
      autoApproveActions: ['update_metadata'],
    },
    // Handle processing
    onProcessingNeeded: async (item: QueueItem) => {
      try {
        const { action } = item.processingResult;
        const { path: filePath } = item.event;

        console.log(`Processing: ${action} for ${filePath}`);

        switch (action) {
          case 'extract_entities':
            // TODO: Call LLM to extract entities from file
            console.log(`Would extract entities from: ${filePath}`);
            // const entities = await extractEntities(filePath);
            // await createEntities(entities);
            break;

          case 'update_metadata':
            // Update file metadata
            console.log(`Would update metadata for: ${filePath}`);
            break;

          case 'delete_entity':
            // Handle entity deletion
            console.log(`Would handle deletion of: ${filePath}`);
            break;
        }

        // Mark as completed
        watcher.getQueue().markCompleted(item.id);
        
      } catch (error) {
        console.error('Processing error:', error);
        watcher.getQueue().markFailed(item.id, (error as Error).message);
      }
    },
  });

  await watcher.start();
}

// ============================================================================
// Example 5: Queue Management
// ============================================================================

async function queueManagementExample() {
  const vault = new Vault('/path/to/vault');
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
  });

  await watcher.start();

  // Get queue stats
  const stats = watcher.getQueueStats();
  console.log('Queue stats:', stats);

  // Get pending items
  const pending = watcher.getPendingItems();
  console.log(`Pending: ${pending.length}`);

  // Approve all pending items
  if (pending.length > 0) {
    const itemIds = pending.map(item => item.id);
    watcher.approveMultiple(itemIds);
    console.log(`Approved ${itemIds.length} items`);
  }

  // Clear completed items
  setTimeout(() => {
    const cleared = watcher.clearProcessed();
    console.log(`Cleared ${cleared} processed items`);
  }, 10000);
}

// ============================================================================
// Example 6: Error Handling
// ============================================================================

async function errorHandlingExample() {
  const vault = new Vault('/path/to/vault');
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
  });

  // Handle errors
  watcher.on('error', (error) => {
    console.error('Watcher error:', error);
    
    // Could send to error tracking service
    // trackError(error);
  });

  // Handle processing failures
  watcher.on('processing-needed', async (item) => {
    try {
      // Simulate processing
      console.log(`Processing: ${item.id}`);
      
      // Simulate failure
      if (Math.random() < 0.2) {
        throw new Error('Simulated processing failure');
      }

      watcher.getQueue().markCompleted(item.id);
    } catch (error) {
      watcher.getQueue().markFailed(item.id, (error as Error).message);
    }
  });

  await watcher.start();
}

// ============================================================================
// Example 7: Batch Processing
// ============================================================================

async function batchProcessingExample() {
  const vault = new Vault('/path/to/vault');
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
    queueConfig: {
      batchSize: 5, // Process 5 items at a time
    },
  });

  await watcher.start();

  // Process items in batches
  setInterval(async () => {
    const queue = watcher.getQueue();
    const batch = queue.getNextBatch();

    if (batch.length > 0) {
      console.log(`Processing batch of ${batch.length} items`);

      for (const item of batch) {
        queue.markProcessing(item.id);
        
        try {
          // Process item
          await new Promise(resolve => setTimeout(resolve, 100));
          queue.markCompleted(item.id);
        } catch (error) {
          queue.markFailed(item.id, (error as Error).message);
        }
      }
    }
  }, 2000);
}

// ============================================================================
// Example 8: Graceful Shutdown
// ============================================================================

async function gracefulShutdownExample() {
  const vault = new Vault('/path/to/vault');
  
  const watcher = createWatcherService({
    vaultPath: '/path/to/vault',
    vault,
  });

  await watcher.start();

  // Handle shutdown signals
  process.on('SIGINT', async () => {
    console.log('\nShutting down watcher...');
    
    // Stop watcher
    await watcher.stop();
    
    // Save queue state if needed
    const stats = watcher.getQueueStats();
    console.log('Final queue stats:', stats);
    
    process.exit(0);
  });

  console.log('Watcher running. Press Ctrl+C to stop.');
}

// ============================================================================
// Run Examples
// ============================================================================

async function main() {
  console.log('=== Watcher System Examples ===\n');

  // Uncomment to run specific examples:
  
  // await basicWatcherExample();
  // await autoApproveExample();
  // await manualApprovalExample();
  // await entityExtractionExample();
  // await queueManagementExample();
  // await errorHandlingExample();
  // await batchProcessingExample();
  // await gracefulShutdownExample();
}

if (require.main === module) {
  main();
}

export {
  basicWatcherExample,
  autoApproveExample,
  manualApprovalExample,
  entityExtractionExample,
  queueManagementExample,
  errorHandlingExample,
  batchProcessingExample,
  gracefulShutdownExample,
};
