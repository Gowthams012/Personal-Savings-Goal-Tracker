import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  const quotes = [
    "Every rupee saved is a step closer to your dreams! 💪",
    "Financial discipline today creates tomorrow's freedom ✨",
    "Small consistent savings build extraordinary wealth 🌟",
    "Your future self will thank you for today's choices 🎯",
    "Dreams backed by savings become inevitable realities 🚀",
    "Patience and persistence turn goals into achievements 💎",
  ];

  const [quote, setQuote] = useState("");

  // ---------------- Fetch Data ----------------
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("quoteDate");
    const storedQuote = localStorage.getItem("quote");

    if (storedDate === today && storedQuote) {
      setQuote(storedQuote);
    } else {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      localStorage.setItem("quoteDate", today);
      localStorage.setItem("quote", randomQuote);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, contributeRes] = await Promise.all([
          fetch("/api/product/getUserProducts", { credentials: "include" }),
          fetch("/api/contribute/get-Contribute", { credentials: "include" }),
        ]);

        const productData = await productRes.json();
        const contributionData = await contributeRes.json();

        setProducts(productData || []);
        setContributions(contributionData || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ---------------- Utility Calculations ----------------
  const getStats = (productId) => {
    const product = products.find((p) => p._id === productId);
    const contribution = contributions.find((c) => c.productId === productId);

    if (!product) return null;

    const savedAmount = contribution?.contributionAmount || 0;
    const targetAmount = product.productPrice;
    const remainingAmount = Math.max(targetAmount - savedAmount, 0);
    const progress = Math.min((savedAmount / targetAmount) * 100, 100);

    const today = new Date();
    const targetDate = new Date(product.targetDate);
    const remainingDays = Math.max(
      0,
      Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))
    );
    const dailySavingsNeeded =
      remainingDays > 0 ? remainingAmount / remainingDays : 0;

    return {
      savedAmount,
      targetAmount,
      remainingAmount,
      progress,
      remainingDays,
      dailySavingsNeeded,
      targetDate,
    };
  };

  // ---------------- Handlers ----------------
  const handleContribute = async (productId) => {
    const amount = prompt("Enter contribution amount:");
    if (!amount || isNaN(amount)) return;

    try {
      await fetch(`/api/contribute/add-contribute/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      window.location.reload();
    } catch (err) {
      console.error("Contribution failed:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch(`/api/product/deleteProduct?id=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Delete product failed:", err);
    }
  };

  // ---------------- Styles ----------------
  const container = {
    minHeight: "100vh",
    background: "#FFFFFF",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "80px",
    fontFamily: "Arial, sans-serif",
    color: "#000000",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    width: "100%",
    maxWidth: "1200px",
    marginBottom: "30px",
  };

  const card = {
    background: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px",
    border: "2px solid #f7f5f2ff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  };

  const cardHeader = {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "16px",
    borderBottom: "2px solid #FFB300",
    paddingBottom: "8px",
  };

  const statRow = {
    display: "flex",
    justifyContent: "space-between",
    margin: "8px 0",
    fontSize: "1rem",
    fontWeight: "500",
  };

  const statValue = { fontWeight: "700", color: "#FFB300" };

  const progressContainer = {
    width: "100%",
    height: "20px",
    background: "#f1f1f1",
    borderRadius: "10px",
    margin: "20px 0",
    overflow: "hidden",
    border: "1px solid #FFB300",
  };

    const footer = {
    position: "fixed",       // fix to bottom
    bottom: 0,
    left: 0,
    width: "100%",
    padding: "20px",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#333",
    borderTop: "1px solid #ddd",
    background: "#f9f9f9",
  };


  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div>
      <Navbar />
      <div style={container}>
        {/* Daily Quote */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2>💡 Motivation of the Day</h2>
          <p style={{ fontStyle: "italic", fontSize: "18px" }}>{quote}</p>
        </div>

        {/* Dashboard */}
        <div style={grid}>
          {products.length === 0 ? (
            <p style={{ textAlign: "center" }}>
              No products yet. Start tracking your goals 🚀
            </p>
          ) : (
            products.map((product) => {
              const stats = getStats(product._id);
              if (!stats) return null;

              return (
                <div key={product._id} style={card}>
                  <h2 style={cardHeader}>{product.productName}</h2>
                  <div style={statRow}>
                    <span>Target Price:</span>
                    <span style={statValue}>
                      ₹{product.productPrice.toLocaleString()}
                    </span>
                  </div>
                  <div style={statRow}>
                    <span>Saved:</span>
                    <span style={statValue}>
                      ₹{stats.savedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div style={statRow}>
                    <span>Remaining:</span>
                    <span style={statValue}>
                      ₹{stats.remainingAmount.toLocaleString()}
                    </span>
                  </div>
                  <div style={statRow}>
                    <span>Days Left:</span>
                    <span style={statValue}>{stats.remainingDays}</span>
                  </div>
                  <div style={progressContainer}>
                    <div
                      style={{
                        height: "100%",
                        width: `${stats.progress}%`,
                        background: "#FFB300",
                      }}
                    ></div>
                  </div>
                  <p style={{ textAlign: "center", fontWeight: "600" }}>
                    {stats.progress.toFixed(1)}% Complete • Save ₹
                    {stats.dailySavingsNeeded.toFixed(0)}/day
                  </p>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "15px",
                    }}
                  >
                    <button
                      onClick={() => handleContribute(product._id)}
                      style={{
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#FFB300",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      + Contribute
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      style={{
                        padding: "10px 20px",
                        border: "1px solid red",
                        borderRadius: "8px",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: "600",
                        color: "red",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer style={footer}>
          <p>© 2025 TrackMySavings | All Rights Reserved</p>
          <div>
            <a href="/about-us" style={{ margin: "0 10px" }}>
              About Us
            </a>
            <a href="/privacy" style={{ margin: "0 10px" }}>
              Privacy Policy
            </a>
            <a href="/contact" style={{ margin: "0 10px" }}>
              Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
