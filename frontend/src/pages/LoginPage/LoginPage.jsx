import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/apiService";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(formData);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/");
    } catch {
      setError("Invalid email or password");
    }
  };

  // Handle Google response
  const handleGoogleResponse = async (response) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("user", JSON.stringify(data));
      navigate("/");
    } catch (err) {
      console.error("Google login failed:", err);
      setError("Google login failed. Please try again.");
    }
  };

  // Initialize Google Sign In Button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("❌ Missing Google Client ID");
      return;
    }

    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        console.log("✅ Google API Loaded");
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleLoginDiv"),
          {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: "250",
          }
        );
      } else {
        console.error("⚠️ Google API not found in window");
      }
    };

    // Wait for Google script to load before initializing
    if (!window.google) {
      console.log("⏳ Waiting for Google script...");
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    } else {
      initializeGoogle();
    }
  }, []);

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>❤️</h1>
          <h2>WELCOME TO HEART MATRIX</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-btn">
            Login
          </button>
          {error && <p className="error">{error}</p>}
        </form>

        <div id="googleLoginDiv" className="google-login-container"></div>

        <p className="login-switch">
          Don’t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
