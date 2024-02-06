import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
// import { MockOpenAI } from '../../__mocks__/OpenAi';
import { TtsOpenAi } from './OpenAi';

describe('OpenAi', () => {
  beforeAll(() => {
    vi.mock('openai');
  });
  it('should speak', async () => {
    const tts = new TtsOpenAi({
      apiKey: 'my-api-key',
    });
    await tts.speak('Hello');
    expect(tts.getOrThrowAudio()).toBeInstanceOf(ArrayBuffer);
  });

  it('should list models', async () => {
    const tts = new TtsOpenAi({
      apiKey: 'my-api-key',
    });
    const models = await tts.listModels();
    expect(models).toEqual(['tts-1', 'tts-1-hd']);
  });
  afterAll(() => {
    vi.resetModules();
  });
});
