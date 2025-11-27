export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class VAChat {
  private container: HTMLElement;
  private messages: ChatMessage[] = [];
  private isProcessing: boolean = false;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = element;
  }

  render(): void {
    this.container.innerHTML = `
      <div class="va-chat">
        <div class="chat-header">
          <h2>🤖 Virtual Assistant</h2>
        </div>
        <div class="chat-messages" id="chat-messages">
          ${this.renderMessages()}
        </div>
        <div class="chat-input-area">
          <textarea 
            id="chat-input" 
            placeholder="Ask me anything... (e.g., 'Create a note about project X')"
            rows="1"
          ></textarea>
          <button id="send-btn" disabled>Send</button>
        </div>
      </div>
    `;

    this.applyStyles();
    this.attachEventListeners();
    this.scrollToBottom();
  }

  private renderMessages(): string {
    if (this.messages.length === 0) {
      return `
        <div class="empty-state">
          <p>👋 Hi! I'm your Virtual Assistant.</p>
          <p>I can help you create notes, manage tasks, and organize your knowledge.</p>
        </div>
      `;
    }

    return this.messages.map(msg => `
      <div class="message ${msg.role}">
        <div class="message-content">${this.formatContent(msg.content)}</div>
        <div class="message-meta">${msg.timestamp.toLocaleTimeString()}</div>
      </div>
    `).join('');
  }

  private formatContent(content: string): string {
    // Simple formatting for now
    return content.replace(/\n/g, '<br>');
  }

  private attachEventListeners(): void {
    const input = this.container.querySelector('#chat-input') as HTMLTextAreaElement;
    const sendBtn = this.container.querySelector('#send-btn') as HTMLButtonElement;

    input.addEventListener('input', () => {
      sendBtn.disabled = input.value.trim().length === 0 || this.isProcessing;
      // Auto-resize
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
          this.sendMessage(input.value);
          input.value = '';
          input.style.height = 'auto';
        }
      }
    });

    sendBtn.addEventListener('click', () => {
      if (!sendBtn.disabled) {
        this.sendMessage(input.value);
        input.value = '';
        input.style.height = 'auto';
      }
    });
  }

  private async sendMessage(content: string): Promise<void> {
    if (!content.trim()) return;

    // Add user message
    this.messages.push({
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    });

    this.renderMessagesList();
    this.isProcessing = true;
    this.updateInputState();

    try {
      // Call API
      const result = await (window as any).sbfAPI.va.query(content);
      
      // Add assistant response
      this.messages.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message || JSON.stringify(result, null, 2),
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      this.messages.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${(error as Error).message}`,
        timestamp: new Date()
      });
    } finally {
      this.isProcessing = false;
      this.renderMessagesList();
      this.updateInputState();
    }
  }

  private renderMessagesList(): void {
    const messagesContainer = this.container.querySelector('#chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = this.renderMessages();
      this.scrollToBottom();
    }
  }

  private updateInputState(): void {
    const sendBtn = this.container.querySelector('#send-btn') as HTMLButtonElement;
    const input = this.container.querySelector('#chat-input') as HTMLTextAreaElement;
    
    if (sendBtn) sendBtn.disabled = this.isProcessing || input.value.trim().length === 0;
    if (input) input.disabled = this.isProcessing;
  }

  private scrollToBottom(): void {
    const messagesContainer = this.container.querySelector('#chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  private applyStyles(): void {
    const styleId = 'va-chat-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .va-chat {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #1e1e1e;
        border-radius: 8px;
        overflow: hidden;
      }

      .chat-header {
        padding: 1rem;
        background: #252526;
        border-bottom: 1px solid #333;
      }

      .chat-header h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .message {
        max-width: 80%;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        line-height: 1.5;
      }

      .message.user {
        align-self: flex-end;
        background: #0066cc;
        color: white;
      }

      .message.assistant {
        align-self: flex-start;
        background: #333;
        color: #e0e0e0;
      }

      .message-meta {
        font-size: 0.7rem;
        opacity: 0.7;
        margin-top: 0.25rem;
        text-align: right;
      }

      .chat-input-area {
        padding: 1rem;
        background: #252526;
        border-top: 1px solid #333;
        display: flex;
        gap: 0.5rem;
        align-items: flex-end;
      }

      #chat-input {
        flex: 1;
        background: #333;
        border: 1px solid #444;
        border-radius: 4px;
        color: white;
        padding: 0.5rem;
        resize: none;
        font-family: inherit;
        max-height: 100px;
      }

      #chat-input:focus {
        outline: none;
        border-color: #0066cc;
      }

      #send-btn {
        padding: 0.5rem 1rem;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      #send-btn:disabled {
        background: #444;
        cursor: not-allowed;
        opacity: 0.5;
      }

      .empty-state {
        text-align: center;
        color: #666;
        margin-top: 2rem;
      }
    `;
    document.head.appendChild(style);
  }
}
