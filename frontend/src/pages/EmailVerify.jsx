import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const EmailVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // ✅ Get email from state
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        navigate("/dashboard"); // ✅ Go to dashboard after success
      } else {
        setError(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Verification failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Verify Your Email</h2>
        <p className="text-center mb-4">We sent a code to: <b>{email}</b></p>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none mb-4"
        />
        <button
          onClick={handleVerify}
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
