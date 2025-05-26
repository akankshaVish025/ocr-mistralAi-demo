"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWithMistral = processWithMistral;
// src/services/mistral.ts
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1',
});
async function processWithMistral(text) {
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
