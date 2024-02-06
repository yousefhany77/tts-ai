import OpenAI from 'openai';
import z from 'zod';
import { DefaultSettings, TtsAbstract, TtsProviders } from '~/core';
import { TOpenAiSettings } from '~/core/types/TSettings';
import { FlattenZodError, OmitThisProperties } from '~/decorators';

/**
 * TtsOpenAi class with default settings
 */
export class TtsOpenAi extends TtsAbstract<TtsProviders.OpenAi> {
  private openAiSpeechFn: OpenAI['audio']['speech']['create'];

  constructor(settings?: Omit<Partial<TOpenAiSettings>, 'provider'>) {
    const mergedSettings: TOpenAiSettings = {
      ...DefaultSettings.OpenAiSettings,
      ...settings,
    };

    super(mergedSettings);

    const openAiSpeechFn = new OpenAI({
      apiKey: this._settings.values.apiKey,
    }).audio.speech;

    this.openAiSpeechFn = openAiSpeechFn.create.bind(openAiSpeechFn);
  }

  @FlattenZodError
  @OmitThisProperties(['speak'])
  public async speak(text: string): Promise<Omit<this, 'speak'>> {
    z.string().parse(text);
    const audioResponse = await this.openAiSpeechFn({
      ...this._settings.values,
      input: text,
    });
    this.audio = await audioResponse.arrayBuffer();
    return this;
  }

  public async listModels(): Promise<TOpenAiSettings['model'][]> {
    /*
     * The list of models is hardcoded for now, since the OpenAI API does not provide a way to list only the TTS models.
      doing it as a promise for this method to be consistent with the rest of the providers, 
      since the other providers are async and has a lot of models not just 2
     */
    const list = ['tts-1', 'tts-1-hd'];
    return new Promise((resolve) => resolve(list));
  }
}
