import {
  EntityComponentTypes,
  EntityInventoryComponent,
  ItemStack,
  ItemTypes,
  world,
} from '@minecraft/server';
import { ToolFn } from '../tool';

export class GiveFn implements ToolFn {
  static readonly id: string = 'give';
  static readonly desc: string = 'Gives a player the given item.';

  required(): string[] {
    return ['player', 'item'];
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
      item: {
        type: 'string',
        description: 'The identifier of the item to give',
      },
      amount: {
        type: 'integer',
        description: 'The amount of items to give',
      },
    };
  }

  handle(params: { [key: string]: any }): Promise<string> {
    const player_name = params['player'] as string | undefined;
    const item_name = params['item'] as string | undefined;
    const amount_str = params['amount'] as string | number | undefined;

    let amount: number | undefined = undefined;

    if (typeof amount_str === 'string') {
      amount = parseInt(amount_str, 10);
    } else {
      amount = amount_str;
    }

    if (player_name === undefined)
      return Promise.reject('Missing property: player');
    if (item_name === undefined)
      return Promise.reject('Missing property: item');
    if (amount !== undefined && isNaN(amount))
      return Promise.reject('Property amount is NaN');

    const players = world.getPlayers({ name: player_name });

    if (players.length <= 0) {
      return Promise.reject(`No players with the name ${player_name} found!`);
    }

    const item = ItemTypes.get(item_name);

    if (item === undefined) {
      return Promise.reject(`Unknown item: ${item_name}`);
    }

    for (const player of players) {
      const inv = player.getComponent(
        EntityComponentTypes.Inventory,
      ) as EntityInventoryComponent;

      inv.container.addItem(
        new ItemStack(item, amount ? amount % 256 : undefined),
      );
    }

    return Promise.resolve(
      `Gave ${amount_str ?? 1}x ${item_name} to ${player_name}`,
    );
  }
}
