import fs from 'fs/promises';
import path from 'path';

/**
 * Since our dummy truth data is small enough to fit securely in Mistral's context window,
 * we bypass complex text-splitting and vector integrations, reliably returning the whole facts document.
 */
export async function getRelevantContext(query: string, k: number = 3): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'mental-health-facts.md');
    const textContent = await fs.readFile(filePath, 'utf-8');
    return textContent;
  } catch (error) {
    console.error('Failed to load local truth data:', error);
    return "No mental health context available.";
  }
}
