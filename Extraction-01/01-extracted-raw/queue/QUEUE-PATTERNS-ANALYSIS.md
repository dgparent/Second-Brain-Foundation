# Organization Queue Patterns Analysis

**Date:** 2025-11-14  
**Source:** text-generation-webui/Training_PRO extension  
**Purpose:** Extract task queue and batch processing patterns for SBF Organization Queue  
**Status:** Pattern extraction complete

---

## Executive Summary

The Training_PRO extension demonstrates **task queue management** for long-running AI operations:
- Dataset processing queues
- Progress tracking
- Batch operations
- User approval workflows
- Status monitoring

These patterns map directly to **SBF's Organization Queue** for managing AI-suggested entity extractions and file operations.

---

## Core Patterns Extracted

### 1. Task Queue Structure

**Pattern from Training_PRO:**
```python
class TaskQueue:
    def __init__(self):
        self.tasks = []
        self.current_task = None
        self.status = "idle"  # idle, processing, paused, error
        
    def add_task(self, task_data):
        """Add task to queue"""
        task = {
            'id': generate_id(),
            'type': task_data['type'],
            'data': task_data['data'],
            'status': 'pending',
            'progress': 0,
            'created_at': datetime.now(),
        }
        self.tasks.append(task)
        return task['id']
    
    def process_next(self):
        """Process next task in queue"""
        if self.current_task or not self.tasks:
            return
        
        self.current_task = self.tasks.pop(0)
        self.current_task['status'] = 'processing'
        
        try:
            result = self.execute_task(self.current_task)
            self.current_task['status'] = 'completed'
            self.current_task['result'] = result
        except Exception as e:
            self.current_task['status'] = 'error'
            self.current_task['error'] = str(e)
        finally:
            self.current_task = None
```

**SBF Translation:**
```typescript
interface QueueItem {
  id: string;
  type: 'entity_extraction' | 'file_organization' | 'relationship_suggestion';
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'error';
  
  // Original suggestion from AI
  suggestion: {
    entityType?: string;
    name?: string;
    description?: string;
    filePath?: string;
    targetPath?: string;
    relationshipType?: string;
    // ... other fields
  };
  
  // Confidence and reasoning
  confidence: number;  // 0-1
  reasoning: string;
  
  // User action
  userAction?: 'approve' | 'reject' | 'edit';
  userFeedback?: string;
  
  // Metadata
  createdAt: Date;
  processedAt?: Date;
  createdBy: string; // Agent ID
}

class OrganizationQueue {
  private queue: QueueItem[] = [];
  
  async addSuggestion(suggestion: QueueItem): Promise<string> {
    const item: QueueItem = {
      id: generateId(),
      status: 'pending',
      ...suggestion,
      createdAt: new Date(),
    };
    
    this.queue.push(item);
    await this.notifyUI(item);
    
    return item.id;
  }
  
  async getUserDecision(itemId: string): Promise<QueueItem> {
    // Wait for user approval/rejection
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const item = await this.getItem(itemId);
        if (item.status === 'approved' || item.status === 'rejected') {
          clearInterval(checkInterval);
          resolve(item);
        }
      }, 1000);
    });
  }
  
  async approve(itemId: string, edits?: Partial<QueueItem>): Promise<void> {
    const item = await this.getItem(itemId);
    
    // Apply any user edits
    if (edits) {
      Object.assign(item.suggestion, edits);
    }
    
    item.status = 'approved';
    item.userAction = 'approve';
    item.processedAt = new Date();
    
    await this.saveItem(item);
    
    // Execute the approved action
    await this.executeAction(item);
    
    // Send feedback to learning service
    await this.learningService.processFeedback(item, true);
  }
  
  async reject(itemId: string, feedback: string): Promise<void> {
    const item = await this.getItem(itemId);
    
    item.status = 'rejected';
    item.userAction = 'reject';
    item.userFeedback = feedback;
    item.processedAt = new Date();
    
    await this.saveItem(item);
    
    // Send feedback to learning service
    await this.learningService.processFeedback(item, false, feedback);
  }
}
```

---

### 2. Progress Tracking

**Pattern from Training_PRO:**
```python
def update_progress(task_id, current, total, message=""):
    """Update task progress"""
    progress = (current / total) * 100
    
    # Update UI
    gradio.update_progress(progress)
    
    # Store in task
    task = get_task(task_id)
    task['progress'] = progress
    task['progress_message'] = message
    task['updated_at'] = datetime.now()
```

