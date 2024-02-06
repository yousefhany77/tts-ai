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
   * storageApiUrl is the url of the storage api server to upload the audio to it instead of saving it locally
   * it should accept POST requests with the audio as binary in the body
   * the response should be the url of the uploaded audio
   */
  storageApiUrl?: string;

  fetchOptions?: Omit<RequestInit, 'body' | 'method'>;

  /**
   * audioDir is the directory to save the audio in
   */
  audioDir?: string;
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
