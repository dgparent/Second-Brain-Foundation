import React, { useEffect, useId } from "react";
import useGlobal from "../../context/global";
import SettingItem from "../components/item";
import SettingsSection from "../components/section";
import Input from "../components/input";
import type { Register } from ".";
import { useToggle } from "usehooks-ts";
import { useReloder } from "../components/reloadPlugin";

export default function SlashSuggestSetting(props: { register: Register }) {
  const [setReloader] = useReloder();

  const global = useGlobal();
  const sectionId = useId();
  const [resized, triggerResize] = useToggle();

  useEffect(() => {
    global.Module.settings.slashSuggestOptions = {
      ...global.Module.defaultSettings.slashSuggestOptions,
      ...global.Module.settings.slashSuggestOptions,
    };
  }, []);

  return (
    <SettingsSection
      title="Slash-Suggest Options"
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
          value={"" + global.Module.settings.slashSuggestOptions.isEnabled}
          setValue={async (val) => {
            global.Module.settings.slashSuggestOptions.isEnabled =
              val == "true";
            global.Module.autoSuggest?.renderStatusBar();
            setReloader(true);
            await global.Module.saveSettings();
            global.triggerReload();
          }}
        />
      </SettingItem>
      {!!global.Module.settings.slashSuggestOptions.isEnabled && (
        <>
          <SettingItem
            name="Trigger Phrase"
            description="Trigger Phrase (default: */*)"
            register={props.register}
            sectionId={sectionId}
          >
            <Input
              placeholder="Trigger Phrase"
              value={global.Module.settings.slashSuggestOptions.triggerPhrase}
              setValue={async (val) => {
                global.Module.settings.slashSuggestOptions.triggerPhrase = val;
                await global.Module.saveSettings();
                global.triggerReload();
              }}
            />
          </SettingItem>
        </>
      )}
    </SettingsSection>
  );
}
