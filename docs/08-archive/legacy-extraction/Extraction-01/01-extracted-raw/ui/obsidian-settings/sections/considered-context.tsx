import React, { useId } from "react";
import useGlobal from "../../context/global";
import SettingItem from "../components/item";
import SettingsSection from "../components/section";
import Input from "../components/input";
import { useMemo } from "react";
import type { Register } from ".";
import { Context } from "#/types";
import AvailableVars from "#/ui/components/availableVars";
import { contextVariablesObj } from "#/scope/context-manager";

const extendedInfo: Record<
  string,
  {
    description: string;
    name?: string;
  }
> = {
  includeTitle: {
    description:
      "Include the title of the active document in the considered context.",
  },
  starredBlocks: {
    description: "Include starred blocks in the considered context.",
  },

  includeFrontmatter: {
    description: "Include frontmatter",
  },

  includeHeadings: {
    description: "Include headings with their content.",
  },

  includeChildren: {
    description: "Include the content of internal md links on the page.",
  },

  includeMentions: {
    description: "Include paragraphs from mentions (linked, unliked).",
  },

  includeHighlights: {
    description: "Include Obsidian Highlights.",
  },

  includeExtractions: {
    description: "Include Extracted Information",
  },

  includeClipboard: {
    description: "Make clipboard available for templates",
  },
};

export default function ConsideredContextSetting(props: {
  register: Register;
}) {
  const global = useGlobal();
  const sectionId = useId();

  return (
    <>
      <SettingsSection
        title="Custom Instructions"
        className="plug-tg-flex plug-tg-w-full plug-tg-flex-col"
        register={props.register}
        id={sectionId}
      >
        <SettingItem
          name="Custom default generation prompt"
          description={"You can customize {{context}} variable"}
          register={props.register}
          sectionId={sectionId}
        >
          <Input
            type="checkbox"
            value={"" + global.Module.settings.context.customInstructEnabled}
            setValue={async (val) => {
              global.Module.settings.context.customInstructEnabled =
                val == "true";
              await global.Module.saveSettings();
              global.triggerReload();
            }}
          />
        </SettingItem>
        {global.Module.settings.context.customInstructEnabled && (
          <>
            <SettingItem
              name=""
              description=""
              register={props.register}
              sectionId={sectionId}
              textArea
            >
              <textarea
                placeholder="Textarea will autosize to fit the content"
                className="plug-tg-input plug-tg-h-fit plug-tg-w-full plug-tg-resize-y plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-outline-none"
                value={
                  global.Module.settings.context.customInstruct ||
                  global.Module.defaultSettings.context.customInstruct
                }
                onChange={async (e) => {
                  global.Module.settings.context.customInstruct =
                    e.target.value;
                  global.triggerReload();
                  await global.Module.saveSettings();
                }}
                spellCheck={false}
                rows={10}
              />
            </SettingItem>
            <AvailableVars vars={contextVariablesObj} />
          </>
        )}

        <SettingItem
          name="Enable generate title instruct"
          description={"You can customize generate title prompt"}
          register={props.register}
          sectionId={sectionId}
        >
          <Input
            type="checkbox"
            value={
              "" +
              global.Module.settings.advancedOptions
                ?.generateTitleInstructEnabled
            }
            setValue={async (val) => {
              if (!global.Module.settings.advancedOptions)
                global.Module.settings.advancedOptions = {
                  generateTitleInstructEnabled: val == "true",
                };

              global.Module.settings.advancedOptions.generateTitleInstructEnabled =
                val == "true";
              await global.Module.saveSettings();
              global.triggerReload();
            }}
          />
        </SettingItem>
        {global.Module.settings.advancedOptions
          ?.generateTitleInstructEnabled && (
            <>
              <SettingItem
                name=""
                description=""
                register={props.register}
                sectionId={sectionId}
                textArea
              >
                <textarea
                  placeholder="Textarea will autosize to fit the content"
                  className="plug-tg-input plug-tg-h-fit plug-tg-w-full plug-tg-resize-y plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-outline-none"
                  value={
                    global.Module.settings.advancedOptions
                      ?.generateTitleInstruct ||
                    global.Module.defaultSettings.advancedOptions
                      ?.generateTitleInstruct
                  }
                  onChange={async (e) => {
                    if (!global.Module.settings.advancedOptions)
                      global.Module.settings.advancedOptions = {
                        generateTitleInstructEnabled: true,
                        generateTitleInstruct: e.target.value,
                      };

                    global.Module.settings.advancedOptions.generateTitleInstruct =
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
                    example: "{{content255}}",
                    hint: "first 255 letters of trimmed content of the note",
                  },
                }}
              />
            </>
          )}

        <SettingItem
          name="TG Selection Limiter(regex)"
          description="tg_selection stopping character. Empty means disabled. Default: ^\*\*\*"
          register={props.register}
          sectionId={sectionId}
        >
          <Input
            value={global.Module.settings.tgSelectionLimiter}
            setValue={async (val) => {
              global.Module.settings.tgSelectionLimiter = val;
              await global.Module.saveSettings();
              global.triggerReload();
            }}
          />
        </SettingItem>
      </SettingsSection>

      <SettingsSection
        title="Template Settings"
        className="plug-tg-flex plug-tg-w-full plug-tg-flex-col"
        register={props.register}
        id={sectionId}
      >
        <SettingItem
          name="{{context}} Variable Template"
          description="Template for {{context}} variable"
          register={props.register}
          sectionId={sectionId}
          textArea
        >
          <textarea
            placeholder="Textarea will autosize to fit the content"
            className="plug-tg-input plug-tg-h-fit plug-tg-w-full plug-tg-resize-y plug-tg-bg-[var(--background-modifier-form-field)] plug-tg-outline-none"
            value={
              global.Module.settings.context.contextTemplate ||
              global.Module.defaultSettings.context.contextTemplate
            }
            onChange={async (e) => {
              global.Module.settings.context.contextTemplate = e.target.value;
              global.triggerReload();
              await global.Module.saveSettings();
            }}
            spellCheck={false}
            rows={10}
          />
        </SettingItem>
        <AvailableVars vars={contextVariablesObj} />

        {(["includeClipboard"] as (keyof Context)[])
          //   .filter((d) => !contextNotForTemplate.contains(d as any))
          .map((key: any) => {
            const moreData = extendedInfo[key];
            return (
              <SettingItem
                key={moreData?.name || key}
                name={moreData?.name || key}
                description={
                  moreData?.description ||
                  `Include ${key} in the considered context.`
                }
                register={props.register}
                sectionId={sectionId}
              >
                <Input
                  type="checkbox"
                  value={
                    "" +
                    global.Module.settings.context[
                    key as keyof typeof global.Module.settings.context
                    ]
                  }
                  setValue={async (val) => {
                    (global.Module.settings.context[
                      key as keyof typeof global.Module.settings.context
                    ] as any) = val == "true";
                    await global.Module.saveSettings();
                    global.triggerReload();
                  }}
                />
              </SettingItem>
            );
          })}

        <SettingItem
          name="Allow scripts"
          description="Only enable this if you trust the authors of the templates, or know what you're doing."
          register={props.register}
          sectionId={sectionId}
        >
          <Input
            type="checkbox"
            value={"" + global.Module.settings.allowJavascriptRun}
            setValue={async (val) => {
              global.Module.settings.allowJavascriptRun = val == "true";
              await global.Module.saveSettings();
              global.triggerReload();
            }}
          />
        </SettingItem>
      </SettingsSection>
    </>
  );
}
