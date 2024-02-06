import { describe, expect, it } from 'vitest';
import { ValidationError } from 'zod-validation-error';
import Settings from '.';
import { TtsProviders } from '..';
import { TOpenAiSettings } from '../types/TSettings';

describe('Settings', () => {
  const mockSettings: TOpenAiSettings = {
    provider: TtsProviders.OpenAi,
    apiKey: 'sk-1234567890',
    audioDir: './audio',
    model: 'tts-1',
    voice: 'onyx',
  };

  const createSettings = (settings = mockSettings): Settings<TtsProviders.OpenAi> => new Settings(settings);

  const createInvalidSettings = (
    invalidValues: Partial<Record<keyof typeof mockSettings, any>>
  ): (() => Settings<TtsProviders.OpenAi>) => {
    return function () {
      return new Settings({ ...mockSettings, ...invalidValues });
    };
  };

  it('should create a new instance of Settings', () => {
    const settings = createSettings();
    expect(settings).toBeInstanceOf(Settings);
  });

  it('should validate and set the provider', () => {
    const settings = createSettings();
    expect(settings.values.provider).toBe(TtsProviders.OpenAi);
  });

  it('should validate and set the apiKey', () => {
    const settings = createSettings();
    expect(settings.values.apiKey).toBe('sk-1234567890');
  });

  it('should validate and set the audioDir', () => {
    const settings = createSettings();
    expect(settings.values.audioDir).toBe('./audio');
  });

  it('should throw an error if provider is invalid', () => {
    const invalidSettings = {
      provider: 'invalid-provider',
    };
    expect(createInvalidSettings(invalidSettings)).toThrowError(ValidationError);
  });

  it('should throw an error if apiKey is not a string', () => {
    const invalidSettings = { apiKey: 123 };
    expect(createInvalidSettings(invalidSettings)).toThrowError(ValidationError);
  });

  it('should throw an error if audioDir is not a string', () => {
    const invalidSettings = { audioDir: 123 };
    expect(createInvalidSettings(invalidSettings)).toThrowError(ValidationError);
  });

  it('should throw an error if setting a setting does not exist', () => {
    const settings = createSettings();
    expect(() => settings.set('invalidSetting' as any, 'value')).toThrowError(ValidationError);
  });

  it('should throw an error if setting a provider with an invalid value', () => {
    const settings = createSettings();
    expect(() => settings.set('provider', 'invalid-provider' as TtsProviders.OpenAi)).toThrowError(ValidationError);
  });

  it('should set a new value for a setting', () => {
    const settings = createSettings();
    settings.set('apiKey', 'new-api-key');
    expect(settings.values.apiKey).toBe('new-api-key');
  });
});
