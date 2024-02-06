import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';

enum TtsProviders {
  Google = 'Google',
  ElevenLabs = 'ElevenLabs',
  OpenAi = 'OpenAi',
}
/**
 * Represents the keys of the TtsProviders object.
 */
type ProviderKeys = keyof typeof TtsProviders;

const schema = z.nativeEnum(TtsProviders);

const validateProvider = (value: unknown): TtsProviders => {
  const validation = schema.safeParse(value);
  if (validation.success) {
    return validation.data;
  }
  throw fromZodError(validation.error);
};

export { ProviderKeys, TtsProviders, TtsProviders as default, validateProvider };
