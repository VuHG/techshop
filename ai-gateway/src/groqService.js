import Groq from 'groq-sdk';
import { config } from './config.js';
import { SYSTEM_PROMPT } from './systemPrompt.js';

const groq = new Groq({ apiKey: config.groqApiKey });

/**
 * Gọi Groq để sinh câu trả lời tư vấn.
 * @param {string} message  câu hỏi của khách (đã validate, đã trim)
 * @param {{role:'user'|'assistant', content:string}[]} history  lịch sử hội thoại (đã lọc, tối đa maxHistory)
 * @returns {Promise<string>} nội dung trả lời
 */
export async function chat(message, history = []) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-config.maxHistory),
    { role: 'user', content: message },
  ];

  const completion = await groq.chat.completions.create(
    {
      model: config.groqModel,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    },
    { timeout: config.requestTimeoutMs },
  );

  return completion.choices?.[0]?.message?.content?.trim() ?? '';
}
