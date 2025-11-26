async function listGeminiModels() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is not set in your .env.local file.");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Available models:', data.models.map(m => m.name));
  } catch (error) {
    console.error('Failed to list models:', error);
  }
}

// Call the function to see the list of models
listGeminiModels();