import { Tool } from 'ollama/dist/browser.cjs';

export interface ToolFn {
  required: string[];
  properties: {
    [key: string]: {
      type: string;
      description: string;
      enum?: string[];
    };
  };

  handle(params: { [key: string]: any }): Promise<string>;
}

export class ToolManager {
  tools: Map<string, [string, ToolFn]> = new Map();

  public definitions(): Tool[] {
    return Array.from(this.tools).map(([name, [description, tool]]) => {
      return {
        type: 'function',
        function: {
          name: name,
          description: description,
          parameters: {
            type: 'object',
            properties: tool.properties,
            required: tool.required,
          },
        },
      };
    });
  }

  public registerTool(
    id: string,
    description: string,
    tool: ToolFn,
  ): ToolManager {
    this.tools.set(id, [description, tool]);
    return this;
  }

  public async callTool(
    id: string,
    params: { [key: string]: any },
  ): Promise<string> {
    const tool = this.tools.get(id);

    if (tool === undefined) throw new Error(`Unknown Tool used: ${id}`);

    try {
      const response = await tool[1].handle(params);
      return response;
    } catch (e) {
      throw new Error(`Tool used (${id}) threw ${e}`);
    }
  }
}
