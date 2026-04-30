import { generateImageService, enhancePromptService } from '../services/gemini.service.js';
import { createError } from '../middleware/errorHandler.js';

export const generate = async (req, res, next) => {
  try {
    const { prompt, numberOfImages = 1, aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.length < 3 || prompt.length > 1000) {
      throw createError(400, 'Prompt must be a string between 3 and 1000 characters.');
    }

    if (!Number.isInteger(numberOfImages) || numberOfImages < 1 || numberOfImages > 4) {
      throw createError(400, 'numberOfImages must be an integer between 1 and 4.');
    }

    const validAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
    if (!validAspectRatios.includes(aspectRatio)) {
      throw createError(400, `aspectRatio must be one of: ${validAspectRatios.join(', ')}`);
    }

    const result = await generateImageService(prompt, numberOfImages, aspectRatio);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const enhance = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw createError(400, 'Prompt is required and must be a valid string.');
    }

    const result = await enhancePromptService(prompt);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
