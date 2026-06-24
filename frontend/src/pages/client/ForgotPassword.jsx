// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import WetPaintButton from "../../componests/UI/Button";
import { forgotPassword } from "../../API/authapi"; // we'll add this below

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden lg:mt-16 mt-12 text-text">

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="relative z-10 flex items-center justify-center h-full"
      >
        <div className="w-[340px] md:w-[360px] bg-card/40 backdrop-blur-md border border-primary rounded-4xl p-8 shadow-2xl ">
          <h2 className="text-center text-4xl font-serif italic mb-3 text-primary">
            {sent ? "Email Sent!" : "Forgot Password"}
          </h2>
          <div className="h-1 w-40 bg-primary mx-auto rounded mb-6" />

          {sent ? (
            // ✅ Success state
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className=" text-sm mb-6">
                We sent a password reset link to <span className="text-primary font-semibold">{email}</span>. Check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="text-primary underline text-sm hover:opacity-80">
                Back to Login
              </Link>
            </div>
          ) : (
            // 📧 Form state
            <form onSubmit={handleSubmit}>
              <p className=" text-sm text-center mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded text-text-200 text-xs text-center">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="Your email address"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-full bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-black/50 "
                />
              </div>

              <WetPaintButton
                type="submit"
                disabled={loading}
                className="mx-auto text-xl md:text-base px-2 md:px-8 md:py-2 w-full"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </WetPaintButton>

              <div className="flex justify-center mt-6">
                <Link to="/login" className="text-primary underline text-sm hover:opacity-80">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;