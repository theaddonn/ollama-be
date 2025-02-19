import { Player, world } from '@minecraft/server';
import {
  Ollama,
  Message as OllamaMessage,
  ToolCall,
} from 'ollama/dist/browser.cjs';
import { SessionSettings, OllamaDefaultHost } from './settings';
import { fetch } from './fetch';
import { CalcFn } from './tools/calc';
import { ToolManager } from './tool';
import { GetTimeOfDayFn, SetTimeOfDayFn } from './tools/time';
import {
  GetGamemodeFn as GetGameModeFn,
  SetGamemodeDayFn as SetGameModeFn,
} from './tools/gamemode';
import { GetWeatherFn, SetWeatherFn } from './tools/weather';
import { GetGameRuleFn, SetGameRuleFn } from './tools/gamerules';
import { GetDifficultyFn, SetDifficultyFn } from './tools/difficulty';

type Message = {
  role: string;
  name?: string;
  content: string;
  tool_calls?: ToolCall[];
};

const SystemName = 'OllamaBE';
const SystemPrompt = `
You are '${SystemName}', a friendly chat bot in a Minecraft Bedrock multiplayer world. 
- Greet players, provide clear and concise answers, and keep conversations friendly and respectful.
- Offer accurate gameplay tips, crafting recipes, and help with server commands.
- Promote a positive and inclusive atmosphere, encouraging teamwork and cooperation.
- Diffuse conflicts calmly with empathy, providing solutions where necessary.
- Maintain a friendly but professional tone, ensuring interactions are polite and helpful.
- Keep responses brief, relevant, and aligned with Minecraft Bedrock Edition mechanics.

Example style:
- Player: How do I craft a shield?
  ${SystemName}: Easy! 1 iron ingot + 6 planks in a crafting table. Ready to block some creeper blasts?
- Player: This server sucks.
  ${SystemName}: Awwh, that's no fun! What’s wrong? Maybe we can fix it together!

When responding to user prompts, do not include your own name unless explicitly asked.
Focus on staying friendly, encouraging and always helpful.`;
const SystemMessage: Message = {
  role: 'system',
  content: SystemPrompt,
};
const SystemToolManager: ToolManager = new ToolManager()
  .register(CalcFn.id, CalcFn.desc, new CalcFn())
  .register(SetTimeOfDayFn.id, SetTimeOfDayFn.desc, new SetTimeOfDayFn())
  .register(GetTimeOfDayFn.id, GetTimeOfDayFn.desc, new GetTimeOfDayFn())
  .register(SetGameModeFn.id, SetGameModeFn.desc, new SetGameModeFn())
  .register(GetGameModeFn.id, GetGameModeFn.desc, new GetGameModeFn())
  .register(SetWeatherFn.id, SetWeatherFn.desc, new SetWeatherFn())
  .register(GetWeatherFn.id, GetWeatherFn.desc, new GetWeatherFn())
  .register(SetGameRuleFn.id, SetGameRuleFn.desc, new SetGameRuleFn())
  .register(GetGameRuleFn.id, GetGameRuleFn.desc, new GetGameRuleFn())
  .register(SetDifficultyFn.id, SetDifficultyFn.desc, new SetDifficultyFn())
  .register(GetDifficultyFn.id, GetDifficultyFn.desc, new GetDifficultyFn());

const SessionWorldStorageID = 'ollama:storage';

export class Session {
  private messages: Message[] = [];
  private settings: SessionSettings = new SessionSettings();
  private ollama: Ollama = new Ollama({
    fetch: fetch,
  });

  private convertMessages(messages: Message[]): OllamaMessage[] {
    return messages.map((message) => {
      return {
        role: message.role,
        content: message.name
          ? `"${message.name}": ${message.content}`
          : message.content,
        tool_calls: message.tool_calls,
      };
    });
  }

  public async doctor(player?: Player): Promise<boolean> {
    let healthy = false;
    const host = this.settings.host ?? OllamaDefaultHost;

    try {
      const response = await fetch(host);
      healthy = response.status === 200;
    } catch (e) {
      healthy = false;
    }

    if (player !== undefined && !healthy) {
      player.sendMessage(
        `§cFailed to connect to Ollama (${host}). Are you sure Ollama is running?`,
      );
    }

    return healthy;
  }

  public async list(): Promise<string[]> {
    const list = await this.ollama.list();
    return list.models.map((model) => {
      return model.name;
    });
  }

  public async updateModels() {
    const list = await this.list();
    this.settings.model.available = list;
  }

  public async edit(player: Player, healthy: boolean) {
    await this.settings.edit(player, healthy);
  }

  public async chat(message: string, player: Player): Promise<boolean> {
    const model = this.settings.model.current;

    if (!model) {
      player.sendMessage(
        `§cNo model selected. Please set a model using /scriptevent ollama:settings.`,
      );
      return false;
    }

    this.messages.push({ content: message, role: 'user', name: player.name });
    let functions = this.settings.functions
      ? SystemToolManager.definitions()
      : undefined;

    let response = await this.ollama.chat({
      model,
      messages: this.convertMessages([SystemMessage, ...this.messages]),
      stream: false,
      tools: functions,
      options: this.settings.options,
    });

    this.messages.push(response.message);

    let tool_calls = response.message.tool_calls;

    while (tool_calls && tool_calls.length > 0) {
      for (const tool_call of tool_calls) {
        const { name, arguments: args } = tool_call.function;

        try {
          const result = await SystemToolManager.callTool(name, args);
          this.messages.push({ role: 'tool', content: `${name}: ${result}` });
          player.sendMessage(
            `<Ollama Tool> ${name}(${JSON.stringify(
              args,
              null,
              2,
            )}) => §a${result}§r`,
          );
        } catch (e) {
          this.messages.push({ role: 'tool', content: `${name}: ${e}` });
          player.sendMessage(
            `<Ollama Tool> ${name}(${JSON.stringify(
              args,
              null,
              2,
            )}) => §c${e}§r`,
          );
        }
      }
      response = await this.ollama.chat({
        model,
        messages: this.convertMessages([SystemMessage, ...this.messages]),
        stream: false,
        tools: functions,
        options: this.settings.options,
      });
      this.messages.push(response.message);
      tool_calls = response.message.tool_calls;
    }

    player.sendMessage(`<OllamaBE> ${response.message.content}`);

    return true;
  }

  public load() {
    const property = world.getDynamicProperty(SessionWorldStorageID);
    if (typeof property !== 'string') return;

    const data = JSON.parse(property);

    const messages = data['messages'] as Message[] | undefined;
    if (messages !== undefined) {
      this.messages = messages;
    }

    const settings = data['settings'] as SessionSettings | undefined;
    if (settings !== undefined) {
      this.settings.functions = settings.functions;
      this.settings.host = settings.host;
      this.settings.model = settings.model;
      this.settings.options = settings.options;
    }
  }

  public save() {
    const data = {
      messages: this.messages,
      settings: this.settings,
    };

    world.setDynamicProperty(SessionWorldStorageID, JSON.stringify(data));
  }

  public clear() {
    this.messages = [];
  }
}
