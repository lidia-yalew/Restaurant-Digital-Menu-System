import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Logo from "./pages/Home/Logo";
import Home from "./pages/Home/Home";
import Layout from "./layout/client/Layout.jsx";
import Menu from "./pages/client/Menu.jsx";
import Login from "./pages/client/Login.jsx";
import Register from "./pages/client/Register.jsx";
import Aboutme from "./pages/client/Aboutme.jsx";
import Menuuu from "./pages/client/Menuuu.jsx";
import Reserv from "./pages/client/Reserv.jsx";
import ManagerDashboard from "./pages/Manager/Dashibord/Index.jsx"
import Mnav from "./layout/manager/Mnav.jsx";
import Knav from "./layout/kichin/Knav.jsx";
import KitchenDashboard from "./pages/kitchen/Dasgibord/Index.jsx";
import MenuList from "./pages/Manager/Menu/MenuList.jsx";
import CreateMenuItem from "./pages/Manager/Menu/CreateMenuItem.jsx";
import EditMenuItem from "./pages/Manager/Menu/EditMenuItem.jsx";

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
            <Route path="/reserve" element={<Reserv/>}/>
            </Route>
             <Route path="/manager" element={<Mnav />}>
          <Route index element={<ManagerDashboard />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
           <Route path="menu" element={<MenuList />} />
          <Route path="menu/create" element={<CreateMenuItem />} />
          <Route path="menu/edit/:id" element={<EditMenuItem />} />
          <Route path="orders" element={<div>Order Management (Coming)</div>} />
          <Route path="reports" element={<div>Reports (Coming)</div>} />
          <Route path="reservations" element={<div>Reservations (Coming)</div>} />
          <Route path="customers" element={<div>Customers (Coming)</div>} />
          <Route path="settings" element={<div>Settings (Coming)</div>} />
        </Route>
      <Route path="/kitchen" element={<Knav />}>
  <Route index element={<KitchenDashboard />} />
  <Route path="dashboard" element={<KitchenDashboard />} />
  <Route path="orders" element={<KitchenDashboard />} />
  <Route path="inventory" element={<div>Inventory Status (Coming)</div>} />
</Route>
          
        </Routes>
      ) : (
        <Logo />
      )}
    </div>
  );
}

export default App;
