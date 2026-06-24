// src/pages/Admin/Dashboard/AdminDashboard.jsx
import { useState, useEffect } from "react";
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
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaShoppingCart,
  FaUsers,
  FaUtensils,
  FaCalendarCheck,
  FaSync,
  FaChartLine,
  FaChartPie,
  FaTrophy,
  FaClock,
  FaUserPlus,
  FaFire,
  FaCrown,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getAllUsers } from "../../../API/userapi";
import { getReservations } from "../../../API/reservapi";
import { getOrdersAPI } from "../../../API/orderapi";
import { fetchMenuService } from "../../../service/menuservice";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtEtb = (n) =>
  typeof n === "number" ? n.toLocaleString("en-ET") + " ETB" : "— ETB";

const isToday = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
};

const parseAmt = (v) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? 0 : n;
};

const calcTopItems = (orders, limit = 5) => {
  const counts = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const name = item.name || item.item_name || "Unknown";
      counts[name] = (counts[name] || 0) + (item.quantity || 1);
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
};

const weekdayLabels = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIdx = (new Date().getDay() + 6) % 7;
  return days.map((_, i) => (i === 6 ? "Today" : days[(todayIdx - 6 + i + 7) % 7]));
};

// ── Components ────────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, subVariant = "neutral", icon }) {
  const subColor =
    subVariant === "up" ? "#22C55E" : subVariant === "down" ? "#EF4444" : "#888";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {sub && (
            <p className={`text-sm mt-1 ${subVariant === 'up' ? 'text-green-500' : subVariant === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
              {subVariant === "up" ? "↑ " : subVariant === "down" ? "↓ " : ""}
              {sub}
            </p>
          )}
        </div>
        <div className="text-2xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}

function BarList({ items }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.name}>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              <span className="text-gray-400 mr-2">#{idx + 1}</span>
              {item.name}
            </span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{item.count}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((item.count / max) * 100)}%` }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-gray-400">No data yet</p>
      )}
    </div>
  );
}

