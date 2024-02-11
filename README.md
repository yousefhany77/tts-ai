<h1 align="center" style="border-bottom: none;">@yousefhany77/tts-ai</h1>

<p align="center">
  <a href="ttps://github.com/yousefhany77/tts-ai/actions/workflows/test-and-release.yml">
    <img alt="Build states" src="https://github.com/yousefhany77/tts-ai/actions/workflows/test-and-release.yml/badge.svg?branch=main">
  </a>

  <a href="https://github.com/yousefhany77/tts-ai/actions">
    <img alt="Coverage" src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/yousefhany77/b70e2342a5be5259b768aace465f777a/raw/0ea8a505354e198fdf0ac12b9f55476efb1bb7ad/ts-npm-template-coverage.json">
  </a>
</p>

## Description

The Text-to-Speech Library provides a simple unified interface for generating high-quality speech audio using top text-to-speech providers like OpenAI, Google Cloud, and ElevenLabs.

With just a few lines of code, you can produce natural human-like voice audio for your applications and products.

## Features

- Unified API for multiple TTS providers
- Generate audio from text with `speak()` method
- Split long text into chunks automatically
- Switch voices and models easily
- Save generated audio to file
- Seamlessly concatenate audio fragments
- Handles provider authentication
- MIT license

## Getting Started

### Install

```
pnpm add text-to-speech
```

### Usage

#### Without .env file

```ts
import { TtsOpenAI } from 'text-to-speech';

const tts = new TtsOpenAI({
  apiKey: 'YOUR_API_KEY',
});

await tts.speak('Hello world');
```

#### With .env file

`OpenAi_TTS_API_KEY = YOUR_API_KEY`

```ts
import { TtsOpenAI } from 'text-to-speech';

const tts = new TtsOpenAI();

await tts.speak('Hello world');
```

See [documentation](docs/README.md) for full usage details.

# Providers

The library supports the following text-to-speech providers:

- OpenAI
- Google Cloud
- ElevenLabs

# Contributing

Contributions are welcome!

# License

This project is licensed under the [MIT license](LICENSE).
