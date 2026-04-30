const ImageDisplay = ({ image, loading, error }) => {
  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Get extension from mime type or default to png
      let ext = "png";
      if (blob.type === "image/jpeg") ext = "jpg";
      else if (blob.type === "image/svg+xml") ext = "svg";
      link.download = `generated-image-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download image.");
    }
  };

  const handleCopy = async () => {
    if (!image) return;
    try {
      // Create an image element to draw onto a canvas
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = image;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Draw the image on a canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // Convert canvas to a PNG blob, as browsers only support PNG for clipboard images
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Canvas to Blob failed");
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob
            })
          ]);
          alert("Image copied to clipboard!");
        } catch (err) {
          console.error("Clipboard API failed:", err);
          alert("Failed to copy image. Ensure your browser allows clipboard access.");
        }
      }, "image/png");

    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to process image for copying.");
    }
  };

  return (
    <div className="image-container">
      {loading && (
        <div className="loading-text">
          <div className="loading-spinner"></div>
          <p>Forging your creation...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && image && (
        <div className="image-result">
          <img src={image} alt="Generative masterpiece" />
          <div className="action-buttons">
            <button className="action-btn" onClick={handleDownload} title="Download Image">
              ⬇ Download
            </button>
            <button className="action-btn" onClick={handleCopy} title="Copy Image">
              📋 Copy
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !image && (
        <p className="placeholder-text">✦ Your masterpiece will appear here</p>
      )}
    </div>
  );
};

export default ImageDisplay;