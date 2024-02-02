import { TtsProviders, validateProvider } from '~/core/TtsProviders';
import TSettings, { ProviderKeys } from '~/core/types/TSettings';
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
    this._settings.apiKey = Env.get(this._settings.provider + '_TTS_API_KEY', this._settings?.apiKey).toString();
  }

  // type safe get settings related to the provider
  get values(): T {
    return this._settings;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this._settings[key] = value;
  }
}

export class DefaultSettings {
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
export default Settings;
