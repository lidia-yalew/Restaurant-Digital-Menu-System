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
import ClientMenu from "./pages/client/Menu.jsx";
import Checkout from "./pages/client/Checkout.jsx";
import OrdersManagement from "./pages/Manager/Orders/OrdersManagement.jsx";
import ProtectedRoute from "./componests/ProtectedRoute";
import Profile from "./pages/client/Profil.jsx";
import ReservationsManagement from "./pages/Manager/Reservations/ReservationsManagement.jsx";
import Index from "./pages/Manager/Sitting/index.jsx";
import RestInfo from "./pages/Manager/Sitting/RestInfo.jsx";
import ActiveOrdersPage from "./pages/kitchen/ActiveOrdersPage.jsx";
import ChefMenuPage from "./pages/kitchen/ChefMenuPage.jsx";
import AdminDashboard from "./pages/Admin/Dashibord/AdminDashboard.jsx";
import UserManagement from "./pages/Admin/UserManagment.jsx";
import AdminNav from "./layout/AdminNav/AdminNav.jsx";
import AsettingsIndex from "./pages/Admin/Asitting.jsx";
import ForgotPassword from "./pages/client/ForgotPassword.jsx";
import ResetPassword from "./pages/client/ResetPassword.jsx";
import ManagerProfile from "./pages/Manager/ManagerProfile.jsx";
import AdminProfile from "./pages/Admin/Adminprofile.jsx";
import ChefProfile from "./pages/kitchen/ChefProfile.jsx";

function App() {
  return (
    <div className="min-h-screen">
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
          <Route path="profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password"  element={<ResetPassword />} />
        </Route>

        {/* Manager Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
          <Route path="/manager" element={<Mnav />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="menu" element={<MenuList />} />
            <Route path="menu/create" element={<CreateMenuItem />} />
            <Route path="menu/edit/:id" element={<EditMenuItem />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="reports" element={<div>Reports (Coming)</div>} />
            <Route path="reservations" element={<ReservationsManagement />} />
            <Route path="feedback" element={<div>feedback(Coming)</div>} />
            <Route path="chat" element={<div>chat(Coming)</div>} />
            <Route path="settings" element={<Index />} />
            <Route path="profile" element={<ManagerProfile />} />
            <Route path="settings/restaurant-info" element={<RestInfo />} />
          </Route>
        </Route>

        {/* Kitchen Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'chef']} />}>
          <Route path="/chef" element={<Knav />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<KitchenDashboard />} />
            <Route path="orders" element={<ActiveOrdersPage />} />
             <Route path="menu" element={<MenuList />} />
             <Route path="profile" element={<ChefProfile />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminNav />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="menu" element={<MenuList />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="reservations" element={<ReservationsManagement />} />
          <Route path="setting" element={<AsettingsIndex />} />
          <Route path="setting/restaurant-info" element={<RestInfo />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;