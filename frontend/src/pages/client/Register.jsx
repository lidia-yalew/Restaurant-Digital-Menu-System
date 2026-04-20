// src/pages/Register/Register.jsx
import React, { useState } from "react";
import { useCreate } from "../../Hook/useinsert";
import { registerUser } from "../../API/authapi";
import { useNavigate, Link } from "react-router-dom";
import WetPaintButton from "../../componests/UI/Button";
import chef from "../../assets/IMG/chef.png";
import { motion } from "framer-motion";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "customer", // Default role is customer
  });

  const { handleCreate, loading, error } = useCreate(registerUser);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      alert("Please fill all fields");
      return;
    }
    
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
        className="w-[340px] ml-4 sm:ml-0 md:w-[450px] bg-card/40 backdrop-blur-md border border-primary rounded-4xl p-8 shadow-2xl text-white mt-10"
      >
        <h2 className="text-center text-4xl font-serif italic mb-3 text-primary">
          Register
        </h2>
        <div className="h-1 w-40 bg-primary mx-auto rounded mb-4"></div>

        {/* Username */}
        <div className="relative mb-5">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-primary"
            placeholder=" "
          />
          <label
            htmlFor="username"
            className="absolute left-4 top-2 text-sm text-primary transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-black/50 
              peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary/30"
          >
            Username
          </label>
        </div>

        {/* Password */}
        <div className="relative mb-5">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-primary text-primary"
            placeholder=" "
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-2 text-sm text-primary transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
              peer-placeholder-shown:text-black/50 
              peer-focus:top-2 peer-focus:text-sm peer-focus:text-primary/30"
          >
            Password
          </label>
        </div>

        {/* Hidden role field - always customer */}
        <input type="hidden" name="role" value="customer" />

        {/* Role indicator - show but not editable */}
        <div className="mb-5 p-3 bg-primary/10 rounded-xl border border-primary/30">
          <p className="text-sm text-center">
            <span className="text-primary">📝 Account Type:</span>{' '}
            <span className="text-white font-semibold">Customer</span>
          </p>
          <p className="text-xs text-primary/60 text-center mt-1">
            Create a customer account to order food online
          </p>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between text-sm text-primary mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-white" />
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <WetPaintButton
          disabled={loading}
          className="mx-auto text-xl md:text-base px-2 md:px-8 md:py-2 w-full"
        >
          {loading ? "Registering..." : "Register"}
        </WetPaintButton>

        {/* Error */}
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

        {/* Already have account */}
        <div className="flex justify-center mt-6 gap-2">
          <p className="text-sm text-primary/50">Already have an account?</p>
          <Link to="/login" className="underline cursor-pointer text-primary">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;