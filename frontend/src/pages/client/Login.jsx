import React from "react";
import Banner from "../Home/Baner";
import { motion } from "framer-motion";
import WetPaintButton from "../../componests/UI/Button"

function Login() {
  return (
    <div className="fixed inset-0 overflow-hidden lg:mt-16 mt-12">
      {/* Banner with blurred background */}
      <div className="absolute hidden md:block inset-0 blur-xs h-full">
        <Banner />
      </div>

      {/* Clear Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="relative z-10 flex items-center justify-center h-full"
      >
        <div className="w-[340px] md:w-[300px] bg-card/40 backdrop-blur-md border border-primary rounded-4xl p-8 shadow-2xl text-white mt-2">

 <h2 className="text-center text-4xl font-serif italic mb-3 text-primary">
  Login
</h2>

<div className="h-1 w-40 bg-primary mx-auto rounded mb-2"></div>
  {/* Username */}
  <div className="mb-4">
    <input
      type="text"
      placeholder="Username"
      className="w-full px-4 py-2 rounded-full bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-black/50"
    />
  </div>

  {/* Password */}
  <div className="mb-4">
    <input
      type="password"
      placeholder="Password"
      className="w-full px-4 py-2 rounded-full bg-white/10 border border-primary focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-black/50"
    />
  </div>

  {/* Remember + Forgot */}
  <div className="flex items-center justify-between text-sm mb-6">
    <label className="flex items-center gap-2">
      <input type="checkbox" className="accent-white" />
      Remember me
    </label>

    <a href="#" className="hover:underline">
      Forgot password?
    </a>
  </div>

  {/* Login Button */}
  <WetPaintButton className="mx-auto text-xl md:text-base px-2 md:px-8 md:py-2">
              Login
            </WetPaintButton>
    
  

  {/* Register */}
  <p className="text-center text-sm mt-6 ">
    Don't have an account?{" "}
    <span className="underline cursor-pointer text-primary">
      Register
    </span>
  </p>

</div>
      </motion.div>
    </div>
  );
}

export default Login;
