import z, { ZodError } from 'zod';
import { ValidationError } from 'zod-validation-error';
import TtsProviders, { ProviderKeys, validateProvider } from '~/core/TtsProviders';
import TSettings from '~/core/types/TSettings';
import { Env } from '~/utils/Env';
import DefaultSettings from './DefaultSettings';
/**
 * Settings class
 * settings for each TTS provider
 *
 * each Provider has its own settings
 * @param {TSettings} _settings
 * supported Providers are {@link TtsProviders}
 */
class Settings<P extends ProviderKeys, T extends TSettings<P> = TSettings<P>> {
  constructor(public readonly _settings: T) {
    try {
      /**
       * check or throw for provider
       */
      this._settings.provider = validateProvider(this._settings.provider);

      /**
       * check or throw for apiKey
       */
      if (this._settings.provider !== TtsProviders.Google) {
        const validApiKey = z.string().optional().parse(this._settings.apiKey);

        this._settings.apiKey = validApiKey || Env.get(this._settings.provider + '_TTS_API_KEY').toString();
      }
      /**
       * check or throw for audioDir
       */
      this._settings.audioDir = z.string().optional().parse(this._settings.audioDir);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('invalid');
      }
      throw error;
    }
  }

  // type safe get settings related to the provider
  get values(): T {
    return this._settings;
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    if (!(key in this._settings)) {
      throw new ValidationError(
        `This setting ${String(key)} does not exist in the ${this._settings.provider} settings`
      );
    }

    if (key === 'provider') {
      this._settings.provider = validateProvider(value);
      return;
    }

    this._settings[key] = value;
  }
}

export { DefaultSettings, Settings as default };
