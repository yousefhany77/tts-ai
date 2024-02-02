import { randomUUID } from 'crypto';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import * as z from 'zod';
import Settings from '../Settings';
import TSettings, { ProviderKeys } from '../types/TSettings';

/**
 * TtsAbstract class
 *
 * @template P - The type of provider keys.
 */
export abstract class TtsAbstract<P extends ProviderKeys> {
  public audioDir = 'audio';
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
  protected getOrThrowAudio(): ArrayBuffer {
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
  public abstract speak(text: string): Promise<Omit<this, 'save' | 'upload'>>;

  /**
   * Saves the audio in `this.audio` to a local file.
   * @param {string} filePath - The path of the file to save the audio to.
   * @returns {Promise<string>} A promise that resolves with the path of the saved file.
   * @example
   * const tts = new TtsOpenAi({ provider: TtsProviders.OpenAi });
   * tts.speak('Hello World').then(() => tts.save('./hello-world.mp3'));
   */
  public save(filePath?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        // check or create folder `audio` in the current directory
        const audioFolderDirExists = existsSync(this.audioDir);
        if (!audioFolderDirExists) {
          // create folder if not exists
          mkdirSync(this.audioDir);
        }
        // set file path to audio folder
        filePath = `${this.audioDir}/${randomUUID()}.mp3`;
      }
      const path = z
        .string({
          invalid_type_error: 'file path is not of type string',
          required_error: 'file path is required',
        })
        .parse(filePath);
      const audio = this.getOrThrowAudio();
      const stream = createWriteStream(path);

      stream.on('finish', () => {
        resolve(path);
      });

      stream.on('error', (err) => {
        reject(err);
      });

      stream.write(Buffer.from(audio));
      stream.end();
    });
  }

  /**
   * Uploads the audio in `this.audio` to a storage server specified in the settings.
   * @returns {Promise<string>} A promise that resolves with the URL of the uploaded audio.
   * @throws {Error} If the audio fails to upload.
   * @example
   * const tts = new TtsOpenAi({ provider: TtsProviders.OpenAi, storageApiUrl: 'https://storage-api.com/upload' });
   * tts.speak('Hello World').then(() => tts.upload()).then((url) => console.log(url));
   */
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
}
