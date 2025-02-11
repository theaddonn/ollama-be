//import { Logger, Polyfill } from '@bedrock-oss/bedrock-boost';
import { Player, system, world } from '@minecraft/server';
import 'core-js/web/url';
import { Ollama, ModelResponse } from 'ollama/dist/browser.cjs';
import { fetch } from './fetch';

// Polyfill.installPlayer();
// Polyfill.installConsole();

//const log = Logger.getLogger('OllamaBE');

const OllamaScriptEventNamespace = 'ollama:';

const ollama = new Ollama({
  fetch: fetch,
});

system.afterEvents.scriptEventReceive.subscribe(async (event) => {
  switch (event.id) {
    case OllamaScriptEventNamespace + 'settings':
    case OllamaScriptEventNamespace + 'chat':
      {
        const chat = await ollama.chat({
          model: 'llama3.1:latest',
          messages: [{ role: 'user', content: event.message }],
          options: { num_predict: 100 },
        });

        console.log(`AI: ${chat.message.content}`);
      }
      break;
    case OllamaScriptEventNamespace + 'doctor':
      break;
    case OllamaScriptEventNamespace + 'list':
      {
        const list = await ollama.list();
        const models = list.models
          .map((model: ModelResponse) => {
            return `- ${model.name}`;
          })
          .join('\n');

        console.log(`Available Models: \n${models}`);
      }
      break;
  }
});

world.afterEvents.chatSend.subscribe(async (event) => {
  const player = event.sender;

  addChatMessage(player, { content: event.message, role: 'user' });

  const chat = await ollama.chat({
    model: 'llama2-uncensored:latest',
    messages: getChatMessages(player),
    options: { num_predict: 100 },
  });

  addChatMessage(player, { content: chat.message.content, role: 'assistant' });
  event.sender.sendMessage(`<AI> ${chat.message.content}`);
});

function addChatMessage(
  player: Player,
  message: { content: string; role: string }
) {
  let messages = getChatMessages(player);

  if (messages === undefined) {
    messages = [];
  }

  messages.push(message);

  setChatMessages(player, messages);
}

function getChatMessages(
  player: Player
): { content: string; role: string }[] | undefined {
  const dynamicProperty = player.getDynamicProperty('ollama:chat') as
    | string
    | undefined;

  if (dynamicProperty === undefined) return undefined;

  const messages: { content: string; role: string }[] =
    JSON.parse(dynamicProperty);

  return messages;
}

function setChatMessages(
  player: Player,
  messages: { content: string; role: string }[]
) {
  player.setDynamicProperty('ollama:chat', JSON.stringify(messages));
}
