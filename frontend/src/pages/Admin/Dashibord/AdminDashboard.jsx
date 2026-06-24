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
  FaStar,
  FaFilter,
  FaChartPie
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalOrders: 342,
    totalSales: 45280,
    totalReservations: 89,
    totalMenuItems: 45,
    pendingReservations: 12,
    activeOrders: 18,
    completedOrders: 156,
    newUsersToday: 8,
    revenueToday: 4280,
    ordersToday: 24,
    popularItems: [
      { name: 'Margherita Pizza', count: 45 },
      { name: 'Chicken Burger', count: 38 },
      { name: 'Caesar Salad', count: 32 },
      { name: 'Pasta Carbonara', count: 28 },
      { name: 'Grilled Salmon', count: 22 }
    ],
    recentOrders: [],
    recentUsers: [],
    reservationsToday: 6,
    occupancyRate: 72,
    topSellingItems: [
      { name: 'Margherita Pizza', count: 320 },
      { name: 'Chicken Burger', count: 285 },
      { name: 'Pasta Carbonara', count: 230 },
      { name: 'Caesar Salad', count: 198 },
      { name: 'Grilled Salmon', count: 165 }
    ],
    userGrowth: 12,
    orderGrowth: 8,
    revenueGrowth: 15,
    // Chart data with sample values
    revenueByDay: [3200, 2800, 4500, 3800, 5100, 4200, 4800],
    ordersByDay: [18, 15, 24, 20, 28, 22, 26],
    statusDistribution: {
      completed: 156,
      preparing: 45,
      pending: 28,
      served: 62,
      confirmed: 34
    },
    categoryDistribution: {
      'Pizza': 45,
      'Burgers': 38,
      'Salads': 32,
      'Pasta': 28,
      'Seafood': 22,
      'Desserts': 18,
      'Drinks': 15
    },
    dailyData: [
      { date: '2026-06-18', label: 'Thu', revenue: 3200, orders: 18 },
      { date: '2026-06-19', label: 'Fri', revenue: 2800, orders: 15 },
      { date: '2026-06-20', label: 'Sat', revenue: 4500, orders: 24 },
      { date: '2026-06-21', label: 'Sun', revenue: 3800, orders: 20 },
      { date: '2026-06-22', label: 'Mon', revenue: 5100, orders: 28 },
      { date: '2026-06-23', label: 'Tue', revenue: 4200, orders: 22 },
      { date: '2026-06-24', label: 'Today', revenue: 4800, orders: 26 }
    ]
  });

  // Helper: Get date range based on filter
  const getDateRange = (filter) => {
    const now = new Date();
    const start = new Date(now);
    
    switch(filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      default:
        start.setHours(0, 0, 0, 0);
    }
    return { start, end: now };
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '0.00 ETB';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? 'ETB0.00' : `${num.toFixed(2)} ETB`;
  };

  // Get status color
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

  // Fetch all data (with mock data for demo)
  const fetchAllData = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in production, replace with actual API calls
    const mockData = {
      totalUsers: 156,
      totalOrders: 342,
      totalSales: 45280,
      totalReservations: 89,
      totalMenuItems: 45,
      pendingReservations: 12,
      activeOrders: 18,
      completedOrders: 156,
      newUsersToday: 8,
      revenueToday: 4280,
      ordersToday: 24,
      popularItems: [
        { name: 'Margherita Pizza', count: 45 },
        { name: 'Chicken Burger', count: 38 },
        { name: 'Caesar Salad', count: 32 },
        { name: 'Pasta Carbonara', count: 28 },
        { name: 'Grilled Salmon', count: 22 }
      ],
      topSellingItems: [
        { name: 'Margherita Pizza', count: 320 },
        { name: 'Chicken Burger', count: 285 },
        { name: 'Pasta Carbonara', count: 230 },
        { name: 'Caesar Salad', count: 198 },
        { name: 'Grilled Salmon', count: 165 }
      ],
      userGrowth: 12,
      orderGrowth: 8,
      revenueGrowth: 15,
      revenueByDay: [3200, 2800, 4500, 3800, 5100, 4200, 4800],
      ordersByDay: [18, 15, 24, 20, 28, 22, 26],
      statusDistribution: {
        completed: 156,
        preparing: 45,
        pending: 28,
        served: 62,
        confirmed: 34
      },
      categoryDistribution: {
        'Pizza': 45,
        'Burgers': 38,
        'Salads': 32,
        'Pasta': 28,
        'Seafood': 22,
        'Desserts': 18,
        'Drinks': 15
      },
      dailyData: [
        { date: '2026-06-18', label: 'Thu', revenue: 3200, orders: 18 },
        { date: '2026-06-19', label: 'Fri', revenue: 2800, orders: 15 },
        { date: '2026-06-20', label: 'Sat', revenue: 4500, orders: 24 },
        { date: '2026-06-21', label: 'Sun', revenue: 3800, orders: 20 },
        { date: '2026-06-22', label: 'Mon', revenue: 5100, orders: 28 },
        { date: '2026-06-23', label: 'Tue', revenue: 4200, orders: 22 },
        { date: '2026-06-24', label: 'Today', revenue: 4800, orders: 26 }
      ],
      occupancyRate: 72,
      reservationsToday: 6
    };

    setStats(mockData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [dateFilter]);

  const StatsCard = ({ title, value, icon: Icon, color, subtext, growth }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="text-white text-xl" />
        </div>
        {growth && (
          <span className="text-xs text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            ↑ {growth}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{title}</p>
      {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtext}</p>}
    </motion.div>
  );

  // Chart configuration
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#22C55E',
    tertiary: '#F59E0B',
    purple: '#8B5CF6',
    pink: '#EC4899',
    red: '#EF4444',
    teal: '#06B6D4'
  };

  const barChartData = {
    labels: stats.dailyData.map(d => d.label),
    datasets: [
      {
        label: 'Revenue (ETB)',
        data: stats.revenueByDay,
        backgroundColor: stats.dailyData.map((_, i) => 
          i === stats.dailyData.length - 1 ? chartColors.primary : 'rgba(59, 130, 246, 0.3)'
        ),
        borderColor: chartColors.primary,
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  const lineChartData = {
    labels: stats.dailyData.map(d => d.label),
    datasets: [
      {
        label: 'Orders',
        data: stats.ordersByDay,
        borderColor: chartColors.secondary,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.secondary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const statusLabels = Object.keys(stats.statusDistribution);
  const statusColors = {
    completed: chartColors.secondary,
    preparing: chartColors.primary,
    pending: chartColors.tertiary,
    served: chartColors.purple,
    confirmed: chartColors.teal,
    cancelled: chartColors.red
  };

  const doughnutData = {
    labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: Object.values(stats.statusDistribution),
        backgroundColor: statusLabels.map(k => statusColors[k] || '#ccc'),
        borderWidth: 2,
        borderColor: '#fff',
      }
    ]
  };

  const categoryLabels = Object.keys(stats.categoryDistribution);
  const categoryColors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.purple,
    chartColors.pink,
    chartColors.teal,
    chartColors.red
  ];

  const categoryDoughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: Object.values(stats.categoryDistribution),
        backgroundColor: categoryLabels.map((_, i) => categoryColors[i % categoryColors.length]),
        borderWidth: 2,
        borderColor: '#fff',
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Filter Dropdown */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <FaFilter className="text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-gray-700 dark:text-gray-300 outline-none text-sm cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <button 
              onClick={fetchAllData}
              className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
            >
              <FaSpinner className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
          <FaCalendarAlt />
          <span>
            <strong>Showing data for: </strong>
            {dateFilter === 'today' && 'Today\'s metrics'}
            {dateFilter === 'week' && 'Last 7 days'}
            {dateFilter === 'month' && 'Last 30 days'}
          </span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={`${dateFilter === 'today' ? 'Today\'s' : dateFilter === 'week' ? 'Weekly' : 'Monthly'} Revenue`}
          value={formatCurrency(stats.totalSales)}
          icon={FaWallet}
          color="bg-green-500"
          growth={stats.revenueGrowth}
        />
        <StatsCard
          title={`${dateFilter === 'today' ? 'Today\'s' : dateFilter === 'week' ? 'Weekly' : 'Monthly'} Orders`}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Today's Revenue</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.revenueToday)}</p>
          <p className="text-xs text-gray-400 mt-1">From {stats.ordersToday} orders</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Orders</p>
          <p className="text-xl font-bold text-blue-600">{stats.activeOrders}</p>
          <p className="text-xs text-gray-400 mt-1">Pending & preparing</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">New Users Today</p>
          <p className="text-xl font-bold text-purple-600">{stats.newUsersToday}</p>
          <p className="text-xs text-gray-400 mt-1">Registered today</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Reservations</p>
          <p className="text-xl font-bold text-orange-600">{stats.reservationsToday}</p>
          <p className="text-xs text-gray-400 mt-1">Today's bookings</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Revenue Trend
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {dateFilter === 'today' ? 'Last 7 days' : dateFilter === 'week' ? 'Daily' : 'Weekly'}
            </span>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </motion.div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartBar className="text-green-500" />
              Orders Trend
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {dateFilter === 'today' ? 'Last 7 days' : dateFilter === 'week' ? 'Daily' : 'Weekly'}
            </span>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </motion.div>
      </div>

      {/* Status & Category Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartPie className="text-blue-500" />
            Order Status Distribution
          </h3>
          <div className="flex items-center justify-center">
            <div className="h-48 w-48">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {statusLabels.map((status) => (
              <span key={status} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: statusColors[status] || '#ccc' }}
                />
                {status}: {stats.statusDistribution[status]}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartPie className="text-purple-500" />
            Category Distribution
          </h3>
          <div className="flex items-center justify-center">
            <div className="h-48 w-48">
              <Doughnut data={categoryDoughnutData} options={doughnutOptions} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {categoryLabels.slice(0, 6).map((category, idx) => (
              <span key={category} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: categoryColors[idx % categoryColors.length] }}
                />
                {category}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Average Order Value</span>
              <span className="text-gray-900 dark:text-white font-semibold">
                {stats.totalOrders > 0 
                  ? formatCurrency(stats.totalSales / stats.totalOrders)
                  : '0.00 ETB'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Completion Rate</span>
              <span className="text-green-500 font-semibold">
                {stats.totalOrders > 0 
                  ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Occupancy Rate</span>
              <span className="text-gray-900 dark:text-white font-semibold">{stats.occupancyRate}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔥 Top Items Today</h3>
          <div className="space-y-3">
            {stats.popularItems.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-500">#{idx + 1}</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{item.count} sold</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⭐ All Time Best</h3>
          <div className="space-y-3">
            {stats.topSellingItems.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" size={14} />
                  <span className="text-gray-700 dark:text-gray-300 text-sm truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{item.count} sold</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
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
      </motion.div>
    </div>
  );
};

export default AdminDashboard;