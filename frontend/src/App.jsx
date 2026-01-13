import React, { useState } from "react";
import Logo from "./pages/Home/Logo";
import Home from "./pages/Home/Home";

function App() {
  const [showHome, setShowHome] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowHome(true)}
      onMouseLeave={() => setShowHome(false)}
      className="min-h-screen"
    >
      {showHome ? <Home /> : <Logo />}
    </div>
  );
}

export default App;
