import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout({ children }) {
  const location = useLocation();

  // Hide Navbar on Login and Register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="layout">
      {!hideNavbar && <Navbar />}
      <main className="main-content">{children}</main>
    </div>
  );
}
