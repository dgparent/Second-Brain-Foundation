import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Tag, Input, Button, Modal, message } from 'antd';
import { BookOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import SmartEditor from './SmartEditor';

const { Title } = Typography;
const { Search } = Input;

const Knowledge: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await window.sbfAPI.learning.getResources().catch(() => []);
      setResources(data);
    } catch (error) {
      console.error("Error fetching learning resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string) => {
    try {
      // 1. Extract metadata using AI
      message.loading({ content: 'Analyzing content...', key: 'save' });
      const extraction = await window.sbfAPI.ai.extract(content);
      
      // 2. Create entity
      // Use the first extracted entity name as title, or fallback
      const title = extraction.entities[0]?.name || 'New Knowledge Resource';
      const topics = extraction.classification?.tags || [];
      
      // Fallback to learning.addResource since we know it exists
      await window.sbfAPI.learning.addResource({
        title,
        type: 'article',
        url: '',
        topics
      });

      message.success({ content: 'Saved successfully!', key: 'save' });
      setIsModalOpen(false);
      setEditorContent('');
      fetchData();
    } catch (error) {
      console.error(error);
      message.error({ content: 'Failed to save.', key: 'save' });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}><BookOutlined /> Knowledge Base</Title>
        <div style={{ display: 'flex', gap: 16 }}>
          <Search placeholder="Search resources..." style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            New Note
          </Button>
        </div>
      </div>
      
      {loading ? <Spin size="large" /> : (
        <Card>
          <List
            dataSource={resources}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  title={<a href={item.url}>{item.title}</a>}
                  description={item.description || (item.content ? item.content.substring(0, 100) + '...' : '')}
                />
                <Tag color="blue">{item.type}</Tag>
                <Tag color={item.status === 'completed' ? 'green' : 'gold'}>{item.status}</Tag>
              </List.Item>
            )}
            locale={{ emptyText: 'No learning resources found' }}
          />
        </Card>
      )}

      <Modal
        title="New Knowledge Entry"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SmartEditor 
          initialContent={editorContent} 
          onSave={handleSave} 
        />
      </Modal>
    </div>
  );
};

export default Knowledge;
