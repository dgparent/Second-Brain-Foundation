import { App, PluginSettingTab } from "obsidian";
import TextGeneratorPlugin from "#/main";

import { createRoot } from "react-dom/client";
import React from "react";
import { GlobalProvider } from "../context/global";

import SectionsMain from "./sections";
import ReloadPluginPopup from "./components/reloadPlugin";

export default class TextGeneratorSettingTab extends PluginSettingTab {
  Module: TextGeneratorPlugin;
  app: App;
  constructor(app: App, Module: TextGeneratorPlugin) {
    super(app, Module);
    this.Module = Module;
    this.app = app;
  }

  async reloadPlugin() {
    // @ts-ignore
    await this.app.Modules.disablePlugin("obsidian-textgenerator-Module");
    // @ts-ignore
    await this.app.Modules.enablePlugin("obsidian-textgenerator-Module");
    // @ts-ignore
    this.app.setting.openTabById("obsidian-textgenerator-Module").display();
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const div = containerEl.createDiv("div");
    const sections = createRoot(div);

    sections.render(
      <GlobalProvider Module={this.Module}>
        <ReloadPluginPopup />
        <SectionsMain />
      </GlobalProvider>
    );
  }
}
