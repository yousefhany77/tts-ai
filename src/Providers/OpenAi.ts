import OpenAI from 'openai';
import z from 'zod';
import { OPEN_AI_MAX_TTS_TEXT_LENGTH } from '~/consts';
import { DefaultSettings, TtsAbstract, TtsProviders } from '~/core';
import { TOpenAiSettings } from '~/core/types/TSettings';
import { FlattenZodError } from '~/decorators';
import { MaxLength } from '~/decorators/MaxLength';
import { concatAudioBuffers } from '~/utils/concatArrayBuffer';
import { splitLongText } from '~/utils/split';

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
  @MaxLength(OPEN_AI_MAX_TTS_TEXT_LENGTH)
  public async speak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>> {
    z.string().parse(text);
    const audioResponse = await this.openAiSpeechFn({
      ...this._settings.values,
      input: text,
    });
    this.audio = await audioResponse.arrayBuffer();
    return this;
  }

  @FlattenZodError
  public async listModels(): Promise<TOpenAiSettings['model'][]> {
    /*
     * The list of models is hardcoded for now, since the OpenAI API does not provide a way to list only the TTS models.
      doing it as a promise for this method to be consistent with the rest of the providers, 
      since the other providers are async and has a lot of models not just 2
     */
    const list = ['tts-1', 'tts-1-hd'];
    return new Promise((resolve) => resolve(list));
  }

  @FlattenZodError
  public async listVoices(): Promise<TOpenAiSettings['voice'][]> {
    /*
     * The list of voices is hardcoded for now, since the OpenAI API does not provide a way to list only the TTS voices.
      doing it as a promise for this method to be consistent with the rest of the providers, 
      since the other providers are async and has a lot of voices not just 2
     */
    const list: TOpenAiSettings['voice'][] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    return new Promise((resolve) => resolve(list));
  }

  private async generateAudio(text: string): Promise<ArrayBuffer> {
    console.log('Generating audio for:', text);
    await this.speak(text);
    return this.getOrThrowAudio();
  }

  @FlattenZodError
  public async longSpeak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>> {
    const cleanText = text.replaceAll(/\s+/g, '');
    const shortText = splitLongText(cleanText, OPEN_AI_MAX_TTS_TEXT_LENGTH);

    // no limit: OpenAI has no limit for concurrent requests
    const maxConcurrentRequests = this._settings.values.maxConcurrentRequests || Infinity;
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
