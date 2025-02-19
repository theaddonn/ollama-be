import { TicksPerDay, world } from '@minecraft/server';
import { ToolFn } from '../tool';

export class SetTimeOfDayFn implements ToolFn {
  static readonly id: string = 'set_time_of_day';
  static readonly desc: string =
    'Sets the time of day in the Minecraft world to the specified value in ticks.';

  required(): string[] {
    return ['time'];
  }
  properties(): {
    [key: string]: { type: string; description: string; enum?: string[] };
  } {
    return {
      time: {
        type: 'integer',
        description:
          'The time of day in ticks (between 0 and 24000, 0 = 0AM, 12000 = 12PM, 24000 = 24AM )',
      },
    };
  }

  handle(params: { [key: string]: any }): Promise<string> {
    const time = parseInt(params['time'], 10);

    if (isNaN(time)) return Promise.reject('Invalid or missing property: time');

    try {
      world.setTimeOfDay((TicksPerDay + time - TicksPerDay / 4) % TicksPerDay);
      return Promise.resolve(`Set time of day to ${time}`);
    } catch (e) {
      return Promise.reject(`Failed to set time of day: ${e}`);
    }
  }
}

export class GetTimeOfDayFn implements ToolFn {
  static readonly id: string = 'get_time_of_day';
  static readonly desc: string =
    'Gets the time of day in the Minecraft world in ticks.';

  required(): string[] {
    return [];
  }
  properties(): {
    [key: string]: { type: string; description: string; enum?: string[] };
  } {
    return {};
  }

  handle(_params: { [key: string]: any }): Promise<string> {
    const time = world.getTimeOfDay();
    return Promise.resolve(
      `The time of day is ${(time + TicksPerDay / 4) % TicksPerDay} in ticks`,
    );
  }
}
