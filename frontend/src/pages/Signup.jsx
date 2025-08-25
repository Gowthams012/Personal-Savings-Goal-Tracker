import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Use env when available; fallback to localhost:5000 for dev
const API_BASE =
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:5000";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- client-side checks to avoid empty “Something went wrong” ---
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // keep cookies for cookie-parser sessions
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      // Try to read JSON safely (some servers return empty body on 204/201)
      let data = {};
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        // surface backend message if present
        const msg =
          data?.message ||
          data?.error ||
          `Signup failed (status ${res.status}).`;
        setError(msg);
        return;
      }

      // Success -> go to email verification page
      const email = formData.email.trim();
      navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
        state: { email },
        replace: true,
      });
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f5",
      }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "420px",
            width: "100%",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "22px",
              color: "#111",
              fontWeight: 700,
            }}
          >
            Personal Savings Goal Tracker
          </h1>

          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "18px",
              color: "#333",
              fontWeight: 600,
            }}
          >
            Create Account
          </h2>

          {error && (
            <p
              style={{
                color: "red",
                fontSize: "14px",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px",
                background: loading ? "#222" : "black",
                opacity: loading ? 0.8 : 1,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{ color: "black", textDecoration: "underline" }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
