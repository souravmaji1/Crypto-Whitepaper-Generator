import { useState, useRef } from 'react';

export default function MusicGenerator() {
  const [promptA, setPromptA] = useState('');
  const [promptB, setPromptB] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const generateMusic = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt_a: promptA, prompt_b: promptB }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate music');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
      // Automatically play the audio when it's loaded
      if (audioRef.current) {
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error generating music:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={promptA}
        onChange={(e) => setPromptA(e.target.value)}
        placeholder="Enter first music prompt"
      />
      <input
        type="text"
        value={promptB}
        onChange={(e) => setPromptB(e.target.value)}
        placeholder="Enter second music prompt (optional)"
      />
      <button onClick={generateMusic} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Music'}
      </button>
      {audioUrl && (
        <audio ref={audioRef} controls src={audioUrl}>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}