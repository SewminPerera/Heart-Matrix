import React, { createContext, useContext, useState, useEffect } from "react";

const SoundContext = createContext();

// Helper function to get initial state from localStorage
const getInitialMuteState = () => {
  const storedState = localStorage.getItem("isMuted");
  return storedState ? JSON.parse(storedState) : false; 
};

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(getInitialMuteState);

 
  useEffect(() => {
    localStorage.setItem("isMuted", JSON.stringify(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);