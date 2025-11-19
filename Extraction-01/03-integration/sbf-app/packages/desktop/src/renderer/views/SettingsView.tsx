/**
 * SBF Desktop - Settings View
 * Application settings and configuration
 */

import React from 'react';
import './SettingsView.css';

interface SettingsViewProps {
  vaultPath: string | null;
  onVaultChange: (path: string | null) => void;
}

export function SettingsView({ vaultPath, onVaultChange }: SettingsViewProps) {
  const handleSelectVault = async () => {
    const path = await window.electron.vault.selectFolder();
    if (path) {
      onVaultChange(path);
      // TODO: Save to config
    }
  };

  return (
    <div className="settings-view">
      <header className="view-header">
        <h1>Settings</h1>
        <p>Configure your Second Brain Foundation</p>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h2>Vault</h2>
          <div className="setting-item">
            <label>Vault Folder</label>
            <div className="setting-control">
              <input
                type="text"
                value={vaultPath || 'No vault selected'}
                readOnly
                className="vault-path-input"
              />
              <button onClick={handleSelectVault} className="select-button">
                Select Folder
              </button>
            </div>
            <p className="setting-description">
              Choose the folder where your markdown files are stored
            </p>
          </div>
        </section>

        <section className="settings-section">
          <h2>AI Provider</h2>
          <div className="setting-item">
            <label>Provider</label>
            <select className="setting-select">
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="local">Local LLM</option>
            </select>
          </div>
          <div className="setting-item">
            <label>API Key</label>
            <input type="password" placeholder="sk-..." className="setting-input" />
            <p className="setting-description">
              Your API key is stored locally and never shared
            </p>
          </div>
        </section>

        <section className="settings-section">
          <h2>Privacy</h2>
          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" defaultChecked />
              <span>Allow local AI processing</span>
            </label>
          </div>
          <div className="setting-item">
            <label className="setting-checkbox">
              <input type="checkbox" />
              <span>Allow cloud AI processing</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
