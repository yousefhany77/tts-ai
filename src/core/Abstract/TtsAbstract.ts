import { randomUUID } from 'crypto';
import { existsSync, promises as fs, mkdirSync } from 'fs';
import { dirname } from 'path';
import * as z from 'zod';
import { FlattenZodError } from '~/decorators';
import { IsArrayBuffer } from '~/decorators/isArrayBuffer';
import Settings from '../Settings';
import { ProviderKeys } from '../TtsProviders';
import TSettings from '../types/TSettings';

/**
 * TtsAbstract class
 *
 * @template P - The type of provider keys.
 */
export abstract class TtsAbstract<P extends ProviderKeys> {
  public readonly audioDir = 'audio';

  @IsArrayBuffer(true)
  protected audio: ArrayBuffer | null = null;
  protected readonly _settings: Settings<P, TSettings<P>>;

  /**
   * Creates an instance of TtsAbstract.
   * @param {TSettings<P>} settings - The settings for the TTS provider.
   */
  constructor(settings: TSettings<P>) {
    this._settings = new Settings(settings);
  }

  /**
   * Retrieves the audio as an ArrayBuffer.
   * @throws {Error} If the audio is not of type ArrayBuffer.
   * @returns {ArrayBuffer} The audio as an ArrayBuffer.
   */
  @FlattenZodError
  public getOrThrowAudio(): ArrayBuffer {
    const schema = z.instanceof(ArrayBuffer, {
      message: 'audio is not of type ArrayBuffer',
    });
    return schema.parse(this.audio);
  }

  /**
   * Speaks the given text and returns the audio as an ArrayBuffer.
   * @param {string} text - The text to be spoken.
   * @returns {Promise<ArrayBuffer>} A promise that resolves with the audio as an ArrayBuffer.
   * @example
   * const tts = new TtsOpenAi({ provider: TtsProviders.OpenAi });
   * tts.speak('Hello World').then((audioArrayBuffer) => console.log(audioArrayBuffer));
   */
  public abstract speak(text: string): Promise<Omit<this, 'speak'>>;

  /**
   * Lists the available voices for the TTS provider.
   */
  public abstract listModels(): Promise<string[]>;

  /**
   * Saves the audio in `this.audio` to a local file.
   * @param {string} filePath - The path of the file to save the audio to.
   * @returns {Promise<string>} A promise that resolves with the path of the saved file.
   * @example
   * const tts = new TtsOpenAi({ provider: TtsProviders.OpenAi });
   * tts.speak('Hello World').then(() => tts.save('./hello-world.mp3'));
   */
  @FlattenZodError
  public async save(filePath?: string): Promise<string> {
    if (!filePath) {
      filePath = `${this.audioDir}/${randomUUID()}.mp3`;
    }

    const path = await z
      .string({
        invalid_type_error: 'file path is not of type string',
        required_error: 'file path is required',
      })
      .parseAsync(filePath);

    const audio = this.getOrThrowAudio();

    const folderPath = dirname(path);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    await fs.writeFile(path, Buffer.from(audio));

    return path;
  }

  /**
   * Uploads the audio in `this.audio` to a storage server specified in the settings.
   * @returns {Promise<string>} A promise that resolves with the URL of the uploaded audio.
   * @throws {Error} If the audio fails to upload.
   * @example
   * const tts = new TtsOpenAi({ provider: TtsProviders.OpenAi, storageApiUrl: 'https://storage-api.com/upload' });
   * tts.speak('Hello World').then(() => tts.upload()).then((url) => console.log(url));
   */
  @FlattenZodError
  public async upload(): Promise<string> {
    const audio = this.getOrThrowAudio();

    const { storageApiUrl, fetchOptions } = z
      .object({
        storageApiUrl: z
          .string({
            description: 'The URL of the storage API to upload the audio to.',
            invalid_type_error: 'storage API URL is not of type string',
            required_error: 'storage API URL is required',
          })
          .url({
            message: 'storage API URL is not a valid URL',
          }),
        fetchOptions: z
          .object({
            headers: z.record(z.string()).optional(),
          })
          .optional(),
      })
      .parse({
        storageApiUrl: this._settings.values.storageApiUrl,
        fetchOptions: this._settings.values.fetchOptions,
      });

    const response = await fetch(storageApiUrl, {
      ...fetchOptions,
      method: 'POST',
      body: audio,
      cache: 'no-cache',
      headers: {
        'Content-Type': 'audio/mp3',
        ...fetchOptions?.headers,
      },
    });

    if (!response.ok) {
      throw new Error('failed to upload audio');
    }
    const json = await response.json();

    const { url: uploadedUrl } = z
      .object({
        url: z
          .string({
            description: 'The URL of the uploaded audio.',
            invalid_type_error: 'URL is not of type string',
            required_error: 'URL is required',
          })
          .url(),
      })
      .parse(json);
    return uploadedUrl;
  }

  /**
   * change the voice of the tts
   */
  @FlattenZodError
  public setVoice(voice: string): void {
    this._settings.set('voice', voice);
  }

  /**
   * change AI model of the tts
   */
  @FlattenZodError
  public setModel(model: string): void {
    this._settings.set('model', model);
  }
}
