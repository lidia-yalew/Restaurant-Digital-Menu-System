import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFire,
  FaClipboardList,
  FaBox,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaUserCircle,
  FaCheckCircle,
  FaSpinner,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
  FaUtensils,
  FaExclamationTriangle,
  FaClock,
  FaShoppingCart,
  FaUserPlus
} from 'react-icons/fa';
import { useAuth } from '../../config/AuthContext';
import { logout as logoutAPI } from '../../API/authapi';
import { getOrdersAPI  } from '../../API/orderapi';
import { getMenuItems } from '../../API/menuapi';
import { getReservations } from '../../API/reservapi';

// ─────────────────────────────────────────────
// THEME HOOK
// ─────────────────────────────────────────────
const useTheme = () => {
  const [theme, setTheme] = useState('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = saved || (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    setIsLoaded(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  return { theme, toggleTheme, isLoaded };
};

// ─────────────────────────────────────────────
// NOTIFICATION HELPERS
// ─────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isWithinLastTwoDays(dateStr) {
  if (!dateStr) return false;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return diffMs >= 0 && diffMs <= 48 * 60 * 60 * 1000;
}

// Seen-IDs persistence
const SEEN_KEY = 'chef_seen_notification_ids';

function loadSeenIds() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenIds(idsSet) {
  try {
    const arr = Array.from(idsSet).slice(-500);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const Knav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isLoaded } = useTheme();

  // ── notification state ─────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const seenIdsRef = useRef(loadSeenIds());
  const notifRef = useRef(null);

  // ── build notification list ────────────────────────────────────────────
  const buildNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const candidates = [];

      // ── 1. New Orders (last 48h) ──────────────────────────────────────
      try {
        const ordersResponse = await getOrders();
        const orders = Array.isArray(ordersResponse)
          ? ordersResponse
          : ordersResponse?.data || ordersResponse?.orders || [];

        orders.forEach((o) => {
          if (o.created_at && isWithinLastTwoDays(o.created_at)) {
            // Check if order is pending or in progress
            const status = o.status || 'pending';
            const isNew = status === 'pending' || status === 'in-progress';
            
            candidates.push({
              id: `order-${o.id}`,
              type: isNew ? 'new_order' : 'order_update',
              icon: FaShoppingCart,
              color: isNew ? 'text-blue-500' : 'text-orange-500',
              bg: isNew ? 'bg-blue-500/10' : 'bg-orange-500/10',
              title: isNew ? `New order #${o.id}` : `Order #${o.id} updated`,
              detail: `${o.customer_name || 'Customer'} · ${o.items?.length || 0} items · ${status}`,
              time: timeAgo(o.created_at),
              eventDate: o.created_at,
              path: '/chef/orders',
            });
          }
        });
      } catch (err) {
        console.debug('Order notifications not available:', err.message);
      }

      // ── 2. Menu Items Out of Stock (last 48h) ─────────────────────────
      try {
        const menuResponse = await getMenuItems({ available: false, limit: 50 });
        const unavailable = Array.isArray(menuResponse)
          ? menuResponse
          : menuResponse?.data || menuResponse?.items || [];

        unavailable.forEach((item) => {
          if (item.updated_at && isWithinLastTwoDays(item.updated_at)) {
            candidates.push({
              id: `menu-unavailable-${item.id}`,
              type: 'menu',
              icon: FaUtensils,
              color: 'text-yellow-500',
              bg: 'bg-yellow-500/10',
              title: `"${item.name}" out of stock`,
              detail: 'Marked unavailable in kitchen',
              time: timeAgo(item.updated_at),
              eventDate: item.updated_at,
              path: '/chef/menu',
            });
          }
        });
      } catch (err) {
        console.error('Menu notifications error:', err);
      }

      // ── 3. New Reservations (last 48h) ────────────────────────────────
      try {
        const resResponse = await getReservations();
        const reservations = Array.isArray(resResponse)
          ? resResponse
          : resResponse?.data || resResponse?.reservations || [];

        reservations.forEach((r) => {
          if (r.created_at && isWithinLastTwoDays(r.created_at) && r.status === 'pending') {
            candidates.push({
              id: `res-new-${r.id}`,
              type: 'new_reservation',
              icon: FaClock,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10',
              title: `New reservation #${r.id}`,
              detail: `${r.customer_name} · ${r.guests || 0} guests`,
              time: timeAgo(r.created_at),
              eventDate: r.created_at,
              path: '/chef/dashboard',
            });
          }
        });
      } catch (err) {
        console.debug('Reservation notifications error:', err);
      }

      // ── Filter out already-seen items ─────────────────────────────────
      const unseen = candidates.filter(
        (n) => !seenIdsRef.current.has(n.id)
      );

      // Sort: newest first
      unseen.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

      setNotifications(unseen);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    buildNotifications();
    const interval = setInterval(buildNotifications, 60000);
    return () => clearInterval(interval);
  }, [buildNotifications]);

  // ── mark all as seen when chef opens the dropdown ──────────────────
  const handleOpenNotifications = () => {
    setShowNotifications((prev) => {
      if (!prev) {
        setTimeout(() => {
          const updated = new Set(seenIdsRef.current);
          notifications.forEach((n) => {
            updated.add(n.id);
          });
          seenIdsRef.current = updated;
          saveSeenIds(updated);
          setNotifications([]);
        }, 3000);
      }
      return !prev;
    });
  };

  // ── dismiss a single notification ────────────────────────────────────
  const handleDismiss = (e, notifId) => {
    e.stopPropagation();
    const updated = new Set(seenIdsRef.current);
    updated.add(notifId);
    seenIdsRef.current = updated;
    saveSeenIds(updated);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  // ── click notification → navigate + mark seen ──────────────────────
  const handleNotificationClick = (notif) => {
    const updated = new Set(seenIdsRef.current);
    updated.add(notif.id);
    seenIdsRef.current = updated;
    saveSeenIds(updated);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setShowNotifications(false);
    if (notif.path) navigate(notif.path);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── responsive sidebar ──────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const navigation = [
    { name: 'chef Dashboard', path: '/chef/dashboard', icon: FaFire },
    { name: 'Active Orders', path: '/chef/orders', icon: FaClipboardList },
    { name: 'Menu Items', path: '/chef/menu', icon: FaUtensils },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try { await logoutAPI(); } catch {}
    logout();
    navigate('/login');
  };

  const getUserName = () => user?.full_name || user?.username || 'Chef';
  const getUserRole = () => 'Kitchen Staff';

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-bg">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.length;

  return (
    <div className="flex h-screen bg-bg text-text">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Enhanced Coloring */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? -280 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className={`
              bg-gradient-to-b from-orange-900 via-orange-800 to-orange-900 
              shadow-2xl h-full fixed md:relative z-30
              transition-all duration-300 border-r border-orange-700/50
            `}
            style={{ width: sidebarOpen ? 280 : 80 }}
          >
            <div className="flex flex-col h-full">
              {/* Logo with gradient accent */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-orange-700/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <FaFire className="text-white text-lg" />
                  </div>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-bold text-lg bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent whitespace-nowrap"
                    >
                      chef station
                    </motion.span>
                  )}
                </div>
                {isMobile && sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-orange-700/50 rounded-lg transition-all md:hidden text-white"
                  >
                    <FaTimes size={18} />
                  </button>
                )}
                {!isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-orange-700/50 rounded-lg transition-all hidden md:block text-white/70 hover:text-white"
                  >
                    {sidebarOpen ? <FaChevronLeft size={18} /> : <FaChevronRight size={18} />}
                  </button>
                )}
              </div>

              {/* Navigation with improved coloring */}
              <nav className="flex-1 py-6 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200
                        ${active 
                          ? 'bg-gradient-to-r from-orange-500/30 to-orange-500/10 text-white shadow-lg shadow-orange-500/20 border border-orange-400/30' 
                          : 'text-orange-200/70 hover:text-white hover:bg-orange-700/30'
                        }
                      `}
                      title={!sidebarOpen ? item.name : ''}
                    >
                      <Icon 
                        size={20} 
                        className={`flex-shrink-0 ${active ? 'text-orange-400' : 'text-orange-300/70 group-hover:text-orange-300'}`} 
                      />
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`text-sm font-medium whitespace-nowrap ${active ? 'text-white' : 'text-orange-200/80'}`}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </Link>
                  );
                })}
              </nav>


              {/* Logout Button */}
              <div className="p-4 border-t border-orange-700/30">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                  title={!sidebarOpen ? 'Logout' : ''}
                >
                  <FaSignOutAlt size={20} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      Logout
                    </motion.span>
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card shadow-sm h-16 flex items-center justify-between px-4 md:px-6 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all text-text"
              >
                <FaBars size={20} />
              </button>
            )}
            <h1 className="text-lg md:text-xl font-semibold text-text truncate">
              {navigation.find((nav) => nav.path === location.pathname)?.name || 'chef Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme toggle */}
                       <button onClick={toggleTheme} className="relative p-2 rounded-lg transition-all">
                         <motion.span key={theme} initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                           exit={{ rotate: 180, opacity: 0 }} transition={{ duration: 0.3 }}>
                           {theme === 'light' ? <FaMoon className="text-text" /> : <FaSun className="text-yellow-500" />}
                         </motion.span>
                       </button>

            {/* ── Notification Bell ─────────────────────────────────────── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotifications}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all"
              >
                <FaBell className="text-text" size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[30rem] flex flex-col bg-card border border-border rounded-xl shadow-lg z-50"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                      <h3 className="text-sm font-semibold text-text">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1">
                      {loadingNotifications && unreadCount === 0 ? (
                        <div className="px-4 py-8 text-center text-text/50 text-sm">Loading…</div>
                      ) : unreadCount === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <FaCheckCircle className="mx-auto mb-2 text-green-500/60" size={28} />
                          <p className="text-text/60 text-sm font-medium">All caught up</p>
                          <p className="text-text/40 text-xs mt-1">No new notifications</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-border">
                          {notifications.map((notif) => {
                            const Icon = notif.icon;
                            return (
                              <li key={notif.id} className="group">
                                <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-all">
                                  {/* Icon */}
                                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${notif.bg}`}>
                                    <Icon className={notif.color} size={13} />
                                  </span>

                                  {/* Text - clickable */}
                                  <button
                                    className="flex-1 min-w-0 text-left"
                                    onClick={() => handleNotificationClick(notif)}
                                  >
                                    <p className="text-sm font-medium text-text leading-snug">{notif.title}</p>
                                    <p className="text-xs text-text/60 mt-0.5 leading-snug">{notif.detail}</p>
                                    <p className="text-[11px] text-text/40 mt-1">{notif.time}</p>
                                  </button>

                                  {/* Dismiss */}
                                  <button
                                    onClick={(e) => handleDismiss(e, notif.id)}
                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-text/30 hover:text-text/70 mt-0.5"
                                    title="Dismiss"
                                  >
                                    <FaTimes size={11} />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    {unreadCount > 0 && (
                      <div className="px-4 py-2 border-t border-border shrink-0">
                        <p className="text-[11px] text-text/40 text-center">
                          Notifications auto-clear after you view them · today &amp; yesterday only
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile - Clickable to profile page */}
            <button
              onClick={() => navigate('/chef/profile')}
              className="flex items-center gap-2 md:gap-3 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
              title="My Profile"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <FaUserCircle className="text-white" size={18} />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-text">{getUserName()}</p>
                <p className="text-xs text-text/70">{getUserRole()}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Knav;