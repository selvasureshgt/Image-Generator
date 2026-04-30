import { useState } from "react";
import ImageForm from "./components/ImageForm";
import ImageDisplay from "./components/ImageDisplay";
import "./App.css";

function App() {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="app">
      <header className="app-header">
        <h1>IMAGE GENERATOR</h1>
        <p>Bring your imagination to life instantly.</p>
      </header>

      <ImageForm
        setImage={setImage}
        setLoading={setLoading}
        setError={setError}
        loading={loading}
      />
      <ImageDisplay image={image} loading={loading} error={error} />
    </div>
  );
}

export default App;
