import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationError } from 'zod-validation-error';
import { DefaultSettings } from '~/core';
import { TElevenLabsError } from '~/core/types/TElevenLabs';
import { createErrorMsg } from '~/decorators/MaxLength.js';
import { splitLongText } from '~/utils/split.js';
import { TtsElevenLabs } from './ElevenLabs.js';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'xi-api-key': 'api-key',
};

const getDefaultFetchOptions = (body: Record<string, string | undefined>): Record<string, any> => ({
  headers: defaultHeaders,
  method: 'POST',
  body: JSON.stringify(body),
});

function mockFetch(response?: Response): void {
  global.fetch = vi.fn().mockImplementation(() => Promise.resolve(response ?? new Response(new ArrayBuffer(8))));
}

const longText = `
Hello, my name is John Doe. I am a software developer and I work at Google. I am currently working on a project that involves using the Google Cloud Text-to-Speech API.`.replaceAll(
  /\s+/g,
  ''
);

describe('TtsElevenLabs', () => {
  let ttsElevenLabs: TtsElevenLabs;
  vi.mock('~/consts', () => ({
    ELEVEN_LABS_MAX_TTS_TEXT_LENGTH: 20,
  }));
  const mocks = vi.hoisted(() => {
    return {
      default: vi.fn(),
    };
  });
  beforeEach(() => {
    ttsElevenLabs = new TtsElevenLabs({
      apiKey: 'api-key',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call the speak API and set the audio', async () => {
    const mockResponse = new Response(new ArrayBuffer(8));
    mockFetch(mockResponse);

    const text = 'Hello, world!';
    await ttsElevenLabs.speak(text);
    expect(global.fetch).toHaveBeenCalledWith(
      TtsElevenLabs.elevenLabsApiUrl + '/text-to-speech/' + DefaultSettings.ElevenLabsSettings.voice,
      getDefaultFetchOptions({
        model_id: DefaultSettings.ElevenLabsSettings.model,
        text,
        voice_settings: undefined,
      })
    );
  });

  it('Should fail to call the speak method of the text longer than the max length', () => {
    const mockResponse = new Response(new ArrayBuffer(8));

    const ttsElevenLabs = new TtsElevenLabs({
      apiKey: 'api-key',
    });

    mockFetch(mockResponse);

    expect(() => ttsElevenLabs.speak(longText)).toThrowError(new ValidationError(createErrorMsg(20, longText.length)));
  });

  it('should call the longSpeak API and set the audio', async () => {
    mockFetch();
    const expectedCalls = splitLongText(longText, 20).length;
    await ttsElevenLabs.longSpeak(longText);
    expect(global.fetch).toHaveBeenCalledTimes(expectedCalls);
  });

  it('should call the longSpeak API with the  maxConcurrentRequests = 2 if it is undefined', async () => {
    vi.mock('p-limit', () => {
      return {
        default: mocks.default.mockImplementation(
          () =>
            (fn: () => unknown): unknown =>
              fn()
        ),
      };
    });

    const ttsElevenLabs = new TtsElevenLabs({
      apiKey: 'api-key',
      maxConcurrentRequests: undefined,
    });
    mockFetch();
    const expectedCalls = splitLongText(longText, 20).length;
    await ttsElevenLabs.longSpeak(longText);
    expect(mocks.default).toHaveBeenCalledWith(2);
    expect(global.fetch).toHaveBeenCalledTimes(expectedCalls);
  });

  it('should call the listModels API and return the model IDs', async () => {
    const res: { model_id: string; name: string }[] = [{ model_id: 'model1', name: 'Model 1' }];
    const mockResponse = new Response(JSON.stringify(res));
    mockFetch(mockResponse);
    const models = await ttsElevenLabs.listModels();
    expect(models).toEqual(res.map((model) => model.model_id));
  });

  it('should call the listVoices API and return the voices', async () => {
    const res = {
      voices: [
        {
          voice_id: 'voice1',
        },
      ],
    };
    const mockResponse = new Response(JSON.stringify(res));
    mockFetch(mockResponse);
    const voices = await ttsElevenLabs.listVoices();
    expect(voices).toEqual(res.voices);
  });

  it('should throw a ValidationError when the speak API call fails', async () => {
    const apiError: TElevenLabsError = {
      detail: {
        message: 'Failed ElevenLabs API call',
      },
    };
    const mockResponse = new Response(JSON.stringify(apiError), { status: 400 });
    mockFetch(mockResponse);

    const text = 'Hello, world!';
    await expect(ttsElevenLabs.speak(text)).rejects.toThrowError(new ValidationError(apiError.detail.message));
  });

  it('should throw a ValidationError when the speak API call fails with a validation error', async () => {
    const apiError: TElevenLabsError<'validation'> = {
      detail: [
        {
          loc: ['text'],
          msg: 'must be a string',
          type: 'type_error.string',
        },
      ],
    };
    const mockResponse = new Response(JSON.stringify(apiError), { status: 422 });
    mockFetch(mockResponse);

    const text = 'Hello, world!';
    await expect(ttsElevenLabs.speak(text)).rejects.toThrowError(
      new ValidationError(
        apiError.detail.map((detail) => `${detail.type}: ${detail.loc.join('.')} ${detail.msg}`).join('\n')
      )
    );
  });

  it('should throw a ValidationError when the speak API call fails with an unknown error', async () => {
    const mockResponse = new Response(JSON.stringify({}), { status: 500 });
    mockFetch(mockResponse);

    const text = 'Hello, world!';
    await expect(ttsElevenLabs.speak(text)).rejects.toThrowError(new Error('Failed ElevenLabs API call'));
  });

  it('should change voice and call api with the new voice', async () => {
    const mockResponse = new Response(new ArrayBuffer(8));
    mockFetch(mockResponse);
    const text = 'Hello, world!';
    ttsElevenLabs.setVoice('voice2');
    await ttsElevenLabs.speak(text);
    expect(global.fetch).toHaveBeenCalledWith(
      TtsElevenLabs.elevenLabsApiUrl + '/text-to-speech/voice2',
      getDefaultFetchOptions({
        model_id: DefaultSettings.ElevenLabsSettings.model,
        text,
        voice_settings: undefined,
      })
    );
  });

  it('should change model and call api with the new model', async () => {
    const mockResponse = new Response(new ArrayBuffer(8));
    mockFetch(mockResponse);
    const text = 'Hello, world!';
    ttsElevenLabs.setModel('model2');
    await ttsElevenLabs.speak(text);
    expect(global.fetch).toHaveBeenCalledWith(
      TtsElevenLabs.elevenLabsApiUrl + '/text-to-speech/' + DefaultSettings.ElevenLabsSettings.voice,
      getDefaultFetchOptions({
        model_id: 'model2',
        text,
        voice_settings: undefined,
      })
    );
  });
});
