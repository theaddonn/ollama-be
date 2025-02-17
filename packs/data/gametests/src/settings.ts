import { Player } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';
import { Options } from 'ollama/dist/browser.cjs';

export class SessionSettings {
  host: string | undefined;
  model: {
    available: string[];
    current: string | undefined;
  } = {
    available: ['Hello', 'not'],
    current: 'not',
  };
  options: Partial<Options> = {};

  public async edit(player: Player) {
    const form = new ModalFormData();

    form.label(
      "Edit the Ollama model settings below. These settings allow you to customize the behavior and performance of the model. Adjust the parameters to fine-tune the models' responses, control randomness, and manage repetition. Please review each option carefully and make the necessary changes to suit your needs.",
    );

    form.dropdown(
      'Set the current ollama model used',
      this.model.available,
      this.model.current
        ? this.model.available.indexOf(this.model.current)
        : undefined,
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

    const [
      model,
      temperature,
      seed,
      num_predict,
      repeat_penalty,
      repeat_last_n,
    ] = response.formValues as (string | undefined)[];

    if (model !== undefined) this.model.current = model as string;

    const parseAndSetOption = (
      value: string | undefined,
      parser: (val: string) => number,
      optionKey: keyof Partial<Options>,
    ) => {
      if (value !== undefined) {
        const parsedValue = parser(value);
        if (!isNaN(parsedValue)) {
          (this.options[optionKey] as number | undefined) = parsedValue;
        } else {
          this.options[optionKey] = undefined;
        }
      }
    };

    parseAndSetOption(temperature, parseFloat, 'temperature');
    parseAndSetOption(seed, parseInt, 'seed');
    parseAndSetOption(num_predict, parseInt, 'num_predict');
    parseAndSetOption(repeat_penalty, parseFloat, 'repeat_penalty');
    parseAndSetOption(repeat_last_n, parseInt, 'repeat_last_n');
  }
}
