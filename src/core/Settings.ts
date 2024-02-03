import z from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ProviderKeys, TtsProviders, validateProvider } from '~/core/TtsProviders';
import TSettings from '~/core/types/TSettings';
import { Env } from '~/utils/Env';
/**
 * Settings class
 * settings for each TTS provider
 *
 * each Provider has its own settings
 * @param {TSettings} _settings
 * supported Providers are {@link TtsProviders}
 */
class Settings<P extends ProviderKeys, T extends TSettings<P>> {
  constructor(public readonly _settings: T) {
    /**
     * check or throw for provider
     */
    this._settings.provider = validateProvider(this._settings.provider);

    /**
     * check or throw for apiKey
     */
    const apikeyValidation = z.string().optional().safeParse(this._settings.apiKey);
    if (apikeyValidation.success === false) {
      throw fromZodError(apikeyValidation.error);
    }

    this._settings.apiKey = Env.get(this._settings.provider + '_TTSf_API_KEY', apikeyValidation.data).toString();

    /**
     * check or throw for audioDir
     */
    const audioDirValidation = z.string().optional().safeParse(this._settings.audioDir);
    if (!audioDirValidation.success) {
      throw fromZodError(audioDirValidation.error);
    }
    this._settings.audioDir = audioDirValidation.data;
  }

  // type safe get settings related to the provider
  get values(): T {
    return this._settings;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this._settings[key] = value;
  }
}

class DefaultSettings {
  static get OpenAiSettings(): Omit<TSettings<TtsProviders.OpenAi>, 'input'> {
    return {
      provider: TtsProviders.OpenAi,
      apiKey: Env.get(TtsProviders.OpenAi + '_TTS_API_KEY').toString(),
      voice: 'onyx',
      speed: 1,
      model: 'tts-1',
      response_format: 'mp3',
    };
  }
}

export { DefaultSettings, Settings as default };
