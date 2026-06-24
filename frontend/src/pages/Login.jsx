// Login.jsx - FIXED VERSION
import React, { useEffect, useState } from "react";
import Banner from "./Home/Baner";
import { motion } from "framer-motion";
import WetPaintButton from "../componests/UI/Button";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../API/authapi";
import { useAuth } from "../config/AuthContext"; // ADD THIS

function Login() {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth(); // ADD THIS - get login function from context
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
useEffect(() => {
  const remembered = localStorage.getItem("rememberMe") === "true";
  setRememberMe(remembered);
}, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData.username, formData.password);
      
      console.log("Login successful:", response);

      // IMPORTANT: Set user in AuthContext
      if (response.user) {
        setAuthUser(response.user);
      }

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      const userRole = response.user.role;
      
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "chef") {
        navigate("/chef");
      } else if (userRole === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/");
      }
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden lg:mt-16 mt-12">
      <div className="absolute hidden md:block inset-0 blur-xs h-full">
        <Banner />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="relative z-10 flex items-center justify-center h-full"
      >
        <form
          onSubmit={handleSubmit}
          className="w-[340px] md:w-[300px] bg-card/40 backdrop-blur-md border border-primary rounded-4xl p-8 shadow-2xl text-white mt-2"
        >
          <h2 className="text-center text-4xl font-serif italic mb-3 text-primary">
            Login
          </h2>

          <div className="h-1 w-40 bg-primary mx-auto rounded mb-6"></div>

          {error && (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mb-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-2 rounded-full bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-black/50 text-white"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 rounded-full bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-black/50 text-white"
              disabled={loading}
            />
          </div>

          <div className=" text-sm text-primary mb-6">
            <Link to="/forgot-password" className="hover:underline text-primary">
  Forgot password?
</Link>
          </div>

          <WetPaintButton
            type="submit"
            disabled={loading}
            className="mx-auto text-xl md:text-base px-2 md:px-8 md:py-2 w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </WetPaintButton>

          <div className="flex justify-center mt-6 gap-2">
            <p className="text-center text-sm">Don't have an account?</p>
            <Link to="/register" className="underline cursor-pointer text-primary">
              Register
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;