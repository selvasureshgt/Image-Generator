import axios from 'axios';
import { createError } from '../middleware/errorHandler.js';
import crypto from 'crypto';

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.0-flash'; // Used strictly for text processing/enhancing

const callGeminiAPI = async (payload) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw createError(500, 'GEMINI_API_KEY is not configured');
    }

    const url = `${API_BASE_URL}/${MODEL}:generateContent?key=${apiKey}`;
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      let message = 'Gemini API Error';
      if (data && data.error && data.error.message) {
        message = data.error.message;
      }

      if (status === 400) {
        throw createError(400, `Bad Request / Safety Violation: ${message}`);
      } else if (status === 401 || status === 403) {
        throw createError(401, `Invalid API Key or Unauthorized: ${message}`);
      } else if (status === 429) {
        throw createError(429, `Quota Exceeded: ${message}`);
      } else {
        throw createError(status, `Gemini Error: ${message}`);
      }
    }
    throw createError(500, `Network or Server Error: ${error.message}`);
  }
};

export const generateImageService = async (prompt, numberOfImages, aspectRatio) => {
  // 1. Use Gemini 2.0 Flash to enhance the prompt for image generation.
  // Since Gemini 2.0 Flash is a text-only model in the API and actual Gemini Image models 
  // (like gemin-2.5-flash-image and imagen-3) throw 0-quota limits on the free tier,
  // we first enhance the prompt using Gemini API then fetch the image from a free open API to complete the project!
  const payload = {
    contents: [
      {
        parts: [{ text: `Act as an expert prompt engineer. You must enhance this prompt so it fits perfectly for an AI image generator. Only return the enhanced prompt. Under 50 words: "${prompt}"` }]
      }
    ]
  };
  
  let enhancedPromptText = prompt;
  try {
    const geminiEnhanceResponse = await callGeminiAPI(payload);
    if (geminiEnhanceResponse.candidates && geminiEnhanceResponse.candidates.length > 0) {
      const parts = geminiEnhanceResponse.candidates[0].content.parts;
      const textPart = parts.find(p => p.text);
      if (textPart) {
        enhancedPromptText = textPart.text.trim();
      }
    }
  } catch (error) {
    console.log("Could not enhance prompt with Gemini, using original prompt.", error.message);
  }

  // 2. Map Aspect Ratio to Width/Height for the generation endpoint
  let width = 512, height = 512;
  if (aspectRatio === '16:9') { width = 896; height = 504; }
  else if (aspectRatio === '9:16') { width = 504; height = 896; }
  else if (aspectRatio === '4:3') { width = 682; height = 512; }
  else if (aspectRatio === '3:4') { width = 512; height = 682; }

  // 3. Generate Images concurrently using the free Pollinations API
  // This safely circumvents the Google Generative AI free-tier quota limits strictly on image capabilities
  const fetchImageAsBase64 = async (seedIndex) => {
    const seed = Math.floor(Math.random() * 1000000) + seedIndex;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPromptText)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
    
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    
    return {
      id: crypto.randomUUID(),
      base64,
      mimeType: 'image/jpeg'
    };
  };

  const requests = Array.from({ length: numberOfImages }, (_, i) => fetchImageAsBase64(i));
  const images = await Promise.all(requests);

  if (images.length === 0) {
    throw createError(500, 'Failed to generate images.');
  }

  return {
    success: true,
    originalPrompt: prompt,
    count: images.length,
    images: images
  };
};

export const enhancePromptService = async (prompt) => {
  const payload = {
    contents: [
      {
        parts: [{ text: `Act as a professional prompt engineer for an image generation model. Enhance the following user prompt to be more descriptive, adding details about style, lighting, composition, and mood. The enhanced prompt must be under 200 words. Return ONLY the enhanced prompt. User Prompt: "${prompt}"` }]
      }
    ],
    generationConfig: {
      temperature: 0.7
    }
  };

  const response = await callGeminiAPI(payload);
  
  let enhancedPrompt = '';
  if (response.candidates && response.candidates.length > 0) {
    const parts = response.candidates[0].content.parts;
    const textPart = parts.find(p => p.text);
    if (textPart) {
      enhancedPrompt = textPart.text.trim();
    }
  }

  if (!enhancedPrompt) {
    throw createError(500, 'Failed to enhance prompt.');
  }

  return {
    success: true,
    originalPrompt: prompt,
    enhancedPrompt: enhancedPrompt
  };
};