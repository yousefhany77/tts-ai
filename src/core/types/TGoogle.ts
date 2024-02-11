import { protos } from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';

interface IVoice extends protos.google.cloud.texttospeech.v1.IVoice {}
interface IListVoicesRequest extends protos.google.cloud.texttospeech.v1.IListVoicesRequest {}
interface IVoiceSelectionParams
  extends Required<Omit<google.cloud.texttospeech.v1.IVoiceSelectionParams, 'customVoice'>> {
  customVoice?: google.cloud.texttospeech.v1.IVoiceSelectionParams['customVoice'];
}

export type { IListVoicesRequest, IVoice, IVoiceSelectionParams };
