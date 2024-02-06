import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DefaultSettings, TtsProviders } from '..';
import { TOpenAiSettings } from '../types/TSettings';

describe('DefaultSettings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return the default OpenAi settings', () => {
    const expectedSettings: TOpenAiSettings = {
      provider: TtsProviders.OpenAi,
      voice: 'onyx',
      speed: 1,
      model: 'tts-1',
      response_format: 'mp3',
    };

    const settings = DefaultSettings.OpenAiSettings;
    expect(settings).toEqual(expectedSettings);
  });
});
