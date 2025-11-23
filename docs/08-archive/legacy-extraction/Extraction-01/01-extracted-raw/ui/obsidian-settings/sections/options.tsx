import React, { useId, useMemo } from "react";
import useGlobal from "../../context/global";
import { useReloder } from "../components/reloadPlugin";
import SettingItem from "../components/item";
import SettingsSection from "../components/section";
import Input from "../components/input";
import type { Register } from ".";
// object storing custom name/description of items
const extendedInfo: Record<
  string,
  {
    description?: string;
    name?: string;
  }
> = {
  "modal-suggest": {
    name: "Slash suggestions",
    description: "modal-suggest",
  },
  "set-llm": {
    name: "Chose LLM",
    description: "set-llm",
  },
};

export default function OptionsSetting(props: { register: Register }) {
  const [setReloader] = useReloder();

  const global = useGlobal();
  const sectionId = useId();
  const ops = useMemo(
    () =>
      Object.keys({
        ...global.Module.defaultSettings.options,
        // ...global.Module.settings.options,
      }),
    []
  );

  return (
    <>
      <SettingsSection
        title="Text Generator Options"
        className="plug-tg-flex plug-tg-w-full plug-tg-flex-col"
        register={props.register}
        id={sectionId}
      >
        <SettingItem
          name="Keys encryption"
          description="Enable encrypting keys, this could cause incompatibility with mobile devices"
          register={props.register}
          sectionId={sectionId}
        >
          <Input
            type="checkbox"
            value={"" + global.Module.settings.encrypt_keys}
            setValue={async (val) => {
              try {
                global.Module.settings.encrypt_keys = val == "true";
                await global.Module.encryptAllKeys();
                await global.Module.saveSettings();
                global.triggerReload();
              } catch (err: any) {
                global.Module.handelError(err);
              }
            }}
          />
        </SettingItem>
        {ops.map((key) => {
          const moreData = extendedInfo[key];
          return (
            <SettingItem
              key={key}
              name={moreData?.name || key}
              description={
                moreData?.description ||
                global.Module.commands?.commands.find(
                  (c) =>
                    c.id == `obsidian-textgenerator-Module:${key}` ||
                    c.id === key
                )?.name ||
                key
              }
              register={props.register}
              sectionId={sectionId}
            >
              <Input
                type="checkbox"
                value={
                  "" +
                  global.Module.settings.options[
                  key as keyof typeof global.Module.settings.options
                  ]
                }
                setValue={async (val) => {
                  global.Module.settings.options[
                    key as keyof typeof global.Module.settings.options
                  ] = val == "true";

                  // new Notice(
                  //   `${key} is ${
                  //     global.Module.settings.options[
                  //       key as keyof typeof global.Module.settings.options
                  //     ]
                  //       ? "enabled"
                  //       : "disabled"
                  //   }.`
                  // );

                  document.querySelector(".tg-opts")?.scrollIntoView();
                  setReloader(true);
                  await global.Module.saveSettings();
                  global.triggerReload();
                }}
              />
            </SettingItem>
          );
        })}
      </SettingsSection>
    </>
  );
}
