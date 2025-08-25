import React, { useState } from "react";
import Navbar from "../components/Navbar"; // ✅ make sure path is correct

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ sends cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Login successful ✅");
        window.location.href = "/account"; // redirect to account page
      } else {
        alert(data.message || "Login failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
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
      {/* ✅ Navbar stays fixed at top */}
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
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "22px",
              color: "#111",
            }}
          >
            Personal Savings Goal Tracker
          </h1>

          <h2
            style={{
              textAlign: "center",
              marginBottom: "30px",
              fontSize: "18px",
              color: "#333",
            }}
          >
            Login
          </h2>

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px",
                background: "black",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Login
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
            New user?{" "}
            <a
              href="/signup"
              style={{ color: "black", textDecoration: "underline" }}
            >
              Create Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
