import React, { useEffect, useState } from 'react';
import { Card, List, Button, Input, Select, Typography, Modal, message, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ConstitutionRule {
  id: string;
  category: 'preference' | 'workflow' | 'constraint';
  content: string;
  created: string;
}

const ConstitutionEditor: React.FC = () => {
  const [rules, setRules] = useState<ConstitutionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ConstitutionRule | null>(null);
  
  // Form state
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'preference' | 'workflow' | 'constraint'>('preference');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await window.sbfAPI.va.getConstitution();
      setRules(data);
    } catch (error) {
      console.error('Error fetching constitution:', error);
      message.error('Failed to load constitution rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      let newRules = [...rules];
      
      if (editingRule) {
        // Update existing
        newRules = newRules.map(r => 
          r.id === editingRule.id 
            ? { ...r, content, category, lastUpdated: new Date().toISOString() } 
            : r
        );
      } else {
        // Create new
        const newRule: ConstitutionRule = {
          id: Math.random().toString(36).substring(7),
          category,
          content,
          created: new Date().toISOString()
        };
        newRules.push(newRule);
      }

      await window.sbfAPI.va.updateConstitution(newRules);
      setRules(newRules);
      message.success('Constitution updated successfully');
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving rule:', error);
      message.error('Failed to save rule');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const newRules = rules.filter(r => r.id !== id);
      await window.sbfAPI.va.updateConstitution(newRules);
      setRules(newRules);
      message.success('Rule deleted');
    } catch (error) {
      console.error('Error deleting rule:', error);
      message.error('Failed to delete rule');
    }
  };

  const openEditModal = (rule: ConstitutionRule) => {
    setEditingRule(rule);
    setContent(rule.content);
    setCategory(rule.category);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRule(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setContent('');
    setCategory('preference');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'preference': return 'blue';
      case 'workflow': return 'green';
      case 'constraint': return 'red';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2}>Constitution Memory</Title>
          <Text type="secondary">Define rules and preferences that guide the Orchestrator Agent.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Add Rule
        </Button>
      </div>

      <Card loading={loading}>
        <List
          dataSource={rules}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(item)} />,
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)} />
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={getCategoryColor(item.category)}>{item.category.toUpperCase()}</Tag>
                    <Text>{item.content}</Text>
                  </div>
                }
                description={<Text type="secondary" style={{ fontSize: 12 }}>ID: {item.id}</Text>}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No rules defined yet. Add one to guide the AI.' }}
        />
      </Card>

      <Modal
        title={editingRule ? 'Edit Rule' : 'New Rule'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text strong>Category</Text>
            <Select 
              value={category} 
              onChange={setCategory} 
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="preference">Preference (Likes/Dislikes)</Option>
              <Option value="workflow">Workflow (How to do things)</Option>
              <Option value="constraint">Constraint (What NOT to do)</Option>
            </Select>
          </div>
          <div>
            <Text strong>Rule Content</Text>
            <TextArea 
              rows={4} 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="e.g., Always summarize long texts in bullet points."
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConstitutionEditor;
