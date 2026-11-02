import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
  generationConfig: { responseMimeType: 'application/json' },
});

console.time('json-eval');
const result = await model.generateContent('Return a valid JSON object with key "status" set to "ready" and "latency" set to "ultra-fast".');
console.timeEnd('json-eval');
console.log(result.response.text());

