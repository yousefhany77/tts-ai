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
    };
  }
}

export default DefaultSettings;
