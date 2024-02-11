import { OpenAI } from 'openai';
import { ProviderKeys, TtsProviders } from '../TtsProviders';
import { TElevenLabsVoiceSettings } from './TElevenLabs';
import { IVoiceSelectionParams } from './TGoogle';

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

interface TGoogleSettings extends Omit<DefaultSettings, 'voice' | 'apiKey'> {
  provider: TtsProviders.Google;
  voice?: IVoiceSelectionParams;
  /**
   * The path to the key file for the google cloud service account
   */
  keyFile?: string;
}
interface TElevenLabsSettings extends DefaultSettings {
  provider: TtsProviders.ElevenLabs;
  /**
   * in case of changing the voice settings other than the default from ElevenLabs
   */
  voiceSettings?: TElevenLabsVoiceSettings;

  /**
   * The maximum number of concurrent requests to the ElevenLabs API
   * @see https://help.elevenlabs.io/hc/en-us/articles/14312733311761-How-many-requests-can-I-make-and-can-I-increase-it
   *
   * Free: 2
   *  Starter: 3 Creator:
   * 5 Independent
   * Publisher: 10
   * Growing Business: 15
   */
  maxConcurrentRequests?: 2 | 3 | 5 | 10 | 15;
}
interface TOpenAiSettings extends DefaultSettings, Omit<SpeechCreateParams, 'voice' | 'model' | 'input'> {
  provider: TtsProviders.OpenAi;
  model: SpeechCreateParams['model'];
  voice: SpeechCreateParams['voice'];
  maxConcurrentRequests?: number;
}
type TSettings<P extends ProviderKeys> = P extends TtsProviders.Google
  ? TGoogleSettings
  : P extends TtsProviders.ElevenLabs
    ? TElevenLabsSettings
    : P extends TtsProviders.OpenAi
      ? TOpenAiSettings
      : never;

export { DefaultSettings, TElevenLabsSettings, TGoogleSettings, TOpenAiSettings, TSettings, TSettings as default };
