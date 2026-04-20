import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Logo from "./pages/Home/Logo";
import Home from "./pages/Home/Home";
import Layout from "./layout/client/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/client/Register.jsx";
import Aboutme from "./pages/client/Aboutme.jsx";
import Reserv from "./pages/client/Reserv.jsx";
import ManagerDashboard from "./pages/Manager/Dashibord/Index.jsx"
import Mnav from "./layout/manager/Mnav.jsx";
import Knav from "./layout/kichin/Knav.jsx";
import KitchenDashboard from "./pages/kitchen/Dasgibord/Index.jsx";
import MenuList from "./pages/MenuList.jsx";
import CreateMenuItem from "./pages/Manager/Menu/CreateMenuItem.jsx";
import EditMenuItem from "./pages/Manager/Menu/EditMenuItem.jsx";
import Admin from "./pages/Admin/Admin.jsx";
import ClientMenu from "./pages/client/Menu.jsx";
import Checkout from "./pages/client/Checkout.jsx";
import OrdersManagement from "./pages/Manager/Orders/OrdersManagement.jsx";
import ProtectedRoute from "./componests/ProtectedRoute";
import Profile from "./pages/client/Profil.jsx";

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
          {/* Public Routes - No login required */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<ClientMenu />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="aboutme" element={<Aboutme />} />
            <Route path="reserve" element={<Reserv />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="admin" element={<Admin />} />
<Route path="/profile" element={<Profile />} />
          </Route>

          {/* Manager Routes - Protected (Admin & Manager only) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/manager" element={<Mnav />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="menu" element={<MenuList />} />
              <Route path="menu/create" element={<CreateMenuItem />} />
              <Route path="menu/edit/:id" element={<EditMenuItem />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="reports" element={<div>Reports (Coming)</div>} />
              <Route path="reservations" element={<div>Reservations (Coming)</div>} />
              <Route path="customers" element={<div>Customers (Coming)</div>} />
              <Route path="settings" element={<div>Settings (Coming)</div>} />
            </Route>
          </Route>

          {/* Kitchen Routes - Protected (Admin, Manager, Kitchen only) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']} />}>
            <Route path="/kitchen" element={<Knav />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<KitchenDashboard />} />
              <Route path="orders" element={<KitchenDashboard />} />
              <Route path="inventory" element={<div>Inventory Status (Coming)</div>} />
            </Route>
          </Route>

          {/* Fallback - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Logo />
      )}
    </div>
  );
}

export default App;