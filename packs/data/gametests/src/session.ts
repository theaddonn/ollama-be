import { Player } from '@minecraft/server';
import { Ollama } from 'ollama/dist/browser.cjs';
import { SessionSettings } from './settings';
import { fetch } from './fetch';

type Message = { content: string; role: string; name?: string };

const SessionWorldStorageID = 'ollama:storage';

export class Session {
  private messages: Message[] = [];
  private settings: SessionSettings = new SessionSettings();
  private ollama: Ollama = new Ollama({
    fetch: fetch,
  });

  public doctor(): boolean {
    try {
      this.ollama.list();
      return true;
    } catch (e) {
      return false;
    }
  }

  public async list(): Promise<string[]> {
    return (await this.ollama.list()).models.map((model) => model.name);
  }

  public async edit(player: Player) {
    await this.settings.edit(player);
  }

  public async chat(message: Message) {
    const model = this.settings.model.current;

    if (model == undefined) return;

    this.ollama.chat({
      model: model,
      stream: false,
      options: this.settings.options,
    });
  }

  //public chat(): string {}

  //   public loadFromWorld() {
  //     this.ollama.chat()

  //     const properties = world.getDynamicProperty(SessionWorldStorageID) as
  //       | string
  //       | undefined;
  //     let messages: string = properties ? properties : '';

  //     const messages = JSON.parse(rawMessages);
  //   }
}
