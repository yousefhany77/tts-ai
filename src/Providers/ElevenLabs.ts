import { ValidationError } from 'zod-validation-error';
import { DefaultSettings, TtsAbstract, TtsProviders } from '~/core';
import { IElevenLabsVoice, TElevenLabsError } from '~/core/types/TElevenLabs';
import { TElevenLabsSettings } from '~/core/types/TSettings';
import { FlattenZodError, OmitThisProperties } from '~/decorators';

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
      if (status === 400) {
        const error = (await response.json()) as TElevenLabsError;
        throw new ValidationError(error.detail.message);
      }
      if (status === 422) {
        const error = (await response.json()) as TElevenLabsError<'validation'>;
        const messages = error.detail.map((detail) => `${detail.type}: ${detail.loc.join('.')} ${detail.msg}`);
        throw new ValidationError(messages.join('\n'));
      }
      throw new ValidationError('Failed ElevenLabs API call');
    }
    return response;
  };

  @FlattenZodError
  @OmitThisProperties(['speak'])
  public async speak(text: string): Promise<Omit<this, 'speak'>> {
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
}
