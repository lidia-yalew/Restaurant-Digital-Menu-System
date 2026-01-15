import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Logo from "./pages/Home/Logo";
import Home from "./pages/Home/Home";
import Layout from "./layout/Layout.jsx";
import Menu from "./pages/client/Menu.jsx";

function App() {
  const [showHome, setShowHome] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowHome(true)}
      onMouseLeave={() => setShowHome(false)}
      className="min-h-screen"
    >
      {showHome ? (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={ <Home />
              }
            />
            <Route path="menu" element={<Menu />} />
          </Route>
        </Routes>
      ) : (
        <Logo />
      )}
    </div>
  );
}

export default App;