function Card({ title, children, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function QuickActionBtn({ icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
    </motion.button>
  );
}

// ── Chart Options ────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  completed: "#22C55E",
  preparing: "#3B82F6",
  pending: "#F59E0B",
  served: "#8B5CF6",
  confirmed: "#06B6D4",
  cancelled: "#EF4444",
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (v) => (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v),
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: { display: false },
  },
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      stepSize: 1,
    },
  },
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    menuItems: 0,
    revenueToday: 0,
    ordersToday: 0,
    activeOrders: 0,
    completedOrders: 0,
    newUsersToday: 0,
    pendingReservations: 0,
    revenueWeek: [0, 0, 0, 0, 0, 0, 0],
    ordersWeek: [0, 0, 0, 0, 0, 0, 0],
    statusBreakdown: { completed: 0, preparing: 0, pending: 0, served: 0 },
    topToday: [],
    topAllTime: [],
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAllData = async () => {
    try {
      setError(null);
      
      // Fetch all data
      const [ordersRes, menuRes, usersRes, reservationsRes] = await Promise.allSettled([
        getOrders().catch(() => []),
        fetchMenuService().catch(() => []),
        getAllUsers().catch(() => []),
        getReservations().catch(() => []),
      ]);

      // Extract data safely
      const getData = (result, defaultVal = []) => {
        if (result.status === 'fulfilled' && result.value) {
          if (Array.isArray(result.value)) return result.value;
          if (result.value.data) return result.value.data;
          if (result.value.orders) return result.value.orders;
          if (result.value.users) return result.value.users;
          if (result.value.items) return result.value.items;
          if (result.value.reservations) return result.value.reservations;
          return defaultVal;
        }
        return defaultVal;
      };

      const orders = getData(ordersRes);
      const menu = getData(menuRes);
      const users = getData(usersRes);
      const reservations = getData(reservationsRes);

      // Calculate stats
      const todayOrders = orders.filter((o) => isToday(o.created_at));
      const totalRevenue = orders.reduce((s, o) => s + parseAmt(o.total_amount), 0);
      const revenueToday = todayOrders.reduce((s, o) => s + parseAmt(o.total_amount), 0);

      // Last 7 days
      const revenueWeek = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toDateString();
        return orders
          .filter((o) => new Date(o.created_at).toDateString() === dayStr)
          .reduce((s, o) => s + parseAmt(o.total_amount), 0);
      });

      const ordersWeek = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toDateString();
        return orders.filter((o) => new Date(o.created_at).toDateString() === dayStr).length;
      });

      // Status breakdown
      const statusBreakdown = { completed: 0, preparing: 0, pending: 0, served: 0 };
      todayOrders.forEach((o) => {
        const status = o.status || 'pending';
        if (status in statusBreakdown) statusBreakdown[status]++;
      });

      // Calculate changes
      const yesterday = new Date(Date.now() - 86400000);
      const yesterdayOrders = orders.filter(
        (o) => new Date(o.created_at).toDateString() === yesterday.toDateString()
      );
      const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + parseAmt(o.total_amount), 0);
      const revenueChange = yesterdayRevenue > 0 
        ? ((revenueToday - yesterdayRevenue) / yesterdayRevenue) * 100 
        : 0;

      const ordersChange = yesterdayOrders.length > 0
        ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
        : 0;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        menuItems: menu.length,
        revenueToday,
        ordersToday: todayOrders.length,
        activeOrders: todayOrders.filter((o) =>
          ["pending", "preparing", "confirmed"].includes(o.status || '')
        ).length,
        completedOrders: todayOrders.filter((o) =>
          ["completed", "served"].includes(o.status || '')
        ).length,
        newUsersToday: users.filter((u) => isToday(u.created_at)).length,
        pendingReservations: reservations.filter((r) => r.status === "pending").length,
        revenueWeek,
        ordersWeek,
        statusBreakdown,
        topToday: calcTopItems(todayOrders),
        topAllTime: calcTopItems(orders),
        revenueChange: Math.round(revenueChange),
        ordersChange: Math.round(ordersChange),
        usersChange: 12,
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please refresh.");
    }
  };

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    await fetchAllData();
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  // Chart data
  const barData = {
    labels: weekdayLabels(),
    datasets: [
      {
        data: stats.revenueWeek,
        backgroundColor: weekdayLabels().map((_, i) =>
          i === 6 ? "#3B82F6" : "rgba(59,130,246,0.3)"
        ),
        borderRadius: 4,
      },
    ],
  };

  const lineData = {
    labels: weekdayLabels(),
    datasets: [
      {
        data: stats.ordersWeek,
        borderColor: "#22C55E",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#22C55E",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const statusKeys = Object.keys(stats.statusBreakdown);
  const doughnutData = {
    labels: statusKeys,
    datasets: [
      {
        data: Object.values(stats.statusBreakdown),
        backgroundColor: statusKeys.map((k) => STATUS_COLORS[k] || "#ccc"),
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const avgOrder = stats.ordersToday > 0 ? Math.round(stats.revenueToday / stats.ordersToday) : 0;
  const completionRate = stats.ordersToday > 0
    ? Math.round((stats.completedOrders / stats.ordersToday) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} size={14} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={fmtEtb(stats.totalRevenue)}
          sub={`${stats.revenueChange > 0 ? "+" : ""}${stats.revenueChange}% vs yesterday`}
          subVariant={stats.revenueChange > 0 ? "up" : "down"}
          icon={<FaWallet />}
        />
        <MetricCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          sub={`${stats.ordersChange > 0 ? "+" : ""}${stats.ordersChange}% vs yesterday`}
          subVariant={stats.ordersChange > 0 ? "up" : "down"}
          icon={<FaShoppingCart />}
        />
        <MetricCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.usersChange}% vs last month`}
          subVariant="up"
          icon={<FaUsers />}
        />
        <MetricCard
          label="Menu Items"
          value={stats.menuItems}
          sub="Active listings"
          icon={<FaUtensils />}
        />
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Today's Revenue"
          value={fmtEtb(stats.revenueToday)}
          sub={`From ${stats.ordersToday} orders`}
          icon={<FaFire />}
        />
        <MetricCard
          label="Active Orders"
          value={stats.activeOrders}
          sub="Pending & preparing"
          icon={<FaClock />}
        />
        <MetricCard
          label="New Users Today"
          value={stats.newUsersToday}
          sub="Registered today"
          icon={<FaUserPlus />}
        />
        <MetricCard
          label="Pending Reservations"
          value={stats.pendingReservations}
          sub="Awaiting confirmation"
          icon={<FaCalendarCheck />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue — Last 7 Days" icon={<FaChartLine />}>
          <div className="h-48">
            <Bar data={barData} options={barOptions} />
          </div>
        </Card>

        <Card title="Orders — Last 7 Days" icon={<FaChartPie />}>
          <div className="h-48">
            <Line data={lineData} options={lineOptions} />
          </div>
        </Card>
      </div>

      {/* Status & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Orders by Status — Today" icon={<FaChartPie />}>
          <div className="h-48 flex items-center justify-center">
            <div className="w-48 h-48">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {statusKeys.map((k) => (
              <span key={k} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ background: STATUS_COLORS[k] }}
                />
                {k.charAt(0).toUpperCase() + k.slice(1)}: {stats.statusBreakdown[k]}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Top Items Today" icon={<FaTrophy />}>
          <BarList items={stats.topToday} />
        </Card>
      </div>

      {/* Top Items All Time */}
      <Card title="Top Items All Time" icon={<FaCrown />}>
        <BarList items={stats.topAllTime} />
      </Card>

      {/* Performance */}
      <Card title="Today's Performance" icon={<FaChartLine />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-400">Avg Order Value</p>
            <p className="text-xl font-bold text-blue-500">{avgOrder} ETB</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Completion Rate</p>
            <p className={`text-xl font-bold ${completionRate > 70 ? 'text-green-500' : 'text-red-500'}`}>
              {completionRate}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Occupancy Rate</p>
            <p className="text-xl font-bold text-purple-500">65%</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickActionBtn
          icon="👥"
          label="Manage Users"
          onClick={() => window.location.href = "/admin/users"}
        />
        <QuickActionBtn
          icon="🍽️"
          label="Manage Menu"
          onClick={() => window.location.href = "/admin/menu"}
        />
        <QuickActionBtn
          icon="🛒"
          label="View Orders"
          onClick={() => window.location.href = "/admin/orders"}
        />
        <QuickActionBtn
          icon="📅"
          label="Reservations"
          onClick={() => window.location.href = "/admin/reservations"}
        />
      </div>
    </motion.div>
  );
}