import { WeatherType, world } from '@minecraft/server';
import { ToolFn } from '../tool';

export class SetWeatherFn implements ToolFn {
  static readonly id: string = 'set_weather';
  static readonly desc: string =
    'Sets the weather in the Minecraft world to the specified weather.';

  required: string[] = ['weather'];
  properties: {
    [key: string]: { type: string; description: string; enum?: string[] };
  } = {
    weather: {
      type: 'string',
      description: 'The weather to set in the Minecraft world',
      enum: ['clear', 'rain', 'thunder'],
    },
    duration: {
      type: 'integer',
      description:
        'The duration of the weather (in ticks). If no duration is provided, the duration will be set to a random duration between 300 and 900 seconds.',
    },
  };

  handle(params: { [key: string]: any }): Promise<string> {
    const weather_name = params['weather'] as string | undefined;
    const duration = params['duration'] as string | undefined;

    let durationInt: number | undefined = undefined;

    if (duration !== undefined) {
      durationInt = parseInt(duration, 10);
    }

    if (weather_name === undefined)
      return Promise.reject('Missing property: weather');

    if (durationInt !== undefined && isNaN(durationInt))
      return Promise.reject('Property duration is NaN');

    const weather = (() => {
      switch (weather_name.toLowerCase()) {
        case 'clear':
          return WeatherType.Clear;
        case 'rain':
          return WeatherType.Rain;
        case 'thunder':
          return WeatherType.Thunder;
        default:
          throw new Error(`Unknown weather: ${weather_name}`);
      }
    })();

    try {
      world.getDimension('overworld').setWeather(weather, durationInt);
      return Promise.resolve(`Set weather to ${weather_name}`);
    } catch (e) {
      return Promise.reject(`Failed to weather: ${e}`);
    }
  }
}

export class GetWeatherFn implements ToolFn {
  static readonly id: string = 'get_weather';
  static readonly desc: string = 'Gets the weather in the Minecraft world.';

  required: string[] = [];
  properties: {
    [key: string]: { type: string; description: string; enum?: string[] };
  } = {};

  handle(_params: { [key: string]: any }): Promise<string> {
    const weather = world.getDimension('overworld').getWeather();
    return Promise.resolve(`The weather in the overworld is ${weather}`);
  }
}
