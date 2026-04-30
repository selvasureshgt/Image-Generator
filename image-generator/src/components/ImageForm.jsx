import { useState } from "react";
import { generateImage as apiGenerateImage } from "../api/imageApi";

const ImageForm = ({ setImage, setLoading, setError, loading }) => {
  const [prompt, setPrompt] = useState("");

  const generateImage = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setError("");

      const data = await apiGenerateImage(prompt);
      
      if (data.images && data.images.length > 0) {
        const firstImg = data.images[0];
        setImage(`data:${firstImg.mimeType};base64,${firstImg.base64}`);
      }
    } catch (err) {
      console.error(err);
      const fallbackErrorMessage = err.message || "An error occurred while generating the image.";
      setError(err.error || fallbackErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      generateImage();
    }
  };

  return (
    <div className="form-container">
      <div className="form">
        <input
          type="text"
          placeholder="E.g., A futuristic cyberpunk city at sunset..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button onClick={generateImage} disabled={loading || !prompt.trim()}>
          {loading ? 'Forging...' : '✦ Generate'}
        </button>
      </div>
    </div>
  );
};

export default ImageForm;
