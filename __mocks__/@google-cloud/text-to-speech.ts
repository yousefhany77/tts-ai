import { protos } from '@google-cloud/text-to-speech';
import { IVoice } from '../../src/core//types/TGoogle';

export const mockedVoices: IVoice[] = [
  {
    languageCodes: ['en-US'],
    name: 'en-US-Wavenet-A',
    ssmlGender: 'NEUTRAL',
    naturalSampleRateHertz: 2400,
  },
];
export class TextToSpeechClient {
  settings: any;
  constructor(settings: any) {
    this.settings = settings;
  }
  public async listVoices(): Promise<[{ voices: IVoice[] }]> {
    return new Promise((resolve) => {
      resolve([{ voices: mockedVoices }]);
    });
  }
  public async synthesizeSpeech(): Promise<[protos.google.cloud.texttospeech.v1.ISynthesizeSpeechResponse]> {
    return new Promise((resolve) => {
      resolve([
        {
          audioContent: new Uint8Array(8),
        },
      ]);
    });
  }
}
