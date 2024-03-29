import { existsSync, rmdirSync, unlink, unlinkSync } from 'fs';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { ValidationError } from 'zod-validation-error';
import { TtsAbstract } from '~/core';

const mockSettings = {
  apiKey: 'sk-1234567890',
  provider: 'OpenAi' as any, // TtsProviders.OpenAi
};
const buffer = new ArrayBuffer(44100 * 2);

describe('TtsAbstract', () => {
  class MockTtsAbstract extends TtsAbstract<any> {
    protected audio: ArrayBuffer | null = buffer;
    public speak(_text: string): Promise<Omit<this, 'speak'>> {
      _text;
      throw new Error('Method not implemented.');
    }
    public listModels(): Promise<string[]> {
      throw new Error('Method not implemented.');
    }
  }

  describe('Constructor', () => {
    it('should throw an error if provider is not valid', () => {
      expect(() => new MockTtsAbstract({ ...mockSettings, provider: 'invalid' as any })).toThrowError(ValidationError);
    });

    it('should throw an error if provider is not provided', () => {
      expect(() => new MockTtsAbstract({ ...mockSettings, provider: undefined as any })).toThrowError(ValidationError);
    });

    it('should create a new instance', () => {
      const tts = new MockTtsAbstract(mockSettings);
      expect(tts).toBeInstanceOf(TtsAbstract);
    });
    it('should throw an error if apiKey is not provided', () => {
      expect(() => new MockTtsAbstract({ ...mockSettings, apiKey: undefined })).toThrowError(ValidationError);
    });

    it('should throw an error if apiKey is not a string', () => {
      expect(() => new MockTtsAbstract({ ...mockSettings, apiKey: 123 as any })).toThrowError(ValidationError);
    });

    it('should throw an error if audioDir is not a string', () => {
      expect(() => new MockTtsAbstract({ ...mockSettings, audioDir: 123 as any })).toThrowError(ValidationError);
    });
  });

  describe('Shared Methods', () => {
    it('should save audio to a specified file path', async () => {
      const tts = new MockTtsAbstract(mockSettings);
      const filePath = await tts.save('./custom-path/hello-world.mp3');
      expect(filePath).toBe('./custom-path/hello-world.mp3');
      // cleanup
      unlink(filePath, () => {});
    });
    it('should create the directory if it does not exist', async () => {
      // Arrange
      const nonExistentFolderPath = './nonExistentFolder';
      const filePath = `${nonExistentFolderPath}/file.txt`;

      // Ensure the folder does not exist for the purpose of this test
      if (existsSync(nonExistentFolderPath)) {
        unlinkSync(filePath);
        rmdirSync(nonExistentFolderPath);
      }

      const instance = new MockTtsAbstract(mockSettings);

      // Act
      await instance.save(filePath);

      // Assert
      expect(existsSync(nonExistentFolderPath)).toBe(true);

      // Clean up
      unlinkSync(filePath);
      rmdirSync(nonExistentFolderPath);
    });

    it('should throw an error if file path is not a string', async () => {
      const tts = new MockTtsAbstract(mockSettings);
      // this is to test the validation error not just the type-safety
      await expect(tts.save(123 as unknown as string)).rejects.toThrowError(ValidationError);
    });

    it('should throw an error if the upload handler is not defined', async () => {
      const tts = new MockTtsAbstract({
        ...mockSettings,
      });
      await expect(tts.upload()).rejects.toThrowError(ValidationError);
    });
    it('should throw an error if upload fails', async () => {
      const uploadHandler = vi.fn().mockImplementation(() => {
        throw new Error('failed to upload audio');
      });
      const tts = new MockTtsAbstract({
        ...mockSettings,
        uploadHandler,
      });
      await expect(tts.upload()).rejects.toThrowError('failed to upload audio');
    });

    it('should save audio to a local file', async () => {
      const tts = new MockTtsAbstract(mockSettings);
      const filePath = await tts.save();
      const audioDir = tts.audioDir;
      expect(filePath).toMatch(new RegExp(`${audioDir}/[a-z0-9-]+.mp3`));
    });

    it('should upload audio to a storage server', async () => {
      const AUDIO_URL = 'https://lorem.com/uploaded-audio.mp3';
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ url: AUDIO_URL }),
          ok: true,
        })
      );

      const uploadHandler = async <R = string>(audio: ArrayBuffer): Promise<R> => {
        const result = (
          await fetch('https://lorem.com/upload', {
            method: 'POST',
            body: audio,
          })
        ).json();
        return result as R;
      };
      const tts = new MockTtsAbstract({
        ...mockSettings,
        uploadHandler,
      });
      const { url } = await tts.upload<{ url: string }>();
      expect(url).toBe(AUDIO_URL);
    });
  });

  describe('Abstract Methods', () => {
    it('should throw an error if speak method is not implemented', () => {
      const tts = new MockTtsAbstract(mockSettings);
      expect(() => tts.speak('Hello World')).toThrowError('Method not implemented.');
    });

    it('should throw an error if listModels method is not implemented', () => {
      const tts = new MockTtsAbstract(mockSettings);
      expect(() => tts.listModels()).toThrowError('Method not implemented.');
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
});
