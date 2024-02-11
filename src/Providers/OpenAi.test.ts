import { beforeAll, describe, expect, it, vi } from 'vitest';
import { OPEN_AI_MAX_TTS_TEXT_LENGTH } from '~/consts';
import { TtsOpenAi } from './OpenAi';

describe('OpenAi', () => {
  let tts: TtsOpenAi;
  beforeAll(() => {
    vi.mock('openai');
    tts = new TtsOpenAi({
      apiKey: 'my-api-key',
    });
  });
  it('should speak', async () => {
    await tts.speak('Hello');
    expect(tts.getOrThrowAudio()).toBeInstanceOf(ArrayBuffer);
  });

  it('should list models', async () => {
    const models = await tts.listModels();
    expect(models).toEqual(['tts-1', 'tts-1-hd']);
  });

  it('should list voices', async () => {
    const voices = await tts.listVoices();
    expect(voices).toEqual(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']);
  });

  it('should speak long text', async () => {
    const longText = 'a'.repeat(OPEN_AI_MAX_TTS_TEXT_LENGTH + 1);
    await tts.longSpeak(longText);
    expect(tts.getOrThrowAudio()).toBeInstanceOf(ArrayBuffer);
  });
});
