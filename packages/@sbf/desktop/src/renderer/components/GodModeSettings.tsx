import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Select, Switch, Button, Card, List, message, InputNumber } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, RocketOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface AppConfig {
  ai: {
    provider: 'ollama' | 'openai' | 'anthropic';
    baseUrl: string;
    apiKey?: string;
    embeddingModel: string;
    chatModel: string;
    ingestion: {
      chunkSize: number;
      chunkOverlap: number;
    };
  };
  database: {
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
    ssl: boolean;
  };
  vectorDb: {
    provider: 'chroma' | 'pinecone' | 'weaviate' | 'pgvector';
    host: string;
    port: number;
    apiKey?: string;
    collection: string;
  };
  automation: {
    activePieces: {
      url: string;
      apiKey?: string;
      enabled: boolean;
    };
    triggerDev: {
      apiKey?: string;
      apiUrl?: string;
      enabled: boolean;
    };
  };
  analytics: {
    superset: {
      url: string;
      enabled: boolean;
    };
    grafana: {
      url: string;
      enabled: boolean;
    };
  };
  mcp: {
    servers: Array<{ name: string; url: string; enabled: boolean }>;
  };
  system: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableLocalLogging: boolean;
  };
  features: {
    [key: string]: boolean;
  };
}

interface AgentPersona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  supersedesConstitution: boolean;
}

