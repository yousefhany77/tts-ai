import { existsSync, promises as fs, mkdirSync } from 'fs';
import { dirname } from 'path';
import * as z from 'zod';
import { ValidationError } from 'zod-validation-error';
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
  public abstract speak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>>;

  /**
   * longSpeak is used to speak long text and returns the audio as an ArrayBuffer.
   * it's used to bypass the text length limit of the TTS provider. by splitting the text   into multiple parts and then concatenating the audio parts. or use a native method from the provider if supported.
   * @param {string} text - The text to be spoken.
   * @returns {Promise<ArrayBuffer>} A promise that resolves with the audio as an ArrayBuffer.
   * @example
   * const tts = new TtsOpenAi({ provider: TtsProviders.OpenAi });
   * tts.longSpeak('Hello World').then((audioArrayBuffer) => console.log(audioArrayBuffer));
   */
  public abstract longSpeak(text: string): Promise<Omit<this, 'speak' | 'longSpeak'>>;

  /**
   * Lists the available models for the TTS provider.
   */
  public abstract listModels(): Promise<unknown[]>;

  /**
   * Lists the available voices for the TTS provider.
   */
  public abstract listVoices(props?: unknown): Promise<unknown[]>;

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
      filePath = `${this.audioDir}/${Date.now()}.mp3`;
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

  @FlattenZodError
  @FlattenZodError
  public async upload<T>(): Promise<T> {
    const audio = this.getOrThrowAudio();

    const uploadHandler = this._settings.values.uploadHandler;
    if (!uploadHandler || typeof uploadHandler !== 'function') {
      throw new ValidationError('uploadHandler is not defined or is not a function');
    }

    return uploadHandler<T>(audio);
  }

  /**
   * change the voice of the tts
   */
  @FlattenZodError
  public setVoice(voice: NonNullable<Settings<P, TSettings<P>>['_settings']['voice']>): this {
    this._settings.set('voice', voice);
    return this;
  }

  /**
   * change AI model of the tts
   */
  @FlattenZodError
  public setModel(model: string): void {
    this._settings.set('model', model);
  }
}
