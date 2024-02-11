import z from 'zod';

function splitLongText(text: string, maxChunkSize: number): string[] {
  const schema = z
    .string({
      invalid_type_error: 'text is not of type string',
      required_error: 'text is required',
    })
    .min(maxChunkSize, {
      message: `text must be at least ${maxChunkSize} characters long to use the "longSpeak" method. Use the "speak" method instead`,
    });
  schema.parse(text);
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChunkSize) {
    chunks.push(text.slice(i, i + maxChunkSize));
  }
  return chunks;
}

export { splitLongText };