const GodModeSettings: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [personas, setPersonas] = useState<AgentPersona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfig();
    // Mock personas for now, in real app we'd load from DB
    setPersonas([
      {
        id: 'default',
        name: 'Default Assistant',
        description: 'Standard helpful assistant',
        systemPrompt: 'You are a helpful assistant.',
        supersedesConstitution: false
      },
      {
        id: 'coder',
        name: 'Senior Developer',
        description: 'Expert in TypeScript and React',
        systemPrompt: 'You are an expert Senior Developer. Focus on clean code, best practices, and performance.',
        supersedesConstitution: true
      }
    ]);
  }, []);

  const loadConfig = async () => {
    try {
      const loadedConfig = await window.sbfAPI.config.get();
      setConfig(loadedConfig);
      form.setFieldsValue(loadedConfig);
    } catch (error) {
      message.error('Failed to load configuration');
    }
  };

  const handleSaveConfig = async (values: any) => {
    setLoading(true);
    try {
      await window.sbfAPI.config.set(values);
      message.success('Configuration saved successfully');
      // In a real app, we might need to restart services here
    } catch (error) {
      message.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePersona = async (persona: AgentPersona) => {
    try {
      await window.sbfAPI.persona.setActive(persona);
      setActivePersonaId(persona.id);
      message.success(`Activated persona: ${persona.name}`);
    } catch (error) {
      message.error('Failed to activate persona');
    }
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Card title={<><RocketOutlined /> God Mode Dashboard</>} extra={<Button type="primary" onClick={form.submit} loading={loading} icon={<SaveOutlined />}>Save Changes</Button>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveConfig}
          initialValues={config}
        >
          <Tabs defaultActiveKey="intelligence" type="card">
            <Tabs.TabPane tab="Intelligence (AI)" key="intelligence">
              <Tabs defaultActiveKey="ai-config" tabPosition="left">
                <Tabs.TabPane tab="Configuration" key="ai-config">
                  <h3>Model Configuration</h3>
                  <Form.Item label="AI Provider" name={['ai', 'provider']}>
                    <Select>
                      <Option value="ollama">Ollama (Local)</Option>
                      <Option value="openai">OpenAI</Option>
                      <Option value="anthropic">Anthropic</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Base URL" name={['ai', 'baseUrl']}>
                    <Input placeholder="http://localhost:11434" />
                  </Form.Item>
                  <Form.Item label="Chat Model" name={['ai', 'chatModel']}>
                    <Input placeholder="llama3" />
                  </Form.Item>
                  <Form.Item label="Embedding Model" name={['ai', 'embeddingModel']}>
                    <Input placeholder="nomic-embed-text" />
                  </Form.Item>
                  <Form.Item label="API Key (Optional)" name={['ai', 'apiKey']}>
                    <Input.Password />
                  </Form.Item>
                </Tabs.TabPane>
                
                <Tabs.TabPane tab="Personas" key="ai-personas">
                  <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={personas}
                    renderItem={item => (
                      <List.Item>
                        <Card 
                          title={item.name} 
                          extra={
                            <Switch 
                              checked={activePersonaId === item.id} 
                              onChange={() => handleActivatePersona(item)} 
                              checkedChildren="Active" 
                              unCheckedChildren="Inactive"
                            />
                          }
                          actions={[
                            <Button type="text" icon={<DeleteOutlined />} danger>Delete</Button>
                          ]}
                        >
                          <p>{item.description}</p>
                          <div style={{ maxHeight: '100px', overflow: 'auto', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                            <small>{item.systemPrompt}</small>
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            {item.supersedesConstitution && <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Supersedes Constitution</span>}
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                  <Button type="dashed" block icon={<PlusOutlined />}>Create New Persona</Button>
                </Tabs.TabPane>
              </Tabs>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Memory (Data)" key="memory">
              <Tabs defaultActiveKey="databases" tabPosition="left">
                <Tabs.TabPane tab="Databases" key="databases">
                  <h3>Relational Database</h3>
                  <Form.Item label="Host" name={['database', 'host']}>
                    <Input placeholder="localhost" />
                  </Form.Item>
                  <Form.Item label="Port" name={['database', 'port']}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="User" name={['database', 'user']}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Password" name={['database', 'password']}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item label="Database Name" name={['database', 'database']}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="SSL" name={['database', 'ssl']} valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <h3>Vector Database</h3>
                  <Form.Item label="Provider" name={['vectorDb', 'provider']}>
                    <Select>
                      <Option value="chroma">ChromaDB</Option>
                      <Option value="pinecone">Pinecone</Option>
                      <Option value="weaviate">Weaviate</Option>
                      <Option value="pgvector">pgvector</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Host" name={['vectorDb', 'host']}>
                    <Input placeholder="localhost" />
                  </Form.Item>
                  <Form.Item label="Port" name={['vectorDb', 'port']}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Collection" name={['vectorDb', 'collection']}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="API Key (Optional)" name={['vectorDb', 'apiKey']}>
                    <Input.Password />
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Ingestion" key="ingestion">
                  <h3>Ingestion Settings</h3>
                  <p>Configure how documents are processed and stored in the Vector Database.</p>
                  <Form.Item label="Chunk Size" name={['ai', 'ingestion', 'chunkSize']}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item label="Chunk Overlap" name={['ai', 'ingestion', 'chunkOverlap']}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Nervous System" key="connectivity">
              <Tabs defaultActiveKey="automation" tabPosition="left">
                <Tabs.TabPane tab="Automation" key="automation">
                  <p>Configure external automation services.</p>
                  
                  <h3>ActivePieces (User Automation)</h3>
                  <Form.Item label="Enable ActivePieces" name={['automation', 'activePieces', 'enabled']} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="ActivePieces URL" name={['automation', 'activePieces', 'url']}>
                    <Input placeholder="http://localhost:8080" />
                  </Form.Item>
                  <Form.Item label="API Key" name={['automation', 'activePieces', 'apiKey']}>
                    <Input.Password />
                  </Form.Item>

                  <h3>Trigger.dev (Internal Jobs)</h3>
                  <Form.Item label="Enable Trigger.dev" name={['automation', 'triggerDev', 'enabled']} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="API URL" name={['automation', 'triggerDev', 'apiUrl']}>
                    <Input placeholder="https://api.trigger.dev" />
                  </Form.Item>
                  <Form.Item label="API Key" name={['automation', 'triggerDev', 'apiKey']}>
                    <Input.Password />
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="MCP Connectors" key="mcp">
                  <p>Model Context Protocol (MCP) Connectors</p>
                  <Form.List name={['mcp', 'servers']}>
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Card key={key} size="small" style={{ marginBottom: 8 }}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="Server Name"
                              rules={[{ required: true, message: 'Missing server name' }]}
                            >
                              <Input placeholder="e.g. Filesystem MCP" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'url']}
                              label="Server URL"
                              rules={[{ required: true, message: 'Missing server URL' }]}
                            >
                              <Input placeholder="http://localhost:3000/mcp" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'enabled']}
                              valuePropName="checked"
                              label="Enabled"
                            >
                              <Switch />
                            </Form.Item>
                            <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />}>
                              Remove Server
                            </Button>
                          </Card>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add MCP Server
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Tabs.TabPane>
              </Tabs>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Operations" key="ops">
              <Tabs defaultActiveKey="analytics" tabPosition="left">
                <Tabs.TabPane tab="Analytics" key="analytics">
                  <h3>Superset (BI)</h3>
                  <Form.Item label="Enable Superset" name={['analytics', 'superset', 'enabled']} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="Superset URL" name={['analytics', 'superset', 'url']}>
                    <Input placeholder="http://localhost:8088" />
                  </Form.Item>

                  <h3>Grafana (Monitoring)</h3>
                  <Form.Item label="Enable Grafana" name={['analytics', 'grafana', 'enabled']} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="Grafana URL" name={['analytics', 'grafana', 'url']}>
                    <Input placeholder="http://localhost:3000" />
                  </Form.Item>
                </Tabs.TabPane>

                <Tabs.TabPane tab="System" key="system">
                  <Form.Item label="Log Level" name={['system', 'logLevel']}>
                    <Select>
                      <Option value="debug">Debug</Option>
                      <Option value="info">Info</Option>
                      <Option value="warn">Warn</Option>
                      <Option value="error">Error</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Enable Local Logging" name={['system', 'enableLocalLogging']} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  
                  <h3>Feature Flags</h3>
                  <Form.Item label="Finance Module" name={['features', 'finance']} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="Health Module" name={['features', 'health']} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
            </Tabs.TabPane>
          </Tabs>
        </Form>
      </Card>
    </div>
  );
};

export default GodModeSettings;
