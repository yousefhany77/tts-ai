import * as z from 'zod';

enum TtsProviders {
  Google = 'Google',
  ElevenLabs = 'ElevenLabs',
  OpenAi = 'OpenAi',
}
const schema = z.nativeEnum(TtsProviders, {
  invalid_type_error: `TtsProvider must be a valid TtsProvider enum value ${Object.values(TtsProviders).toString()}`,
  required_error: `TtsProvider is required ${Object.values(TtsProviders).toString()}`,
});

const validateProvider = (value: unknown): TtsProviders => {
  return schema.parse(value);
};

export { TtsProviders, TtsProviders as default, validateProvider };
