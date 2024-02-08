import { OpenAI } from 'openai';
import { ProviderKeys, TtsProviders } from '../TtsProviders';
import { TElevenLabsVoiceSettings } from './TElevenLabs';

type SpeechCreateParams = Parameters<OpenAI['audio']['speech']['create']>[0];

interface DefaultSettings {
  provider: TtsProviders;
  apiKey?: string;
  voice?: string;
  model?: string;

  /**
   * audioDir is the directory to save the audio in
   */
  audioDir?: string;

  /**
   * Upload handler for the audio
   */
  uploadHandler?: <T = unknown>(audio: ArrayBuffer) => Promise<T>;
}

interface TGoogleSettings extends DefaultSettings {
  provider: TtsProviders.Google;
}
interface TElevenLabsSettings extends DefaultSettings {
  provider: TtsProviders.ElevenLabs;
  /**
   * in case of changing the voice settings other than the default from ElevenLabs
   */
  voiceSettings?: TElevenLabsVoiceSettings;
}
interface TOpenAiSettings extends DefaultSettings, Omit<SpeechCreateParams, 'voice' | 'model' | 'input'> {
  provider: TtsProviders.OpenAi;
  model: SpeechCreateParams['model'];
  voice: SpeechCreateParams['voice'];
}
type TSettings<P extends ProviderKeys> = P extends TtsProviders.Google
  ? TGoogleSettings
  : P extends TtsProviders.ElevenLabs
    ? TElevenLabsSettings
    : P extends TtsProviders.OpenAi
      ? TOpenAiSettings
      : never;

export { DefaultSettings, TElevenLabsSettings, TGoogleSettings, TOpenAiSettings, TSettings, TSettings as default };
