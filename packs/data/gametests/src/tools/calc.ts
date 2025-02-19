import { ToolFn } from '../tool';
import Mexp from 'math-expression-evaluator';

export class CalcFn implements ToolFn {
  static readonly id: string = 'calculate';
  static readonly desc: string =
    'Calculates the result of a mathematical expression.';

  required(): string[] {
    return ['expression'];
  }
  properties(): {
    [key: string]: { type: string; description: string; enum?: string[] };
  } {
    return {
      expression: {
        type: 'string',
        description: 'The mathematical expression to evaluate',
      },
    };
  }

  private mexp = new Mexp();

  handle(params: { [key: string]: any }): Promise<string> {
    const expr = params['expression'] as string | undefined;

    if (expr === undefined)
      return Promise.reject('Missing property: expression');

    try {
      let result = this.mexp.eval(expr);
      return Promise.resolve(result.toString());
    } catch (e) {
      return Promise.reject(`Error while evaluation: ${e}`);
    }
  }
}
