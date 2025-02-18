//import { Logger, Polyfill } from '@bedrock-oss/bedrock-boost';
import 'core-js/web/url';
import { Player, system, world } from '@minecraft/server';
import { Session } from './session';

// Polyfill.installPlayer();
// Polyfill.installConsole();

//const log = Logger.getLogger('OllamaBE');

const session = new Session();

system.beforeEvents.startup.subscribe((_) => {
  session.load();
});

system.beforeEvents.shutdown.subscribe((_) => {
  session.save();
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
  }

  session.save();
});
