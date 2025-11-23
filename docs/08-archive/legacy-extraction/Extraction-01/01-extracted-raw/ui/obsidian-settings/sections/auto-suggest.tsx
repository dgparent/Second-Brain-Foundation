import React, { useEffect, useId } from "react";
import useGlobal from "../../context/global";
import SettingItem from "../components/item";
import SettingsSection from "../components/section";
import Input from "../components/input";
import type { Register } from ".";
import LLMProviderController from "../components/llmProviderController";
import { useToggle } from "usehooks-ts";
import AvailableVars from "#/ui/components/availableVars";
import { contextVariablesObj } from "#/scope/context-manager";
import { useReloder } from "../components/reloadPlugin";

export default function AutoSuggestSetting(props: { register: Register }) {
  const [setReloader] = useReloder();

  const global = useGlobal();
  const sectionId = useId();
  const [resized, triggerResize] = useToggle();
  useEffect(() => {
    global.Module.settings.autoSuggestOptions = {
      ...global.Module.defaultSettings.autoSuggestOptions,
      ...global.Module.settings.autoSuggestOptions,
    };
  }, []);

  return (
    <SettingsSection
      title="Auto-Suggest Options"
      className="plug-tg-flex plug-tg-w-full plug-tg-flex-col"
      register={props.register}
      triggerResize={resized}
      id={sectionId}
    >
      <SettingItem
        name="Enable/Disable"
        description="Enable or disable auto-suggest."
        register={props.register}
        sectionId={sectionId}
      >
        <Input
          type="checkbox"
          value={"" + global.Module.settings.autoSuggestOptions.isEnabled}
          setValue={async (val) => {
            global.Module.settings.autoSuggestOptions.isEnabled = val == "true";
            global.Module.autoSuggest?.renderStatusBar();
            setReloader(true);
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>

      {!!global.Module.settings.autoSuggestOptions.isEnabled && (
        <>
          <SettingItem
            name="Inline Suggestions"
            description="Shows the suggestions text in the editor (EXPERIMENTAL)"
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              type="checkbox"
              value={
                "" + global.Module.settings.autoSuggestOptions.inlineSuggestions
              }
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.inlineSuggestions =
                  val == "true";
                setReloader(true);
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          {!!global.Module.settings.autoSuggestOptions.inlineSuggestions && (
            <SettingItem
              name="Show In Markdown"
              description="Shows the suggestions text compiled as markdown, may shows weird spaces at the begining and end (EXPERIMENTAL)"
              register={props.register}
              sectionId={sectionId}
            >
              <Input
                type="checkbox"
                value={
                  "" + global.Module.settings.autoSuggestOptions.showInMarkdown
                }
                setValue={async (val) => {
                  global.Module.settings.autoSuggestOptions.showInMarkdown =
                    val == "true";
                  setReloader(true);
                  await global.Module.saveSettings();
                  global.triggerReload();
                }}
              />
            </SettingItem>
          )}

          <SettingItem
            name="Trigger Phrase"
            description="Trigger Phrase (default: *double space*)"
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              placeholder="Trigger Phrase"
              value={global.Module.settings.autoSuggestOptions.triggerPhrase}
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.triggerPhrase = val;
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          <SettingItem
            name="Override Trigger"
            description="Overrides the trigger when suggestion is accepted (default: *single space*)"
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              value={
                "" + global.Module.settings.autoSuggestOptions.overrideTrigger
              }
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.overrideTrigger = val;
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          <SettingItem
            name="Delay milliseconds for trigger"
            register={props.register}
            sectionId={sectionId}
          >
            <input
              type="range"
              className="plug-tg-tooltip"
              min={0}
              max={2000}
              data-tip={global.Module.settings.autoSuggestOptions.delay + "ms"}
              value={global.Module.settings.autoSuggestOptions.delay}
              onChange={async (e) => {
                global.Module.settings.autoSuggestOptions.delay = parseInt(
                  e.target.value
                );
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          <SettingItem
            name="Number of Suggestions"
            description="Enter the number of suggestions to generate. Please note that increasing this value may significantly increase the cost of usage with GPT-3."
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              value={
                "" +
                global.Module.settings.autoSuggestOptions.numberOfSuggestions
              }
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.numberOfSuggestions =
                  parseInt(val);
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          <SettingItem
            name="Stop Phrase"
            description="Enter the stop phrase to use for generating auto-suggestions. The generation will stop when the stop phrase is found. (Use a space for words, a period for sentences, and a newline for paragraphs.)"
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              placeholder="Stop Phrase"
              value={global.Module.settings.autoSuggestOptions.stop}
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.stop = val;
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          <SettingItem
            name="Allow Suggest in new Line"
            description="This will allow it to run at the beggining of a new line"
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              type="checkbox"
              value={
                "" + global.Module.settings.autoSuggestOptions.allowInNewLine
              }
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.allowInNewLine =
                  val == "true";
                global.Module.autoSuggest?.renderStatusBar();
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>
          <SettingItem
            name="Show/Hide Auto-suggest status in Status Bar"
            description=""
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              type="checkbox"
              value={"" + global.Module.settings.autoSuggestOptions.showStatus}
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.showStatus =
                  val == "true";
                global.Module.autoSuggest?.renderStatusBar();
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          <SettingItem
            name="Custom auto-suggest Prompt"
            description={"You can customize auto-suggest prompt"}
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              type="checkbox"
              placeholder="Custom auto-suggest prompt"
              value={
                "" +
                global.Module.settings.autoSuggestOptions.customInstructEnabled
              }
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.customInstructEnabled =
                  val == "true";
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>
          {global.Module.settings.autoSuggestOptions.customInstructEnabled && (
            <>
              <SettingItem
                name="Custom auto-suggest prompt"
                register={props.register}
                sectionId={sectionId}
                textArea
              >
                <textarea
                  placeholder="Custom auto-suggest prompt"
                  className="plug-tg-input plug-tg-h-fit plug-tg-w-full plug-tg-resize-y plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-outline-none"
                  value={
                    global.Module.settings.autoSuggestOptions.customInstruct ||
                    global.Module.defaultSettings.autoSuggestOptions
                      .customInstruct
                  }
                  onChange={async (e) => {
                    global.Module.settings.autoSuggestOptions.customInstruct =
                      e.target.value;
                    global.triggerReload();
                    await global.Module.saveSettings();
                  }}
                  spellCheck={false}
                  rows={10}
                />
              </SettingItem>
              <AvailableVars
                vars={{
                  ...contextVariablesObj,
                  query: {
                    example: "{{query}}",
                    hint: "query text that triggered auto-suggest",
                  },
                }}
              />
            </>
          )}

          {global.Module.settings.autoSuggestOptions.customInstructEnabled && (
            <>
              <SettingItem
                name="Custom Auto-suggest System Prompt"
                register={props.register}
                sectionId={sectionId}
                textArea
              >
                <textarea
                  placeholder="System Prompt"
                  className="plug-tg-input plug-tg-h-fit plug-tg-w-full plug-tg-resize-y plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-outline-none"
                  value={
                    global.Module.settings.autoSuggestOptions.systemPrompt ||
                    global.Module.defaultSettings.autoSuggestOptions
                      .systemPrompt
                  }
                  onChange={async (e) => {
                    global.Module.settings.autoSuggestOptions.systemPrompt =
                      e.target.value;
                    global.triggerReload();
                    await global.Module.saveSettings();
                  }}
                  spellCheck={false}
                  rows={10}
                />
              </SettingItem>
              <AvailableVars
                vars={{
                  ...contextVariablesObj,
                  query: {
                    example: "{{query}}",
                    hint: "query text that triggered auto-suggest",
                  },
                }}
              />
            </>
          )}


          <SettingItem
            name="Custom Provider"
            description={`use a different LLM provider than the one you're generating with.\
          
            make sure to setup the llm provider in the LLM Settings, before use.`}
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              type="checkbox"
              value={
                "" + global.Module.settings.autoSuggestOptions.customProvider
              }
              setValue={async (val) => {
                global.Module.settings.autoSuggestOptions.customProvider =
                  val == "true";
                global.Module.autoSuggest?.renderStatusBar();
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>

          {!!global.Module.settings.autoSuggestOptions.customProvider && (
            <LLMProviderController
              register={props.register}
              getSelectedProvider={() =>
                global.Module.settings.autoSuggestOptions.selectedProvider || ""
              }
              setSelectedProvider={(newVal) =>
              (global.Module.settings.autoSuggestOptions.selectedProvider =
                (newVal as any) || "")
              }
              triggerResize={triggerResize}
              mini
            />
          )}
        </>
      )}
    </SettingsSection>
  );
}
