import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

export const generateImage = async (prompt, numberOfImages = 1, aspectRatio = '1:1') => {
  try {
    const response = await api.post('/api/images/generate', {
      prompt,
      numberOfImages,
      aspectRatio,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
        throw error.response.data;
    }
    throw error;
  }
};

export const enhancePrompt = async (prompt) => {
  try {
    const response = await api.post('/api/images/enhance-prompt', { prompt });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
        throw error.response.data;
    }
    throw error;
  }
};
