import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { OPEN_AI_MAX_TTS_TEXT_LENGTH } from '~/consts';
import { IVoice } from '../../src/core//types/TGoogle';
import { TtsGoogle } from './Google';
const mockedVoices: IVoice[] = [
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-A',
    ssmlGender: 'NEUTRAL',
    naturalSampleRateHertz: 2400,
  },
];

describe('Google TTS', () => {
  let tts: TtsGoogle;
  vi.mock('@google-cloud/text-to-speech');
  beforeAll(() => {
    tts = new TtsGoogle({
      keyFile: 'key.json',
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("should throw an error if the keyFile isn't set", () => {
    expect(() => new TtsGoogle()).toThrowError(
      'Google TTS requires a keyFile to be , The path to the json key file for the google cloud service account'
    );
  });
  it('should speak', async () => {
    await tts.speak('Hello');
    expect(tts.getOrThrowAudio()).toBeInstanceOf(ArrayBuffer);
  });

  it('should list voices', async () => {
    const voices = await tts.listVoices();
    expect(voices).toEqual(mockedVoices);
  });

  it('should speak long text', async () => {
    const longText = 'a'.repeat(OPEN_AI_MAX_TTS_TEXT_LENGTH + 1);
    await tts.longSpeak(longText);
    expect(tts.getOrThrowAudio()).toBeInstanceOf(ArrayBuffer);
  });
  it('should throw an error on the listModels method Not supported', () => {
    expect(() => tts.listModels()).toThrowError(
      'Not Supported by Google TTS: google does not support listing models it has only one model'
    );
  });
  it('should throw an error if the audio does not have a content', async () => {
    TextToSpeechClient.prototype.synthesizeSpeech = vi.fn().mockResolvedValue([
      {
        audioContent: undefined,
      },
    ]);
    const ttsG = new TtsGoogle({
      keyFile: 'key.json',
    });
    await expect(ttsG.speak('Hello')).rejects.toThrowError('No audio content found');
  });

  it('should transform the audio content from base64 to ArrayBuffer', async () => {
    TextToSpeechClient.prototype.synthesizeSpeech = vi.fn().mockResolvedValue([
      {
        audioContent: 'aGVsbG8=',
      },
    ]);
    const ttsG = new TtsGoogle({
      keyFile: 'key.json',
    });
    await ttsG.speak('Hello');
    expect(ttsG.getOrThrowAudio()).toBeInstanceOf(ArrayBuffer);
  });

  it('should return empty array if the voices are not found', async () => {
    TextToSpeechClient.prototype.listVoices = vi.fn().mockResolvedValue([{}]);
    const ttsG = new TtsGoogle({
      keyFile: 'key.json',
    });
    const voices = await ttsG.listVoices();
    expect(voices).toEqual([]);
  });
});
