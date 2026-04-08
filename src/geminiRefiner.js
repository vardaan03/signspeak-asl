/**
 * Gemini AI Sentence Refinement Module
 *
 * Uses Google's Gemini API to take raw detected sign language letters
 * and refine them into grammatically correct, natural English sentences.
 *
 * Security: API key is provided by the user at runtime and stored only
 * in memory (sessionStorage). Never hardcoded or committed to source.
 *
 * Usage:
 *   1. User enters their Gemini API key via the settings panel
 *   2. Raw detected text (e.g., "HELO HW R U") is sent to Gemini
 *   3. Gemini returns refined text (e.g., "Hello, how are you?")
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are an AI assistant that refines raw sign language detection output into natural English.

The input you receive is raw text captured from an ASL (American Sign Language) fingerspelling recognition system. It may contain:
- Individual letters that form words (e.g., "HELO" → "Hello")
- Common ASL sign words mixed with spelled letters
- Missing spaces, typos, or repeated characters from detection jitter
- Emoji-prefixed signs like "👍 Yes", "🖐 Hello", "✊ Wait"

Your task:
1. Interpret the raw detected text as intended words/sentences
2. Fix spelling errors caused by detection inaccuracies
3. Add proper spacing, punctuation, and capitalization
4. Preserve the meaning — don't add content that wasn't implied
5. Keep it concise and natural

Respond with ONLY the refined sentence, nothing else. No explanations, no quotes.`;

let apiKey = null;

/**
 * Initialize with API key (stored in memory only)
 */
export function setGeminiApiKey(key) {
  apiKey = key ? key.trim() : null;
  if (key) {
    // Store in sessionStorage so it persists across page navigation but not browser close
    try {
      sessionStorage.setItem('gemini_api_key', apiKey);
    } catch (e) {
      // sessionStorage not available, just keep in memory
    }
  }
}

/**
 * Try to restore API key from sessionStorage
 */
export function restoreApiKey() {
  try {
    const stored = sessionStorage.getItem('gemini_api_key');
    if (stored) {
      apiKey = stored;
      return true;
    }
  } catch (e) {
    // Not available
  }
  return false;
}

/**
 * Check if API key is configured
 */
export function hasApiKey() {
  return apiKey !== null && apiKey.length > 0;
}

/**
 * Clear the API key
 */
export function clearApiKey() {
  apiKey = null;
  try {
    sessionStorage.removeItem('gemini_api_key');
  } catch (e) {}
}

/**
 * Refine raw detected text using Gemini
 * @param {string} rawText - Raw text from sign detection
 * @returns {Promise<{success: boolean, refined: string, error?: string}>}
 */
export async function refineSentence(rawText) {
  if (!apiKey) {
    return { success: false, refined: '', error: 'No API key configured. Add your Gemini API key in Settings.' };
  }

  if (!rawText || rawText.trim().length === 0) {
    return { success: false, refined: '', error: 'No text to refine.' };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nRaw detected text: "${rawText.trim()}"` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 20,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `API error: ${response.status}`;

      if (response.status === 401 || response.status === 403) {
        return { success: false, refined: '', error: 'Invalid API key. Check your Gemini API key in Settings.' };
      }
      if (response.status === 429) {
        return { success: false, refined: '', error: 'Rate limited. Please wait a moment and try again.' };
      }

      return { success: false, refined: '', error: errorMsg };
    }

    const data = await response.json();
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!refined) {
      return { success: false, refined: '', error: 'Gemini returned empty response.' };
    }

    return { success: true, refined: refined.trim() };
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return { success: false, refined: '', error: 'Network error. Check your internet connection.' };
    }
    return { success: false, refined: '', error: `Unexpected error: ${err.message}` };
  }
}

/**
 * Get a display-friendly status of the AI feature
 */
export function getAIStatus() {
  if (!apiKey) {
    return { configured: false, label: 'AI Off', color: 'var(--text3)' };
  }
  return { configured: true, label: 'AI Ready', color: 'var(--green)' };
}
