import { Player } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import { Options } from 'ollama/dist/browser.cjs';

export const OllamaDefaultHost = 'http://localhost:11434/';

export class SessionSettings {
  host: string | undefined;
  functions: boolean = true;
  model: {
    available: string[];
    current: string | undefined;
  } = {
    available: [],
    current: undefined,
  };
  options: Partial<Options> = {};

  public async edit(player: Player, healthy: boolean) {
    const form = new ModalFormData().title('OllamaBE Settings');

    form.label(
      "Customize the settings for the Ollama model provided below. These options let you adjust the models' behavior and performance by fine-tuning its responses, controlling randomness, and managing repetition.",
    );
    form.label(
      'Please review each option carefully and modify them as needed to meet your requirements.',
    );
    form.divider();

    form.label(
      'Specify the host URL for the Ollama model. This is where the model will be accessed from.',
    );
    form.textField('host', OllamaDefaultHost, this.host);
    form.divider();

    form.label(
      'Select the Ollama model you want to use from the available options below.',
    );
    if (healthy) {
      form.dropdown(
        'model',
        this.model.available,
        this.model.current
          ? this.model.available.indexOf(this.model.current)
          : undefined,
      );
    } else {
      form.label('Failed to retrieve models.');
    }
    form.divider();

    form.label('functions');
    form.toggle(
      'Enable or disable Ollama tools. Turning this on will allow the mode to run and interact with your world. Note: Not all models support this feature.',
      this.functions,
    );
    form.divider();

    const settings = [
      {
        label:
          'The temperature of the model. Increasing the temperature will make the model answer more creatively.',
        key: 'temperature',
        defaultValue: '0.8',
        value: this.options.temperature?.toString(),
      },
      {
        label:
          'Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt.',
        key: 'seed',
        defaultValue: '0',
        value: this.options.seed?.toString(),
      },
      {
        label:
          'Maximum number of tokens to predict when generating text. (-1 = infinite)',
        key: 'num_predict',
        defaultValue: '-1',
        value: this.options.num_predict?.toString(),
      },
      {
        label:
          'Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient.',
        key: 'repeat_penalty',
        defaultValue: '1.1',
        value: this.options.repeat_penalty?.toString(),
      },
      {
        label:
          'Sets how far back for the model to look back to prevent repetition. (0 = disabled, -1 = num_ctx)',
        key: 'repeat_last_n',
        defaultValue: '64',
        value: this.options.repeat_last_n?.toString(),
      },
    ];

    settings.forEach((setting) => {
      form.label(setting.label);
      form.textField(setting.key, setting.defaultValue, setting.value);
      form.divider();
    });

    const response = await form.show(player);

    if (response.formValues === undefined) return;

    const formValues = response.formValues;
    let index = 0;

    const host = formValues[index++];

    if (healthy) {
      const model = formValues[index++];
      if (model !== undefined && typeof model === 'number') {
        this.model.current = this.model.available[model];
      }
    }

    const functions = formValues[index++];
    const temperature = formValues[index++];
    const seed = formValues[index++];
    const num_predict = formValues[index++];
    const repeat_penalty = formValues[index++];
    const repeat_last_n = formValues[index++];

    if (host !== undefined && typeof host === 'string' && host.trim() !== '') {
      this.host = host;
    }

    if (functions !== undefined && typeof functions === 'boolean') {
      this.functions = functions;
    }

    const parseAndSetOptionFromString = (
      value: string | number | boolean | undefined,
      parser: (val: string) => number,
      optionKey: keyof Partial<Options>,
    ) => {
      if (value !== undefined && typeof value === 'string') {
        const parsedValue = parser(value);
        if (!isNaN(parsedValue)) {
          (this.options[optionKey] as number | undefined) = parsedValue;
        } else {
          this.options[optionKey] = undefined;
        }
      }
    };

    parseAndSetOptionFromString(temperature, parseFloat, 'temperature');
    parseAndSetOptionFromString(seed, parseInt, 'seed');
    parseAndSetOptionFromString(num_predict, parseInt, 'num_predict');
    parseAndSetOptionFromString(repeat_penalty, parseFloat, 'repeat_penalty');
    parseAndSetOptionFromString(repeat_last_n, parseInt, 'repeat_last_n');
  }
}
