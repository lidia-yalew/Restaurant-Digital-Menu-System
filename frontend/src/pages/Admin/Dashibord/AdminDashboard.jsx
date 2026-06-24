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
  FaTimesCircle,
  FaEye,
  FaFire,
  FaHourglassHalf,
  FaCheckDouble,
  FaCrown,
  FaUserShield,
  FaUtensils,
  FaCalendarCheck,
  FaStore,
  FaUserPlus,
  FaChartBar,
  FaWallet,
  FaStar
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { fetchOrdersService } from '../../../service/orderservice';
import { getReservations } from '../../../API/reservapi';
import { fetchMenuService } from '../../../service/menuservice';
import { getAllUsers, getUserStats } from '../../../API/userapi';
import { getRestaurantInfo } from '../../../API/resinfo';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
    totalReservations: 0,
    totalMenuItems: 0,
    pendingReservations: 0,
    activeOrders: 0,
    completedOrders: 0,
    newUsersToday: 0,
    revenueToday: 0,
    ordersToday: 0,
    popularItems: [],
    recentOrders: [],
    recentUsers: [],
    reservationsToday: 0,
    occupancyRate: 0,
    topSellingItems: [],
    userGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0
  });

  // Helper: Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0.00 ETB';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? 'ETB0.00' : `${num.toFixed(2)} ETB`;
  };

  const parseAmount = (amount) => {
    if (!amount) return 0;
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? 0 : num;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "text-green-500";
      case "pending": return "text-yellow-500";
      case "preparing": return "text-blue-500";
      case "served": return "text-purple-500";
      case "confirmed": return "text-indigo-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBgColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-50 border-green-200";
      case "pending": return "bg-yellow-50 border-yellow-200";
      case "preparing": return "bg-blue-50 border-blue-200";
      case "served": return "bg-purple-50 border-purple-200";
      case "confirmed": return "bg-indigo-50 border-indigo-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "completed": return <FaCheckCircle className="text-green-500" />;
      case "pending": return <FaClock className="text-yellow-500" />;
      case "preparing": return <FaSpinner className="animate-spin text-blue-500" />;
      case "served": return <FaCheckCircle className="text-purple-500" />;
      case "confirmed": return <FaCheckCircle className="text-indigo-500" />;
      default: return <FaTimesCircle className="text-gray-500" />;
    }
  };

  // Calculate popular items
  const calculatePopularItems = (orders) => {
    const itemCount = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const itemName = item.name;
          itemCount[itemName] = (itemCount[itemName] || 0) + (item.quantity || 1);
        });
      }
    });
    
    return Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersResponse = await fetchOrdersService();
      let ordersArray = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse.data || ordersResponse.orders || []);
      
      // Fetch menu items
      const menuResponse = await fetchMenuService();
      let menuArray = Array.isArray(menuResponse) ? menuResponse : (menuResponse.data || menuResponse.items || []);
      
      // Fetch users
      let usersArray = [];
      try {
        const usersResponse = await getAllUsers();
        usersArray = Array.isArray(usersResponse) ? usersResponse : (usersResponse.users || usersResponse.data || []);
      } catch (err) {
        console.debug('Users API not available yet');
      }
      
      // Fetch reservations
      let reservationsArray = [];
      try {
        const resResponse = await getReservations();
        reservationsArray = Array.isArray(resResponse) ? resResponse : (resResponse.data || resResponse.reservations || []);
      } catch (err) {
        console.debug('Reservations API not available yet');
      }

      // Today's orders
      const todayOrders = ordersArray.filter(order => isToday(order.created_at));
      
      // Calculate stats
      const totalOrders = ordersArray.length;
      const totalSales = ordersArray.reduce((sum, o) => sum + parseAmount(o.total_amount), 0);
      const totalUsers = usersArray.length;
      const totalMenuItems = menuArray.length;
      const totalReservations = reservationsArray.length;
      const pendingReservations = reservationsArray.filter(r => r.status === 'pending').length;
      
      // Today's stats
      const ordersToday = todayOrders.length;
      const revenueToday = todayOrders.reduce((sum, o) => sum + parseAmount(o.total_amount), 0);
      const activeOrders = todayOrders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'confirmed').length;
      const completedOrders = todayOrders.filter(o => o.status === 'completed' || o.status === 'served').length;
      
      // New users today
      const newUsersToday = usersArray.filter(u => isToday(u.created_at)).length;
      
      // Reservations today
      const reservationsToday = reservationsArray.filter(r => isToday(r.created_at)).length;
      
      // Popular items
      const popularItems = calculatePopularItems(todayOrders);
      
      // Top selling items (all time)
      const topSellingItems = calculatePopularItems(ordersArray);

      // Calculate growth (mock - compare with previous day)
      // In real app, you'd compare with yesterday's data
      const userGrowth = 12; // Example: 12% growth
      const orderGrowth = 8; // Example: 8% growth
      const revenueGrowth = 15; // Example: 15% growth
      
      // Occupancy rate (mock)
      const occupancyRate = 65; // Example: 65%

      setStats({
        totalUsers,
        totalOrders,
        totalSales,
        totalReservations,
        totalMenuItems,
        pendingReservations,
        activeOrders,
        completedOrders,
        newUsersToday,
        revenueToday,
        ordersToday,
        popularItems,
        recentOrders,
        recentUsers,
        reservationsToday,
        occupancyRate,
        topSellingItems,
        userGrowth,
        orderGrowth,
        revenueGrowth
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const StatsCard = ({ title, value, icon: Icon, color, subtext, growth }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-sm p-6 border border-border hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="text-white text-xl" />
        </div>
        {growth && (
          <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
            ↑ {growth}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-text">{value}</h3>
      <p className="text-text/60 text-sm mt-1">{title}</p>
      {subtext && <p className="text-xs text-text/40 mt-2">{subtext}</p>}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
            <p className="text-text/60 text-sm mt-1">
              📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={fetchAllData}
            className="bg-card text-text/70 px-4 py-2 rounded-lg hover:bg-border transition-all flex items-center gap-2 border border-border"
          >
            <FaSpinner className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Today's Date Banner */}
      <div className="bg-primary/10 rounded-xl p-3 mb-6 border border-primary/20">
        <div className="flex items-center gap-2 text-primary text-sm">
          <FaCalendarAlt />
          <span><strong>Today's Overview</strong> - Real-time business metrics at a glance</span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalSales)}
          icon={FaWallet}
          color="bg-green-500"
          growth={stats.revenueGrowth}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={FaShoppingCart}
          color="bg-blue-500"
          growth={stats.orderGrowth}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          color="bg-purple-500"
          growth={stats.userGrowth}
        />
        <StatsCard
          title="Menu Items"
          value={stats.totalMenuItems}
          icon={FaUtensils}
          color="bg-orange-500"
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text/60 text-sm">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-text">{formatCurrency(stats.revenueToday)}</h3>
            </div>
            <FaDollarSign className="text-green-500 text-3xl opacity-50" />
          </div>
          <p className="text-xs text-text/40 mt-2">From {stats.ordersToday} orders</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text/60 text-sm">Active Orders</p>
              <h3 className="text-2xl font-bold text-text">{stats.activeOrders}</h3>
            </div>
            <FaClock className="text-yellow-500 text-3xl opacity-50" />
          </div>
          <p className="text-xs text-text/40 mt-2">Pending & preparing</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text/60 text-sm">New Users Today</p>
              <h3 className="text-2xl font-bold text-text">{stats.newUsersToday}</h3>
            </div>
            <FaUserPlus className="text-purple-500 text-3xl opacity-50" />
          </div>
          <p className="text-xs text-text/40 mt-2">Registered today</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text/60 text-sm">Pending Reservations</p>
              <h3 className="text-2xl font-bold text-text">{stats.pendingReservations}</h3>
            </div>
            <FaCalendarCheck className="text-purple-500 text-3xl opacity-50" />
          </div>
          <p className="text-xs text-text/40 mt-2">Awaiting confirmation</p>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <h3 className="text-lg font-semibold text-text mb-4">📊 Today's Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text/60">Average Order Value</span>
              <span className="text-text font-semibold">
                {stats.ordersToday > 0 
                  ? formatCurrency(stats.revenueToday / stats.ordersToday)
                  : '0.00 ETB'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text/60">Completion Rate</span>
              <span className="text-green-500 font-semibold">
                {stats.ordersToday > 0 
                  ? Math.round((stats.completedOrders / stats.ordersToday) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text/60">Occupancy Rate</span>
              <span className="text-text font-semibold">{stats.occupancyRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <h3 className="text-lg font-semibold text-text mb-4">🔥 Today's Top Items</h3>
          <div className="space-y-3">
            {stats.popularItems.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">#{idx + 1}</span>
                  <span className="text-text text-sm truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="text-text font-semibold text-sm">{item.count} sold</span>
              </div>
            ))}
            {stats.popularItems.length === 0 && (
              <p className="text-text/40 text-sm">No orders yet today</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
          <h3 className="text-lg font-semibold text-text mb-4">⭐ Top Selling (All Time)</h3>
          <div className="space-y-3">
            {stats.topSellingItems.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" size={14} />
                  <span className="text-text text-sm truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="text-text font-semibold text-sm">{item.count} sold</span>
              </div>
            ))}
            {stats.topSellingItems.length === 0 && (
              <p className="text-text/40 text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>

    

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/users" className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-center font-semibold transition-all">
          <FaUsers className="inline mr-2" /> Manage Users
        </Link>
        <Link to="/admin/menu" className="bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-center font-semibold transition-all">
          <FaUtensils className="inline mr-2" /> Manage Menu
        </Link>
        <Link to="/admin/orders" className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-center font-semibold transition-all">
          <FaShoppingCart className="inline mr-2" /> View Orders
        </Link>
        <Link to="/admin/reservations" className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-center font-semibold transition-all">
          <FaCalendarCheck className="inline mr-2" /> Reservations
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;