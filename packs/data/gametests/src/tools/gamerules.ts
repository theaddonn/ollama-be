import { world } from '@minecraft/server';
import { ToolFn } from '../tool';

export class SetGameRuleFn implements ToolFn {
  static readonly id: string = 'set_game_rule';
  static readonly desc: string =
    'Sets the given gamerules in the Minecraft world to the specified values.';

  required: string[] = [];
  properties: {
    [key: string]: { type: string; description: string; enum?: string[] };
  } = {
    rule: {
      type: 'string',
      description: 'The name of the game rule to set.',
      enum: [
        'commandBlockOutput',
        'commandBlocksEnabled',
        'doDayLightCycle',
        'doEntityDrops',
        'doFireTick',
        'doImmediateRespawn',
        'doInsomnia',
        'doLimitedCrafting',
        'doMobLoot',
        'doMobSpawning',
        'doTileDrops',
        'doWeatherCycle',
        'drowningDamage',
        'fallDamage',
        'fireDamage',
        'freezeDamage',
        'functionCommandLimit',
        'keepInventory',
        'maxCommandChainLength',
        'mobGriefing',
        'naturalRegeneration',
        'playersSleepingPercentage',
        'projectilesCanBreakBlocks',
        'pvp',
        'randomTickSpeed',
        'recipesUnlock',
        'respawnBlocksExplode',
        'sendCommandFeedback',
        'showBorderEffect',
        'showCoordinates',
        'showDaysPlayed',
        'showDeathMessages',
        'showRecipeMessages',
        'showTags',
        'spawnRadius',
        'tntExplodes',
        'tntExplosionDropDecay',
      ],
    },
    value: {
      type: 'string',
      description:
        'The value to set the game rule to. Can be a string, integer, or boolean.',
    },
  };

  handle(params: { [key: string]: any }): Promise<string> {
    const rule = params['rule'] as keyof typeof world.gameRules;
    const value = params['value'];

    if (!rule) {
      return Promise.reject('No game rule specified');
    }

    if (value === undefined) {
      return Promise.reject('No value specified for the game rule');
    }

    const worldGameRules = world.gameRules;

    try {
      switch (typeof worldGameRules[rule]) {
        case 'boolean': {
          const booleanValue =
            typeof value === 'string' ? value.toLowerCase() === 'true' : value;

          if (typeof booleanValue !== 'boolean') {
            return Promise.reject(`Invalid type for ${rule}: expected boolean`);
          }

          (worldGameRules as any)[rule] = booleanValue;
          return Promise.resolve(
            `Game rule ${rule} updated to ${booleanValue}`,
          );
        }
        case 'number': {
          const numericValue =
            typeof value === 'string' ? parseInt(value, 10) : value;
          if (isNaN(numericValue)) {
            return Promise.reject(`Invalid type for ${rule}: expected number`);
          }
          (worldGameRules as any)[rule] = numericValue;
          return Promise.resolve(
            `Game rule ${rule} updated to ${numericValue}`,
          );
        }
        case 'undefined':
          return Promise.reject(`Unknown game rule: ${rule}`);
        default:
          return Promise.reject(`Unsupported type for ${rule}`);
      }
    } catch (e) {
      return Promise.reject(`Failed to set game rule ${rule}: ${e}`);
    }
  }
}

export class GetGameRuleFn implements ToolFn {
  static readonly id: string = 'get_game_rule';
  static readonly desc: string =
    'Gets the specified gamerules in the Minecraft world.';

  required: string[] = [];
  properties: {
    [key: string]: { type: string; description: string; enum?: string[] };
  } = {
    rule: {
      type: 'string',
      description: 'The name of the game rule to retrieve.',
      enum: [
        'commandBlockOutput',
        'commandBlocksEnabled',
        'doDayLightCycle',
        'doEntityDrops',
        'doFireTick',
        'doImmediateRespawn',
        'doInsomnia',
        'doLimitedCrafting',
        'doMobLoot',
        'doMobSpawning',
        'doTileDrops',
        'doWeatherCycle',
        'drowningDamage',
        'fallDamage',
        'fireDamage',
        'freezeDamage',
        'functionCommandLimit',
        'keepInventory',
        'maxCommandChainLength',
        'mobGriefing',
        'naturalRegeneration',
        'playersSleepingPercentage',
        'projectilesCanBreakBlocks',
        'pvp',
        'randomTickSpeed',
        'recipesUnlock',
        'respawnBlocksExplode',
        'sendCommandFeedback',
        'showBorderEffect',
        'showCoordinates',
        'showDaysPlayed',
        'showDeathMessages',
        'showRecipeMessages',
        'showTags',
        'spawnRadius',
        'tntExplodes',
        'tntExplosionDropDecay',
      ],
    },
  };

  handle(params: { [key: string]: any }): Promise<string> {
    const rule = params['rule'];

    if (!rule) {
      return Promise.reject('No game rule specified');
    }

    const worldGameRules = world.gameRules;

    // if (!(rule in this.properties.rule.enum!)) {
    //   return Promise.reject(`Game rule ${rule} does not exist`);
    // }

    try {
      const value = (worldGameRules as any)[rule];
      return Promise.resolve(`The value of game rule ${rule} is ${value}`);
    } catch (e) {
      return Promise.reject(`Failed to get game rule ${rule}: ${e}`);
    }
  }
}
