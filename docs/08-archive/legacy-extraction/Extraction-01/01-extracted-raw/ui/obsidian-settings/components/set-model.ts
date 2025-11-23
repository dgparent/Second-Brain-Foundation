import { App, Notice, FuzzySuggestModal } from "obsidian";
import TextGeneratorPlugin from "src/main";
import { Model } from "src/types";
import debug from "debug";
const logger = debug("textgenerator:setModel");
export class SetModel extends FuzzySuggestModal<Model> {
  Module: TextGeneratorPlugin;
  title: string;
  onChoose: (result: string) => void;
  constructor(
    app: App,
    Module: TextGeneratorPlugin,
    onChoose: (result: string) => void,
    title = ""
  ) {
    super(app);
    this.onChoose = onChoose;
    this.Module = Module;
    this.title = title;
    this.modalEl.insertBefore(
      createEl("div", {
        text: title,
        cls: "plug-tg-text-center plug-tg-text-xl plug-tg-font-bold",
      }),
      this.modalEl.children[0]
    );
  }

  getItems() {
    logger("getItems");
    return this.Module.textGenerator.LLMProvider?.getModels() || [];
  }

  getItemText(model: Model): string {
    return model.id;
  }

  onChooseItem(model: Model, evt: MouseEvent | KeyboardEvent) {
    logger("onChooseItem", model);
    new Notice(`Selected ${model.id}`);
    this.onChoose(model.id);
  }
}
