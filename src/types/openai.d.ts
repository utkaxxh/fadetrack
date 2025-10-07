declare module 'openai' {
  export default class OpenAI {
    constructor(config: { apiKey?: string });
    apiKey?: string;
    workflows: {
      runs: {
        create(input: { workflow_id: string; input: unknown }): Promise<{ id: string }>
        retrieve(id: string): Promise<{ status: 'queued' | 'running' | 'completed' | 'failed' | 'canceled'; output?: unknown }>
      }
    };
    chat: {
      completions: {
        create(input: unknown): Promise<unknown>
      }
    };
  }
}
