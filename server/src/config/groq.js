const Groq = require('groq-sdk');

let groq;
const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

try {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing');
  }

  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
} catch (e) {
  console.warn('Groq AI not configured:', e.message);
}

module.exports = { groq, modelName };
