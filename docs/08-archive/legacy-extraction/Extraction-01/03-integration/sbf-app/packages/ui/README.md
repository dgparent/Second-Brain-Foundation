# SBF UI Package

**Second Brain Foundation - React UI Components**

A minimal, clean chat interface for interacting with the SBF agent, adapted from Open-WebUI patterns.

## Components

### ChatContainer

Main chat interface that integrates messages and input.

```tsx
import { ChatContainer } from '@sbf/ui';

<ChatContainer
  initialMessages={[]}
  onSendMessage={async (message) => {
    // Handle message
  }}
  isProcessing={false}
  title="Second Brain Foundation"
/>
```

### ChatMessage

Individual message component for user/assistant messages.

```tsx
import { ChatMessage } from '@sbf/ui';

<ChatMessage
  role="assistant"
  content="Hello! How can I help?"
  timestamp={Date.now()}
  isStreaming={false}
/>
```

### MessageInput

Text input with send button and keyboard shortcuts.

```tsx
import { MessageInput } from '@sbf/ui';

<MessageInput
  onSend={(message) => console.log(message)}
  disabled={false}
  placeholder="Type a message..."
/>
```

### QueuePanel

Organization queue with approval workflow.

```tsx
import { QueuePanel } from '@sbf/ui';

<QueuePanel
  items={queueItems}
  onApprove={(id) => console.log('Approved:', id)}
  onReject={(id) => console.log('Rejected:', id)}
  onApproveAll={() => console.log('Approved all')}
/>
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build
pnpm build

# Type check
pnpm type-check
```

## Features

- ✅ Clean, minimal chat interface
- ✅ Dark mode support
- ✅ Streaming message support
- ✅ Queue management with approval workflow
- ✅ Responsive design
- ✅ Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- ✅ Auto-scrolling
- ✅ Typing indicators

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite

## Adapted From

- **Open-WebUI**: Chat interface patterns
  - Message display
  - Input handling
  - Auto-scroll behavior
  - Dark mode theming

## TODO

- [ ] Connect to SBFAgent backend
- [ ] Add message streaming
- [ ] Add file upload
- [ ] Add markdown rendering
- [ ] Add entity previews
- [ ] Add settings panel
- [ ] Add keyboard shortcuts help
