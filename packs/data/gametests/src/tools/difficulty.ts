import { Difficulty, world } from '@minecraft/server';
import { ToolFn } from '../tool';

export class SetDifficultyFn implements ToolFn {
  static readonly id: string = 'set_difficulty';
  static readonly desc: string =
    'Sets the difficulty in the Minecraft world to the specified difficulty.';

  required: string[] = ['difficulty'];
  properties: {
    [key: string]: { type: string; description: string; enum?: string[] };
  } = {
    difficulty: {
      type: 'string',
      description: 'The difficulty to set in the Minecraft world',
      enum: ['peaceful', 'easy', 'normal', 'hard'],
    },
  };

  handle(params: { [key: string]: any }): Promise<string> {
    const difficulty_name = params['difficulty'] as string | undefined;

    if (difficulty_name === undefined)
      return Promise.reject('Missing property: difficulty');

    const difficulty = (() => {
      switch (difficulty_name.toLowerCase()) {
        case 'peaceful':
          return Difficulty.Peaceful;
        case 'easy':
          return Difficulty.Easy;
        case 'normal':
          return Difficulty.Normal;
        case 'hard':
          return Difficulty.Hard;
        default:
          throw new Error(`Unknown difficulty: ${difficulty_name}`);
      }
    })();

    try {
      world.setDifficulty(difficulty);
      return Promise.resolve(`Set difficulty to ${difficulty_name}`);
    } catch (e) {
      return Promise.reject(`Failed to set difficulty: ${e}`);
    }
  }
}

export class GetDifficultyFn implements ToolFn {
  static readonly id: string = 'get_difficulty';
  static readonly desc: string = 'Gets the difficulty in the Minecraft world.';

  required: string[] = [];
  properties: {
    [key: string]: { type: string; description: string; enum?: string[] };
  } = {};

  handle(_params: { [key: string]: any }): Promise<string> {
    const difficulty = world.getDifficulty();
    return Promise.resolve(`The difficulty is ${difficulty}`);
  }
}
