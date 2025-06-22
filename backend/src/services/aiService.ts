import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const USE_AI_STUB = process.env.USE_AI_STUB;

/**
 * Generate a description for a task using OpenAI
 * @param title - The title of the task
 * @returns The description of the task
 */
export async function generateTaskDescription(title: string): Promise<string> {
  const prompt: string = `Write a detailed, clear, and actionable task description for the following task title: ${title}`;
  try {
    // Using a stubbed response for now since I don't have an OpenAI paid account
    if (USE_AI_STUB) {
      return `This is a detailed description for the task: ${title}. Please implement all necessary steps and ensure quality.`;
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for software engineers.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200
    });
    const content = completion?.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content returned from OpenAI');
    return content?.trim();
  } catch (err) {
    throw new Error(`OpenAI API call failed: ${err instanceof Error ? err?.message : String(err)}`);
  }
} 