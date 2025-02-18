//import { Logger, Polyfill } from '@bedrock-oss/bedrock-boost';
import 'core-js/web/url';
import { Player, system } from '@minecraft/server';
import { Session } from './session';

// Polyfill.installPlayer();
// Polyfill.installConsole();

//const log = Logger.getLogger('OllamaBE');

const session = new Session();
system.run(() => {
  session.load();
});

system.beforeEvents.shutdown.subscribe((_) => {
  system.run(session.save);
});

system.afterEvents.scriptEventReceive.subscribe(async (event) => {
  if (
    event.sourceEntity === undefined ||
    !event.sourceEntity.matches({ type: 'minecraft:player' })
  )
    return;

  const player = event.sourceEntity as Player;

  switch (event.id) {
    case 'ollama:edit':
    case 'ollama:settings':
      {
        const healthy = await session.doctor(player);
        if (healthy) {
          await session.updateModels();
        }
        await session.edit(player, healthy);
      }
      break;
    case 'ollama:chat':
      {
        const healthy = await session.doctor(player);
        if (healthy) {
          await session.chat(event.message, player);
        }
      }
      break;
    case 'ollama:clear':
      {
        session.clear();
      }
      break;
    case 'ollama:doctor':
      {
        if (await session.doctor()) {
          player.sendMessage('§aOllama is operational and in good health!');
        }
      }
      break;
    case 'ollama:help':
      {
        player.sendMessage('Available script events:');
        player.sendMessage('ollama:settings - §oEdit session settings');
        player.sendMessage('ollama:chat - §oSend a chat message');
        player.sendMessage('ollama:clear - §oClear the session data');
        player.sendMessage('ollama:doctor - §oCheck the health of the system');
        player.sendMessage('ollama:help - §oDisplay this help message');
      }
      break;
  }

  session.save();
});