**SBF Translation:**
```typescript
interface ProgressUpdate {
  itemId: string;
  progress: number;      // 0-100
  message: string;
  substep?: string;
}

class QueueProgressTracker {
  private progressCallbacks = new Map<string, (update: ProgressUpdate) => void>();
  
  onProgress(itemId: string, callback: (update: ProgressUpdate) => void): void {
    this.progressCallbacks.set(itemId, callback);
  }
  
  async updateProgress(update: ProgressUpdate): Promise<void> {
    const callback = this.progressCallbacks.get(update.itemId);
    if (callback) {
      callback(update);
    }
    
    // Also persist to database
    await this.db.updateProgress(update);
    
    // Emit WebSocket event for real-time UI update
    this.websocket.emit('queue:progress', update);
  }
}
```

---

### 3. Batch Operations

**Pattern from Training_PRO:**
```python
def batch_process(items, processor_func):
    """Process multiple items with progress tracking"""
    results = []
    total = len(items)
    
    for i, item in enumerate(items):
        update_progress(i, total, f"Processing item {i+1}/{total}")
        
        result = processor_func(item)
        results.append(result)
        
        if user_requested_pause():
            return {
                'status': 'paused',
                'completed': i,
                'results': results
            }
    
    return {
        'status': 'completed',
        'results': results
    }
```

**SBF Translation:**
```typescript
class BatchOperations {
  async approveAll(items: QueueItem[]): Promise<BatchResult> {
    const results: Array<{id: string; success: boolean; error?: string}> = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Update progress
      await this.progressTracker.updateProgress({
        itemId: 'batch_operation',
        progress: (i / items.length) * 100,
        message: `Approving ${i+1}/${items.length}`,
      });
      
      try {
        await this.queue.approve(item.id);
        results.push({ id: item.id, success: true });
      } catch (error) {
        results.push({ 
          id: item.id, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return {
      total: items.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
  
  async rejectAll(items: QueueItem[], feedback: string): Promise<BatchResult> {
    // Similar pattern
  }
}
```

---

### 4. UI Notification Patterns

**Key Insight:** Queue needs real-time UI updates

```typescript
class QueueNotificationService {
  private websocket: WebSocketServer;
  
  async notifyNewItem(item: QueueItem): Promise<void> {
    // Desktop notification
    if (this.desktopEnabled) {
      new Notification('New AI Suggestion', {
        body: `${item.type}: ${item.suggestion.name}`,
        icon: '/icons/queue.png',
      });
    }
    
    // WebSocket to UI
    this.websocket.broadcast('queue:new_item', item);
    
    // Badge count update
    const pendingCount = await this.queue.getPendingCount();
    this.websocket.broadcast('queue:count', { pending: pendingCount });
  }
  
  async notifyProcessed(item: QueueItem): Promise<void> {
    this.websocket.broadcast('queue:item_processed', {
      id: item.id,
      status: item.status,
    });
    
    const pendingCount = await this.queue.getPendingCount();
    this.websocket.broadcast('queue:count', { pending: pendingCount });
  }
}
```

---

## SBF Organization Queue Implementation

### Queue Item Types

**1. Entity Extraction:**
```typescript
interface EntityExtractionItem extends QueueItem {
  type: 'entity_extraction';
  suggestion: {
    entityType: 'person' | 'project' | 'organization' | 'concept';
    name: string;
    description: string;
    sensitivity: SensitivityLevel;
    extractedFrom: string;  // Source file/conversation
    suggestedRelationships?: Array<{
      targetEntity: string;
      relationshipType: string;
    }>;
  };
}
```

**2. File Organization:**
```typescript
interface FileOrganizationItem extends QueueItem {
  type: 'file_organization';
  suggestion: {
    filePath: string;
    currentPath: string;
    suggestedPath: string;
    reasoning: string;
    relatedEntities: string[];
  };
}
```

**3. Relationship Suggestion:**
```typescript
interface RelationshipItem extends QueueItem {
  type: 'relationship_suggestion';
  suggestion: {
    sourceEntity: string;
    targetEntity: string;
    relationshipType: string;
    evidence: string;  // Why AI thinks this relationship exists
  };
}
```

---

### React Components

