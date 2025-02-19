import { GameMode, world } from '@minecraft/server';
import { ToolFn } from '../tool';

export class SetGamemodeFn implements ToolFn {
  static readonly id: string = 'set_gamemode';
  static readonly desc: string =
    'Sets the gamemode of a given player to the given gamemode.';

  required(): string[] {
    return ['player', 'gamemode'];
  }
  properties(): {
    [key: string]: { type: string; description: string; enum?: string[] };
  } {
    return {
      player: {
        type: 'string',
        description: 'The name of the player',
        enum: world.getAllPlayers().map((player) => player.name),
      },
      gamemode: {
        type: 'string',
        description: 'The gamemode',
        enum: [
          GameMode.survival,
          GameMode.adventure,
          GameMode.creative,
          GameMode.spectator,
        ],
      },
    };
  }

  handle(params: { [key: string]: any }): Promise<string> {
    const player_name = params['player'] as string | undefined;
    const gamemode_name = params['gamemode'] as string | undefined;

    if (player_name === undefined)
      return Promise.reject('Missing property: player');
    if (gamemode_name === undefined)
      return Promise.reject('Missing property: gamemode');

    const players = world.getPlayers({ name: player_name });

    if (players.length <= 0) {
      return Promise.reject(`No players with the name ${player_name} found!`);
    }

    const gamemode =
      GameMode[gamemode_name.toLowerCase() as keyof typeof GameMode];

    if (!gamemode) {
      return Promise.reject(`Unknown gamemode: ${gamemode_name}`);
    }

    for (const player of players) {
      player.setGameMode(gamemode);
    }

    return Promise.resolve(
      `Set gamemode of ${player_name} to ${gamemode_name}`,
    );
  }
}

export class GetGamemodeFn implements ToolFn {
  static readonly id: string = 'get_gamemode';
  static readonly desc: string = 'Gets the gamemode of a given player.';

  required(): string[] {
    return ['player'];
  }
  properties(): {
    [key: string]: { type: string; description: string; enum?: string[] };
  } {
    return {
      player: {
        type: 'string',
        description: 'The name of the player',
        enum: world.getAllPlayers().map((player) => player.name),
      },
    };
  }

  handle(params: { [key: string]: any }): Promise<string> {
    const player_name = params['player'] as string | undefined;

    if (player_name === undefined)
      return Promise.reject('Missing property: player');

    const players = world.getPlayers({ name: player_name });

    for (const player of players) {
      const gamemode = player.getGameMode();
      return Promise.resolve(`${player_name} is in gamemode ${gamemode}`);
    }

    return Promise.reject(`No players with the name ${player_name} found!`);
  }
}
