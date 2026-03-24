// src/pages/Register/Register.jsx
import React, { useState } from "react";
import { useCreate } from "../../Hook/useinsert";
import { registerUser } from "../../API/authapi";
import { useNavigate, Link } from "react-router-dom";
import WetPaintButton from "../../componests/UI/Button"; // fixed typo
import chef from "../../assets/IMG/chef.png";
import { motion } from "framer-motion";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  });

  const { handleCreate, loading, error } = useCreate(registerUser);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id || e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.username.trim() || !formData.password.trim() || !formData.role) {
    alert("Please fill all fields");
    return;
  }
  
  // Add password length validation
  if (formData.password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    const res = await handleCreate(formData);
    alert(res.message || "User registered successfully");
    navigate("/login");
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="sm:flex justify-around pt-4 mx-auto min-h-screen items-center">
      {/* Image */}
      <div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="relative"
        >
          <img
            src={chef}
            className="rounded-2xl md:rounded-3xl shadow-[0_0_20px_0_rgba(34,197,94,0.5)] w-2/5 md:w-full max-w-md mx-auto"
            alt="Chef"
          />
        </motion.div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-[340px] ml-4 sm:ml-0 md:w-[450px] bg-card/40 backdrop-blur-md border border-primary rounded-4xl p-8 shadow-2xl text-white mt-2"
      >
        <h2 className="text-center text-4xl font-serif italic mb-3 text-primary">
          Register
        </h2>
        <div className="h-1 w-40 bg-primary mx-auto rounded mb-4"></div>

        {/* Username */}
        <div className="relative mb-5">
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
            className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-white"
            placeholder=" "
          />
          <label
            htmlFor="username"
            className="absolute left-4 top-2 text-sm text-primary transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-black/50 
              peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary"
          >
            Username
          </label>
        </div>

        {/* Password */}
        <div className="relative mb-5">
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-white"
            placeholder=" "
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-2 text-sm text-primary transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-black/50 
              peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary"
          >
            Password
          </label>
        </div>

        {/* Role */}
        <div className="relative mb-6">
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-primary"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="chef">Chef</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between text-sm text-primary mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-white" />
            Remember me
          </label>

          <a href="#" className="hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <WetPaintButton
          disabled={loading}
          className="mx-auto text-xl md:text-base px-2 md:px-8 md:py-2 w-full"
        >
          {loading ? "Registering..." : "Register"}
        </WetPaintButton>

        {/* Error */}
        {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* Already have account */}
        <div className="flex justify-center mt-6 gap-2">
          <p className="text-sm text-scondary/50">Already have an account?</p>
          <Link to="/login" className="underline cursor-pointer text-primary">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;