**QueueContainer.tsx:**
```typescript
export const QueueContainer: React.FC = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  useEffect(() => {
    // Load initial items
    queueService.getItems({ status: filter }).then(setItems);
    
    // Subscribe to real-time updates
    const unsubscribe = queueService.subscribe((update) => {
      setItems(prev => updateItemInList(prev, update));
    });
    
    return unsubscribe;
  }, [filter]);
  
  return (
    <div className="queue-container">
      <QueueHeader 
        pendingCount={items.filter(i => i.status === 'pending').length}
        onFilterChange={setFilter}
      />
      
      <QueueList
        items={items}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
      />
    </div>
  );
};
```

**QueueItem.tsx:**
```typescript
export const QueueItemComponent: React.FC<{item: QueueItem}> = ({ item }) => {
  const [editing, setEditing] = useState(false);
  const [editedValues, setEditedValues] = useState(item.suggestion);
  
  const handleApprove = async () => {
    if (editing) {
      // Approve with edits
      await queueService.approve(item.id, editedValues);
    } else {
      // Approve as-is
      await queueService.approve(item.id);
    }
  };
  
  const handleReject = async () => {
    const feedback = await prompt('Why are you rejecting this suggestion?');
    await queueService.reject(item.id, feedback);
  };
  
  return (
    <div className="queue-item">
      <div className="queue-item-header">
        <span className="item-type">{item.type}</span>
        <span className="confidence">
          Confidence: {(item.confidence * 100).toFixed(0)}%
        </span>
      </div>
      
      <div className="queue-item-content">
        {editing ? (
          <EntityForm
            values={editedValues}
            onChange={setEditedValues}
          />
        ) : (
          <EntityPreview suggestion={item.suggestion} />
        )}
      </div>
      
      <div className="queue-item-reasoning">
        <strong>AI Reasoning:</strong>
        <p>{item.reasoning}</p>
      </div>
      
      <div className="queue-item-actions">
        <button onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel Edit' : 'Edit'}
        </button>
        <button onClick={handleReject} className="reject">
          Reject
        </button>
        <button onClick={handleApprove} className="approve">
          Approve {editing && '(with edits)'}
        </button>
      </div>
    </div>
  );
};
```

---

## Database Schema

```typescript
// Prisma schema
model QueueItem {
  id          String   @id @default(cuid())
  type        String
  status      String
  suggestion  Json
  confidence  Float
  reasoning   String
  
  userAction   String?
  userFeedback String?
  
  createdAt    DateTime @default(now())
  processedAt  DateTime?
  createdBy    String   // Agent ID
  
  @@index([status, createdAt])
}
```

---

## Integration with Agent System

```typescript
// In SBFAgent tools
const extractEntityTool: Tool = {
  name: "extract_entity",
  handler: async (args) => {
    // Add to Organization Queue
    const itemId = await organizationQueue.addSuggestion({
      type: 'entity_extraction',
      suggestion: args,
      confidence: args.confidence || 0.8,
      reasoning: args.reasoning,
      createdBy: agent.id,
    });
    
    // Wait for user decision
    const decision = await organizationQueue.getUserDecision(itemId);
    
    if (decision.status === 'approved') {
      return {
        success: true,
        message: `Entity ${args.name} created successfully`,
        entityId: decision.result.entityId,
      };
    } else {
      return {
        success: false,
        message: `Entity rejected: ${decision.userFeedback}`,
      };
    }
  },
};
```

---

## Success Criteria

**Queue is production-ready when:**
- ✅ AI suggestions appear in queue instantly
- ✅ Real-time UI updates via WebSocket
- ✅ User can approve/reject/edit suggestions
- ✅ Batch operations work smoothly
- ✅ Progress tracking for long operations
- ✅ Feedback flows back to learning service
- ✅ Desktop notifications for new items
- ✅ Queue badge shows pending count

---

## Implementation Timeline

**Week 1: Core Queue System**
- QueueService class
- Database schema
- Basic CRUD operations

**Week 2: UI Components**
- QueueContainer
- QueueItem
- Approval/rejection flows

**Week 3: Real-time Updates**
- WebSocket integration
- Desktop notifications
- Badge counts

**Week 4: Agent Integration**
- Tool → Queue workflow
- Feedback → Learning loop
- Batch operations

**Total:** ~4 weeks

---

**Analysis Complete**  
**Status:** ✅ Ready for implementation  
**Next:** Build file browser UI from SurfSense patterns
