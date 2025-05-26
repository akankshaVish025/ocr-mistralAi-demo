// src/services/mistral.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
});

export async function processWithMistral(text: string): Promise<any> {
  const res = await openai.chat.completions.create({
    model: 'mistral-7b-instruct',
    messages: [
      { role: 'system', content: 'Extract and return structured JSON from this document text.' },
      { role: 'user', content: text.slice(0, 3000) }, // truncate to first 3K chars
    ],
  });

  const message = res.choices[0]?.message?.content;
  return JSON.parse(message || '{}');
}
