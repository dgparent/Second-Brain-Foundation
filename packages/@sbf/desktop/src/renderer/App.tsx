import React, { useState, Suspense } from 'react';
import { Layout, Menu, theme, Typography, Button, Drawer, FloatButton, Spin } from 'antd';
import { 
  DashboardOutlined, 
  BankOutlined, 
  HeartOutlined, 
  ReadOutlined, 
  AuditOutlined, 
  HomeOutlined, 
  SafetyCertificateOutlined,
  BarChartOutlined,
  MessageOutlined,
  SettingOutlined
} from '@ant-design/icons';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Finance = React.lazy(() => import('./components/Finance'));
const Health = React.lazy(() => import('./components/Health'));
const Knowledge = React.lazy(() => import('./components/Knowledge'));
const Legal = React.lazy(() => import('./components/Legal'));
const Property = React.lazy(() => import('./components/Property'));
const HACCP = React.lazy(() => import('./components/HACCP'));
const AnalyticsView = React.lazy(() => import('./components/AnalyticsView'));
const Settings = React.lazy(() => import('./components/Settings'));
const ChatInterface = React.lazy(() => import('./components/ChatInterface'));

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderContent = () => {
    return (
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>}>
        {(() => {
          switch (currentView) {
            case 'dashboard': return <Dashboard />;
            case 'analytics': return <AnalyticsView />;
            case 'finance': return <Finance />;
            case 'health': return <Health />;
            case 'knowledge': return <Knowledge />;
            case 'legal': return <Legal />;
            case 'property': return <Property />;
            case 'haccp': return <HACCP />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px' }} />
        <Menu 
          theme="dark" 
          defaultSelectedKeys={['dashboard']} 
          mode="inline" 
          onClick={({ key }) => setCurrentView(key)}
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics' },
            { key: 'finance', icon: <BankOutlined />, label: 'Finance' },
            { key: 'health', icon: <HeartOutlined />, label: 'Health' },
            { key: 'knowledge', icon: <ReadOutlined />, label: 'Knowledge' },
            { key: 'legal', icon: <AuditOutlined />, label: 'Legal Ops' },
            { key: 'property', icon: <HomeOutlined />, label: 'Property' },
            { key: 'haccp', icon: <SafetyCertificateOutlined />, label: 'HACCP' },
            { type: 'divider' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
          ]} 
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, paddingLeft: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <Title level={4} style={{ margin: 0 }}>Second Brain Foundation</Title>
          <Button 
            type="primary" 
            icon={<MessageOutlined />} 
            onClick={() => setChatOpen(true)}
          >
            Chat with Brain
          </Button>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              marginTop: 16,
              overflow: 'auto',
              height: 'calc(100vh - 100px)'
            }}
          >
            {renderContent()}
          </div>
        </Content>
      </Layout>

      <Drawer
        title="Brain Chat (Orchestrator)"
        placement="right"
        onClose={() => setChatOpen(false)}
        open={chatOpen}
        width={500}
        bodyStyle={{ padding: 0 }}
      >
        <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}><Spin /></div>}>
          <ChatInterface />
        </Suspense>
      </Drawer>
      
      {/* Floating button for quick access if header is scrolled away (though header is fixed in this layout) */}
      {!chatOpen && (
        <FloatButton 
          icon={<MessageOutlined />} 
          type="primary" 
          style={{ right: 24, bottom: 24 }} 
          onClick={() => setChatOpen(true)}
        />
      )}
    </Layout>
  );
};

export default App;
