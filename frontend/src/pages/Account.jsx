import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar"; // ✅ Import Navbar

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me", {
          method: "GET",
          credentials: "include", // send cookies
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user); // backend must return { user: { name, email } }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;
  }

  return (
    <div>
      <Navbar />
      {user ? (
        <div
          style={{
            maxWidth: "400px",
            margin: "80px auto",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            background: "#fff",
          }}
        >
          <h2 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
            Welcome, <span style={{ color: "#FFB300" }}>{user.name}</span>
          </h2>
          <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
            Email: <b>{user.email}</b>
          </p>
          <button
            style={{
              background: "#000",
              color: "#fff",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#FFB300")}
            onMouseOut={(e) => (e.target.style.background = "#000")}
            onClick={() => (window.location.href = "/reset-password")}
          >
            Reset Password
          </button>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            marginTop: "100px",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>
            Please <span style={{ color: "#FFB300" }}>Login</span>
          </h2>
          <button
            style={{
              background: "#000",
              color: "#fff",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.background = "#FFB300")}
            onMouseOut={(e) => (e.target.style.background = "#000")}
            onClick={() => (window.location.href = "/login")}
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Account;
