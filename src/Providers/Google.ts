import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { ValidationError } from 'zod-validation-error';
import { GOOGLE_LABS_MAX_TTS_TEXT_LENGTH } from '~/consts';
import { DefaultSettings, TtsAbstract, TtsProviders } from '~/core';
import { IListVoicesRequest, IVoice } from '~/core/types/TGoogle';
import { TGoogleSettings } from '~/core/types/TSettings';
import { FlattenZodError } from '~/decorators';
import { MaxLength } from '~/decorators/MaxLength';
import { Env } from '~/utils/Env';

export class TtsGoogle extends TtsAbstract<TtsProviders.Google> {
  private readonly ttsClient: TextToSpeechClient;

  constructor(settings?: Omit<Partial<TGoogleSettings>, 'provider'>) {
    const keyFile = Env.get('GOOGLE_APPLICATION_CREDENTIALS', settings?.keyFile, {
      errorMessage:
        'Google TTS requires a keyFile to be , The path to the json key file for the google cloud service account',
    }).toString();

    const mergedSettings: TGoogleSettings = {
      ...DefaultSettings.GoogleSettings,
      ...settings,
      keyFile,
    };

    super(mergedSettings);
    this.ttsClient = new TextToSpeechClient({
      keyFile: this._settings.values.keyFile,
    });
  }

  @FlattenZodError
  public async listVoices(props?: IListVoicesRequest): Promise<IVoice[]> {
    const [{ voices }] = await this.ttsClient.listVoices(props);
    return voices || [];
  }

  public listModels(): never {
    throw new ValidationError(
      'Not Supported by Google TTS: google does not support listing models it has only one model'
    );
  }

  private async generateAudio(text: string, isLongText = false): Promise<ArrayBuffer> {
    const longrunning = isLongText
      ? {
          initialRetryDelayMillis: 1000,
          maxRetryDelayMillis: 10000,
          retryDelayMultiplier: 1.3,
        }
      : undefined;
    const [response] = await this.ttsClient.synthesizeSpeech(
      {
        input: { text },
        voice: this._settings._settings.voice,
        audioConfig: { audioEncoding: 'MP3' },
      },
      {
        longrunning,
      }
    );
    if (!response.audioContent) {
      throw new Error('No audio content found');
    }

    if (response.audioContent instanceof Uint8Array) {
      return Buffer.from(response.audioContent).buffer;
    }
    return Buffer.from(response.audioContent, 'base64').buffer;
  }

  @MaxLength(GOOGLE_LABS_MAX_TTS_TEXT_LENGTH)
  @FlattenZodError
  public async speak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>> {
    this.audio = await this.generateAudio(text);

    return this;
  }

  @FlattenZodError
  public async longSpeak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>> {
    this.audio = await this.generateAudio(text, true);
    return this;
  }
}
