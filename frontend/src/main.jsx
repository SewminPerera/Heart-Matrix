import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { SoundProvider } from "./contexts/SoundContext.jsx"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SoundProvider>
          <App />
        </SoundProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);