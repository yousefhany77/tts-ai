import { TtsOpenAi } from './Providers/OpenAi';

const main = async (): Promise<string> => {
  try {
    const tts = new TtsOpenAi({
      apiKey: 123,
    });
    const audio = await tts.speak('Hello, world!');
    return audio.save();
  } catch (error) {
    console.error(error);
  }
};

void main();
