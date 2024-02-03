import { TtsOpenAi } from './Providers/OpenAi';

const tts = new TtsOpenAi();

const main = async (): Promise<string> => {
  const audio = await tts.speak('Hello, world!');
  return audio.save();
};

void main();
