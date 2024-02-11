import { ValidationError } from 'zod-validation-error';
import { ELEVEN_LABS_MAX_TTS_TEXT_LENGTH } from '~/consts';
import { DefaultSettings, TtsAbstract, TtsProviders } from '~/core';
import { IElevenLabsVoice, TElevenLabsError } from '~/core/types/TElevenLabs';
import { TElevenLabsSettings } from '~/core/types/TSettings';
import { FlattenZodError } from '~/decorators';
import { MaxLength } from '~/decorators/MaxLength';
import { concatAudioBuffers } from '~/utils/concatArrayBuffer';
import { splitLongText } from '~/utils/split';

/**
 * TtsElevenLabs class with default settings
 */
export class TtsElevenLabs extends TtsAbstract<TtsProviders.ElevenLabs> {
  constructor(settings?: Omit<Partial<TElevenLabsSettings>, 'provider'>) {
    const mergedSettings: TElevenLabsSettings = {
      ...DefaultSettings.ElevenLabsSettings,
      ...settings,
    };

    super(mergedSettings);
  }
  static readonly elevenLabsApiUrl = 'https://api.elevenlabs.io/v1';
  private callApi = async (url: string, options: RequestInit): Promise<Response> => {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'xi-api-key': this._settings.values.apiKey as string,
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      const status = response.status;
      if (status < 422) {
        const error = (await response.json()) as TElevenLabsError;
        throw new ValidationError(error.detail.message);
      }
      if (status === 422) {
        const error = (await response.json()) as TElevenLabsError<'validation'>;
        const messages = error.detail.map((detail) => `${detail.type}: ${detail.loc.join('.')} ${detail.msg}`);
        throw new ValidationError(messages.join('\n'));
      }
      throw new Error('Failed ElevenLabs API call');
    }
    return response;
  };

  @FlattenZodError
  @MaxLength(ELEVEN_LABS_MAX_TTS_TEXT_LENGTH)
  public async speak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>> {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        model_id: this._settings.values.model,
        text,
        voice_settings: this._settings.values.voiceSettings,
      }),
    };

    const response = await this.callApi(
      `${TtsElevenLabs.elevenLabsApiUrl}/text-to-speech/${this._settings.values.voice}`,
      options
    );
    this.audio = await response.arrayBuffer();
    return this;
  }

  public async listModels(): Promise<string[]> {
    const options = {
      method: 'GET',
    };

    const response = await this.callApi(`${TtsElevenLabs.elevenLabsApiUrl}/models`, options);

    const data = (await response.json()) as { model_id: string; name: string }[];
    return data.map((model) => model.model_id);
  }

  public async listVoices(): Promise<IElevenLabsVoice[]> {
    const options = {
      method: 'GET',
    };

    const response = await this.callApi(`${TtsElevenLabs.elevenLabsApiUrl}/voices`, options);

    const data = (await response.json()) as { voices: IElevenLabsVoice[] };
    return data.voices;
  }
  private async generateAudio(text: string): Promise<ArrayBuffer> {
    await this.speak(text);
    return this.getOrThrowAudio();
  }

  @FlattenZodError
  public async longSpeak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>> {
    const cleanText = text.replaceAll(/\s+/g, '');
    const shortText = splitLongText(cleanText, ELEVEN_LABS_MAX_TTS_TEXT_LENGTH);
    const maxConcurrentRequests = this._settings.values.maxConcurrentRequests || 2;
    /**
     * using p-limit to limit the number of concurrent requests
     * used dynamic import because the library does not support commonjs
     */
    const limit = (await import('p-limit')).default(maxConcurrentRequests);

    const values = await Promise.all(shortText.map((t) => limit(() => this.generateAudio(t))));
    this.audio = concatAudioBuffers(values);

    return this;
  }
}
