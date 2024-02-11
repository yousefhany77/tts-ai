import { TtsProviders } from '~/core/TtsProviders';
import TSettings from '~/core/types/TSettings';

class DefaultSettings {
  static get OpenAiSettings(): Omit<TSettings<TtsProviders.OpenAi>, 'input'> {
    return {
      provider: TtsProviders.OpenAi,
      voice: 'onyx',
      speed: 1,
      model: 'tts-1',
      response_format: 'mp3',
    };
  }
  static get ElevenLabsSettings(): Omit<TSettings<TtsProviders.ElevenLabs>, 'voiceSettings'> {
    return {
      provider: TtsProviders.ElevenLabs,
      voice: '29vD33N1CtxCmqQRPOHJ', // ElevenLabs voice id
      model: 'eleven_multilingual_v1',
      maxConcurrentRequests: 2,
    };
  }
  static get GoogleSettings(): Omit<TSettings<TtsProviders.Google>, 'apiKey'> {
    return {
      provider: TtsProviders.Google,
      voice: { languageCode: 'en-GB', ssmlGender: 'MALE', name: 'en-GB-Neural2-D' },
    };
  }
}

export default DefaultSettings;
