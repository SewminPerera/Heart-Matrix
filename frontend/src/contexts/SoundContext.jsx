import React, { createContext, useState, useEffect, useRef } from 'react';

export const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/sounds/ambient.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    // Allow autoplay only after user clicks (browser security)
    const tryPlay = () => {
      audio.play().catch(() => {});
      window.removeEventListener('click', tryPlay);
    };
    window.addEventListener('click', tryPlay);

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <SoundContext.Provider value={{ isMuted, setIsMuted }}>
      {children}
    </SoundContext.Provider>
  );
}
