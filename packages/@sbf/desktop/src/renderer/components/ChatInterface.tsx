import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, List, Avatar, Typography, Spin, Card } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  details?: any; // For orchestrator plans/results
}

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await window.sbfAPI.va.query(userMsg.content);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || 'I processed your request.',
        timestamp: new Date(),
        details: response.data
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px', color: '#999' }}>
            <RobotOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <p>How can I help you today?</p>
            <p style={{ fontSize: '12px' }}>Try "Plan a trip" or "Summarize my notes"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: '8px',
              }}
            >
              <Avatar 
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                style={{ backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a' }}
              />
              <div
                style={{
                  backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f6ffed',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                
                {/* Show Orchestrator Details if available */}
                {msg.details && msg.details.plan && (
                  <Card size="small" title="Execution Plan" style={{ marginTop: 8, fontSize: 12 }}>
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {msg.details.plan.tasks?.map((task: any) => (
                        <li key={task.id}>
                          <strong>{task.assignedAgent}:</strong> {task.description}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: '#999', 
              marginTop: '4px', 
              textAlign: msg.role === 'user' ? 'right' : 'left',
              padding: '0 40px'
            }}>
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '0 40px' }}>
            <Spin size="small" tip="Thinking..." />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ resize: 'none' }}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleSend}
            loading={loading}
            style={{ height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
