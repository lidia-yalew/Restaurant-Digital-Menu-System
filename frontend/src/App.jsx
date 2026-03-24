import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Logo from "./pages/Home/Logo";
import Home from "./pages/Home/Home";
import Layout from "./layout/Layout.jsx";
import Menu from "./pages/client/Menu.jsx";
import Login from "./pages/client/Login.jsx";
import Register from "./pages/client/Register.jsx";
import Aboutme from "./pages/client/Aboutme.jsx";
import Menuuu from "./pages/client/Menuuu.jsx";

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
            <Route path="login" element={<Login />} />
            <Route path="/register" element={<Register/>}/>
            <Route path="/aboutme" element={<Aboutme/>}/>
            <Route path="/reserve" element={<Menuuu/>}/>
            
          </Route>
        </Routes>
      ) : (
        <Logo />
      )}
    </div>
  );
}

export default App;
