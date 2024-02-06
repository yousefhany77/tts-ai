interface IElevenLabsVoice {
  voice_id: string;
  name: string;

  category: string;

  labels: {
    accent: string;
    description: string;
    age: string;
    gender: string;
    'use case': string;
  };
  description: string | null;
  preview_url: string;
  available_for_tiers: string[];
  settings: TElevenLabsVoiceSettings | null;
}

type TElevenLabsVoiceSettings = {
  similarity_boost: number;
  stability: number;
  style: number;
  use_speaker_boost: boolean;
};

interface IElevenLabsModel {
  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  can_use_speaker_boost: boolean;
  can_use_style: boolean;
  description: string;
  languages: {
    language_id: string;
    name: string;
  }[];
  max_characters_request_free_user: number;
  max_characters_request_subscribed_user: number;
  model_id: string;
  name: string;
  requires_alpha_access: boolean;
  serves_pro_voices: boolean;
  token_cost_factor: number;
}

interface IElevenLabsSynthesizeRequest {
  model_id: string;
  pronunciation_dictionary_locators?: {
    pronunciation_dictionary_id: string;
    version_id: string;
  }[];
  text: string;
  voice_settings?: TElevenLabsVoiceSettings;
}

type TElevenLabsError<T extends 'validation' | undefined = undefined> = T extends 'validation'
  ? {
      detail: {
        loc: string[];
        msg: string;
        type: string;
      }[];
    }
  : {
      detail: {
        message: string;
      };
    };

export { IElevenLabsModel, IElevenLabsSynthesizeRequest, IElevenLabsVoice, TElevenLabsError, TElevenLabsVoiceSettings };
