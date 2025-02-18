import { ToolFn } from '../tool';
import Mexp from 'math-expression-evaluator';

export class EvalFn implements ToolFn {
  static readonly id: string = 'eval';
  static readonly desc: string =
    'Evaluates a mathematical expression and returns the result as a string.';

  required: string[] = ['expression'];
  properties: {
    [key: string]: { type: string; description: string; enum?: string[] };
  } = {
    expression: {
      type: 'string',
      description: 'The mathematical expression to evaluate',
    },
  };

  private mexp = new Mexp();

  handle(params: { [key: string]: any }): Promise<string> {
    const expr = params['expression'] as string | undefined;

    if (expr === undefined) throw Error('Missing property: expression');

    let result = this.mexp.eval(expr);

    return Promise.resolve(result.toString());
  }
}
