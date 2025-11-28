import React, { Suspense } from 'react';
import { Tabs, Spin } from 'antd';
import ConstitutionEditor from './ConstitutionEditor';

const GodModeSettings = React.lazy(() => import('./GodModeSettings'));

const Settings: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        defaultActiveKey="constitution"
        items={[
          {
            key: 'constitution',
            label: 'Constitution Memory',
            children: <ConstitutionEditor />,
          },
          {
            key: 'godmode',
            label: 'Advanced Settings',
            children: (
              <Suspense fallback={<Spin />}>
                <GodModeSettings />
              </Suspense>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Settings;
