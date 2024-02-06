export default class MockOpenAI {
  constructor() {}

  public get audio(): {
    speech: {
      create: (text: string) => { arrayBuffer: () => Promise<ArrayBuffer> };
    };
  } {
    const speech = {
      create: (
        text: string
      ): {
        arrayBuffer: () => Promise<ArrayBuffer>;
      } => {
        const buffer = new ArrayBuffer(text.length);
        return {
          arrayBuffer: () => Promise.resolve(buffer),
        };
      },
    };
    return { speech };
  }
}
