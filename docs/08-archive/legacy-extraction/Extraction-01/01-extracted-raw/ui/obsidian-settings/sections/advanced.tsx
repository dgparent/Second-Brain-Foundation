import React, { useId } from "react";
import useGlobal from "../../context/global";
import SettingItem from "../components/item";
import SettingsSection from "../components/section";
import Input from "../components/input";
import Confirm from "#/ui/components/confirm";
import type { Register } from ".";
export default function AdvancedSetting(props: { register: Register }) {
  const global = useGlobal();

  const sectionId = useId();

  const reloadPlugin = () => global.Module.reload();

  const resetSettings = async () => {
    if (
      !(await Confirm(
        "Are you sure, you want to Reset all your settings,\n this action will delete all your configuration to their default state"
      ))
    )
      return;

    await global.Module.resetSettingsToDefault();
    await reloadPlugin();
  };

  return (
    <SettingsSection
      title="Advanced Settings"
      className="plug-tg-flex plug-tg-w-full plug-tg-flex-col"
      register={props.register}
      id={sectionId}
    >
      <SettingItem
        name="Streaming"
        description="Enable streaming if supported by the provider"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={
            "" +
            (global.Module.textGenerator.LLMProvider.streamable &&
              global.Module.settings.stream)
          }
          setValue={async (val) => {
            global.Module.settings.stream = val == "true";
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>
      <SettingItem
        name="Display errors in the editor"
        description="If you want to see the errors in the editor"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={"" + global.Module.settings.displayErrorInEditor}
          setValue={async (val) => {
            global.Module.settings.displayErrorInEditor = val == "true";
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>

      <SettingItem
        name="Show Status in StatusBar"
        description="Show information in the Status Bar"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={"" + global.Module.settings.showStatusBar}
          setValue={async (val) => {
            global.Module.settings.showStatusBar = val == "true";
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>

      <SettingItem
        name="Output generated text to blockquote"
        description="Distinguish between AI generated text and typed text using a blockquote"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={"" + global.Module.settings.outputToBlockQuote}
          setValue={async (val) => {
            global.Module.settings.outputToBlockQuote = val == "true";
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>

      <SettingItem
        name="Free cursor on streaming"
        description="Note that it might result in weird bugs, the auto-scrolling might not work"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={"" + global.Module.settings.freeCursorOnStreaming}
          setValue={async (val) => {
            global.Module.settings.freeCursorOnStreaming = val == "true";
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>
      <SettingItem
        name="Experimentation Features"
        description="This adds experiment features, which might not be stable yet"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={"" + global.Module.settings.experiment}
          setValue={async (val) => {
            global.Module.settings.experiment = val == "true";
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>

      <SettingItem
        name="include Attachments"
        description="EXPERIMENTAL: adds the images that are referenced in the request, IT MIGHT CONSUME ALOT OF TOKENS"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={"" + global.Module.settings.advancedOptions?.includeAttachmentsInRequest}
          setValue={async (val) => {
            if (!global.Module.settings.advancedOptions) global.Module.settings.advancedOptions = {};

            global.Module.settings.advancedOptions.includeAttachmentsInRequest = val == "true";
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>


      <SettingItem
        name="Templates Path"
        description="Path for Templates directory"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          value={global.Module.settings.promptsPath}
          setValue={async (val) => {
            global.Module.settings.promptsPath = val;
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>

      <SettingItem
        name="TextGenerator Path"
        description="Path To Folder that Text Generator can put Backups,generations...etc into"
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          value={global.Module.settings.textGenPath}
          setValue={async (val) => {
            global.Module.settings.textGenPath = val;
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>

      <SettingItem
        name="Reload the Module"
        description="Some changes might require you to reload the Modules"
        register={props.register}
        sectionId={sectionId}
      >
        <button onClick={reloadPlugin}>Reload</button>
      </SettingItem>

      <SettingItem
        name="Resets all settings to default"
        description="It will delete all your configurations"
        register={props.register}
        sectionId={sectionId}
      >
        <button className="plug-tg-btn-danger" onClick={resetSettings}>
          Reset
        </button>
      </SettingItem>
    </SettingsSection>
  );
}
