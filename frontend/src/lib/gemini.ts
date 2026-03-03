import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Key from environment variable
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Get Gemini model instance
 * @param modelName - Model name (default: 'gemini-3-flash')
 */
export function getGeminiModel(modelName: string = 'gemini-3-flash-preview') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Send a text message to Gemini and get response
 * @param message - The message to send
 * @param conversationHistory - Optional conversation history
 * @returns The AI response text
 */
export async function sendGeminiMessage(
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'model'; parts: string }>
): Promise<string> {
  try {
    const model = getGeminiModel();

    // Build the chat history if provided
    let chat;
    if (conversationHistory && conversationHistory.length > 0) {
      // Start a chat with history
      chat = model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });
    } else {
      chat = model.startChat();
    }

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to get response from AI');
  }
}

/**
 * Analyze an image using Gemini Vision
 * @param imageData - Base64 encoded image data or image URL
 * @param prompt - Optional prompt for analysis
 * @returns Analysis text
 */
export async function analyzeImageWithGemini(
  imageData: string,
  prompt: string = 'Analyze this image and provide a detailed description.'
): Promise<string> {
  try {
    const model = getGeminiModel('gemini-3-flash-preview');

    // For vision model, we can use generateContent directly
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg', // You may need to detect the actual mime type
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error('Failed to analyze image');
  }
}

/**
 * Generate content based on a prompt
 * @param prompt - The prompt to generate content from
 * @param options - Optional generation options
 * @returns Generated text
 */
export async function generateContent(
  prompt: string,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxOutputTokens ?? 2048,
      },
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content');
  }
}
