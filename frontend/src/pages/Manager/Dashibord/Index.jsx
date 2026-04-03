import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaShoppingCart,
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaFileExport,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaTimesCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todaySales: 2845,
    todayOrders: 28,
    activeOrders: 8,
    totalCustomers: 156,
    avgOrderValue: 82.50,
    revenueChange: 12.5,
    ordersChange: 8.3,
    customersChange: 15.2
  });

  const [recentOrders] = useState([
    { id: 1, customer: "John Doe", items: 3, total: 85, status: "completed", time: "10:30 AM", table: 5 },
    { id: 2, customer: "Jane Smith", items: 2, total: 45, status: "pending", time: "10:45 AM", table: 3 },
    { id: 3, customer: "Mike Johnson", items: 4, total: 120, status: "preparing", time: "11:00 AM", table: 7 },
    { id: 4, customer: "Sarah Williams", items: 1, total: 25, status: "completed", time: "11:15 AM", table: 2 },
    { id: 5, customer: "Tom Brown", items: 3, total: 95, status: "pending", time: "11:30 AM", table: 4 },
  ]);

  const [dateRange, setDateRange] = useState('today'); // today, week, month

  const StatsCard = ({ title, value, icon: Icon, color, change, changeType, subtext }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="text-white text-xl" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {changeType === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
            {change}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-gray-500 text-sm mt-1">{title}</p>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </motion.div>
  );

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "text-green-500";
      case "pending": return "text-yellow-500";
      case "preparing": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-50 border-green-200";
      case "pending": return "bg-yellow-50 border-yellow-200";
      case "preparing": return "bg-blue-50 border-blue-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "completed": return <FaCheckCircle className="text-green-500" />;
      case "pending": return <FaClock className="text-yellow-500" />;
      case "preparing": return <FaSpinner className="animate-spin text-blue-500" />;
      default: return <FaTimesCircle className="text-gray-500" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your restaurant performance</p>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('today')}
              className={`px-4 py-2 rounded-lg transition-all ${
                dateRange === 'today' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-4 py-2 rounded-lg transition-all ${
                dateRange === 'week' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-4 py-2 rounded-lg transition-all ${
                dateRange === 'month' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Today's Sales"
          value={`$${stats.todaySales}`}
          icon={FaDollarSign}
          color="bg-green-500"
          change={stats.revenueChange}
          changeType="up"
        />
        <StatsCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon={FaShoppingCart}
          color="bg-blue-500"
          change={stats.ordersChange}
          changeType="up"
        />
        <StatsCard
          title="Active Orders"
          value={stats.activeOrders}
          icon={FaClock}
          color="bg-yellow-500"
          subtext="Currently preparing"
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={FaUsers}
          color="bg-purple-500"
          change={stats.customersChange}
          changeType="up"
        />
        <StatsCard
          title="Avg Order Value"
          value={`$${stats.avgOrderValue}`}
          icon={FaChartLine}
          color="bg-pink-500"
          change={5.2}
          changeType="up"
        />
      </div>

      {/* Charts Section - Simple for now */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <FaChartLine className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">Chart will appear here</p>
              <p className="text-xs text-gray-400 mt-1">(Recharts will be added later)</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Peak Hour</span>
              <span className="text-gray-800 font-semibold">7:00 PM - 8:30 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Most Popular Item</span>
              <span className="text-gray-800 font-semibold">Margherita Pizza</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Completion Rate</span>
              <span className="text-green-500 font-semibold">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Average Wait Time</span>
              <span className="text-gray-800 font-semibold">18 minutes</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Today's Target</span>
                <span className="text-gray-700">$2,500 / $3,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: '83%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <Link to="/manager/orders" className="text-primary text-sm hover:underline flex items-center gap-1">
            View All Orders →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-gray-500 font-medium">Order ID</th>
                <th className="text-left py-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left py-3 text-gray-500 font-medium">Table</th>
                <th className="text-left py-3 text-gray-500 font-medium">Items</th>
                <th className="text-left py-3 text-gray-500 font-medium">Total</th>
                <th className="text-left py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 text-gray-500 font-medium">Time</th>
                <th className="text-left py-3 text-gray-500 font-medium">Actions</th>
               </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                  <td className="py-3 text-gray-800 font-medium">#{order.id}</td>
                  <td className="py-3 text-gray-700">{order.customer}</td>
                  <td className="py-3 text-gray-700">Table {order.table}</td>
                  <td className="py-3 text-gray-700">{order.items}</td>
                  <td className="py-3 text-gray-800 font-semibold">${order.total}</td>
                  <td className="py-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusBgColor(order.status)} w-fit`}>
                      {getStatusIcon(order.status)}
                      <span className={`capitalize text-sm ${getStatusColor(order.status)}`}>{order.status}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{order.time}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-500 hover:text-blue-600">
                        <FaEdit size={16} />
                      </button>
                      <button className="text-red-500 hover:text-red-600">
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Link to="/manager/menu/new" className="bg-primary hover:bg-primary/90 text-white py-3 rounded-xl text-center font-semibold transition-all">
          + Add Menu Item
        </Link>
        <Link to="/manager/orders" className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-center font-semibold transition-all">
          View All Orders
        </Link>
        <Link to="/manager/reports" className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-center font-semibold transition-all">
          Generate Reports
        </Link>
        <Link to="/manager/reservations" className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-center font-semibold transition-all">
          Manage Reservations
        </Link>
      </div>
    </div>
  );
};

export default ManagerDashboard;