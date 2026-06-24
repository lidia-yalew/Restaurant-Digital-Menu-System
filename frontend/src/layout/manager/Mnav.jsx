import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome, FaUtensils, FaShoppingCart, FaFileAlt, FaCalendarAlt,
  FaCog, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaBell,
  FaUserCircle, FaChevronLeft, FaMoon, FaSun,
  FaExclamationTriangle, FaBan, FaUtensilSpoon, FaCheckCircle, FaClock,
} from 'react-icons/fa';
import { useAuth } from '../../config/AuthContext';
import { logout as logoutAPI } from '../../API/authapi';
import { getReservations } from '../../API/reservapi';
import { getMenuItems } from '../../API/menuapi';

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
function getEthiopianNow() {
  const et = new Date(Date.now() + 3 * 60 * 60 * 1000);
  return {
    todayStr: et.toISOString().split('T')[0],
    currentMinutes: et.getUTCHours() * 60 + et.getUTCMinutes(),
  };
}

function parseEthiopianTimeToMinutes(str) {
  if (!str) return 0;
  const m = str.match(/(\d+):(\d+)\s+(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const mod = m[3].toUpperCase();
  if (mod === 'PM' && h !== 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
  return (h * 60 + min + 6 * 60) % (24 * 60);
}

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

// Only surface events from the last 48 hours (today + yesterday)
function isWithinLastTwoDays(dateStr) {
  if (!dateStr) return false;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return diffMs >= 0 && diffMs <= 48 * 60 * 60 * 1000;
}

// ── Seen-IDs persistence ───────────────────────────────────────────────────
const SEEN_KEY = 'manager_seen_notification_ids';

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
    // Keep last 500 to avoid unbounded growth
    const arr = Array.from(idsSet).slice(-500);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
const Mnav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isLoaded } = useTheme();

  // ── notification state ─────────────────────────────────────────────────
  const [notifications, setNotifications]   = useState([]);   // only UNSEEN items
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  // seenIds lives in a ref so buildNotifications always reads latest without re-subscribing
  const seenIdsRef = useRef(loadSeenIds());
  const notifRef   = useRef(null);

  // ── build notification list ────────────────────────────────────────────
  const buildNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const candidates = [];
      const { todayStr, currentMinutes } = getEthiopianNow();

      // ── Reservations ──────────────────────────────────────────────────
      try {
        const resResponse = await getReservations();
        const reservations = Array.isArray(resResponse)
          ? resResponse
          : resResponse.data || resResponse.reservations || [];

        reservations.forEach((r) => {
          const resDate = r.reservation_date?.split('T')[0];

          // 1. Pending expiring within 15 min today — always "new" while active
          if (r.status === 'pending' && resDate === todayStr) {
            const t = r.original_time_ethiopian || r.reservation_time;
            const deadline = parseEthiopianTimeToMinutes(t) - 30;
            const left = deadline - currentMinutes;
            if (left > 0 && left <= 15) {
              candidates.push({
                id: `res-expiring-${r.id}`,
                type: 'expiring',
                icon: FaExclamationTriangle,
                color: 'text-orange-500',
                bg: 'bg-orange-500/10',
                title: `Reservation #${r.id} expiring soon`,
                detail: `${r.customer_name} · ${left}m left to confirm`,
                time: timeAgo(r.created_at),
                eventDate: new Date().toISOString(), // recomputed each poll
              });
            }
          }

          // 2. Cancelled by customer — within last 48h
          if (
            r.status === 'cancelled' &&
            r.cancelled_by === 'customer' &&
            isWithinLastTwoDays(r.updated_at || r.created_at)
          ) {
            candidates.push({
              id: `res-cancelled-${r.id}`,
              type: 'cancelled',
              icon: FaBan,
              color: 'text-red-500',
              bg: 'bg-red-500/10',
              title: `Reservation #${r.id} cancelled by customer`,
              detail: `${r.customer_name} cancelled their booking`,
              time: timeAgo(r.updated_at || r.created_at),
              eventDate: r.updated_at || r.created_at,
            });
          }

          // 3. Auto-expired — within last 48h
          if (
            (r.status === 'expired' || (r.status === 'cancelled' && r.cancelled_by === 'system')) &&
            isWithinLastTwoDays(r.updated_at || r.created_at)
          ) {
            candidates.push({
              id: `res-expired-${r.id}`,
              type: 'expired',
              icon: FaClock,
              color: 'text-gray-400',
              bg: 'bg-gray-500/10',
              title: `Reservation #${r.id} auto-expired`,
              detail: `${r.customer_name} · confirmation deadline passed`,
              time: timeAgo(r.updated_at || r.created_at),
              eventDate: r.updated_at || r.created_at,
            });
          }
        });
      } catch (err) {
        console.error('Reservation notifications error:', err);
      }

      // ── Menu: chef-marked out-of-stock within last 48h ─────────────────
      try {
        const menuResponse = await getMenuItems({ available: false, limit: 50 });
        const unavailable = Array.isArray(menuResponse)
          ? menuResponse
          : menuResponse.data || menuResponse.items || [];

        unavailable.forEach((item) => {
          if (!isWithinLastTwoDays(item.updated_at)) return;
          candidates.push({
            id: `menu-unavailable-${item.id}`,
            type: 'menu',
            icon: FaUtensilSpoon,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            title: `"${item.name}" marked out of stock`,
            detail: 'Chef update · hidden from customers',
            time: timeAgo(item.updated_at),
            eventDate: item.updated_at,
          });
        });
      } catch (err) {
        console.error('Menu notifications error:', err);
      }

      // ── Filter out already-seen items ─────────────────────────────────
      // "expiring" are ephemeral — never persist as seen (they disappear
      // naturally once the deadline passes)
      const unseen = candidates.filter(
        (n) => n.type === 'expiring' || !seenIdsRef.current.has(n.id)
      );

      // Sort: urgent first
      const order = { expiring: 0, cancelled: 1, menu: 2, expired: 3 };
      unseen.sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9));

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

  // ── mark all as seen when manager opens the dropdown ──────────────────
  const handleOpenNotifications = () => {
    setShowNotifications((prev) => {
      if (!prev) {
        // Opening: schedule mark-as-seen after a short delay so the
        // manager actually has a moment to glance at the list
        setTimeout(() => {
          const updated = new Set(seenIdsRef.current);
          notifications.forEach((n) => {
            if (n.type !== 'expiring') updated.add(n.id); // expiring stays live
          });
          seenIdsRef.current = updated;
          saveSeenIds(updated);
          // Re-filter so badge count drops immediately after they look
          setNotifications((prev) => prev.filter((n) => n.type === 'expiring'));
        }, 3000); // 3 seconds — enough time to read
      }
      return !prev;
    });
  };

  // ── dismiss a single notification manually ────────────────────────────
  const handleDismiss = (e, notifId, notifType) => {
    e.stopPropagation();
    if (notifType !== 'expiring') {
      const updated = new Set(seenIdsRef.current);
      updated.add(notifId);
      seenIdsRef.current = updated;
      saveSeenIds(updated);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  };

  // ── click notification row → navigate + mark seen ─────────────────────
  const handleNotificationClick = (notif) => {
    if (notif.type !== 'expiring') {
      const updated = new Set(seenIdsRef.current);
      updated.add(notif.id);
      seenIdsRef.current = updated;
      saveSeenIds(updated);
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }
    setShowNotifications(false);
    navigate('/manager/reservations');
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

  // ── mobile / sidebar ──────────────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const navigation = [
    { name: 'Dashboard',       path: '/manager/dashboard',   icon: FaHome },
    { name: 'Menu Management', path: '/manager/menu',        icon: FaUtensils },
    { name: 'Order Management',path: '/manager/orders',      icon: FaShoppingCart },
    { name: 'Reports',         path: '/manager/reports',     icon: FaFileAlt },
    { name: 'Reservations',    path: '/manager/reservations',icon: FaCalendarAlt },
    { name: 'feedbacks',       path: '/manager/feedback',   icon: FaUsers },
    { name: 'chat',       path: '/manager/chat',   icon: FaUsers },
    { name: 'Settings',        path: '/manager/settings',    icon: FaCog },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try { await logoutAPI(); } catch {}
    logout();
    navigate('/login');
  };

  const getUserName = () => user?.full_name || user?.username || 'Manager';
  const getUserRole = () => user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Manager';

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

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial={{ x: isMobile ? -280 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="bg-card shadow-lg h-full fixed md:relative z-30 border-r border-border"
            style={{ width: sidebarOpen ? 280 : 80 }}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  {sidebarOpen && (
                    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="font-serif italic text-md font-bold text-primary whitespace-nowrap">
                      Restaurants Manager
                    </motion.h1>
                  )}
                </div>
                {isMobile && sidebarOpen && (
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-text md:hidden">
                    <FaTimes size={18} />
                  </button>
                )}
                {!isMobile && (
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-text hidden md:block">
                    {sidebarOpen ? <FaChevronLeft size={18} /> : <FaBars size={18} />}
                  </button>
                )}
              </div>

              {/* Nav links */}
              <nav className="flex-1 py-6 overflow-y-auto">
                {navigation.map(({ name, path, icon: Icon }) => (
                  <Link key={path} to={path} title={!sidebarOpen ? name : ''}
                    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                      isActive(path) ? 'bg-primary text-white shadow-button' : 'text-text hover:bg-gray-500 dark:hover:bg-gray-100'
                    }`}>
                    <Icon size={20} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap">{name}</motion.span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-border">
                <button onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <FaSignOutAlt size={20} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap">Logout</motion.span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card shadow-sm h-16 flex items-center justify-between px-4 md:px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg transition-all md:hidden text-text">
              <FaBars size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-text truncate">
              {navigation.find((n) => n.path === location.pathname)?.name || 'Dashboard'}
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

            {/* ── Bell + dropdown ─────────────────────────────────────────── */}
            <div className="relative" ref={notifRef}>
              <button onClick={handleOpenNotifications}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                <FaBell className="text-text" size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
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
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} unread
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
                          <p className="text-text/60 text-sm font-medium">You're all caught up</p>
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

                                  {/* Text — clickable area navigates */}
                                  <button className="flex-1 min-w-0 text-left"
                                    onClick={() => handleNotificationClick(notif)}>
                                    <p className="text-sm font-medium text-text leading-snug">{notif.title}</p>
                                    <p className="text-xs text-text/60 mt-0.5 leading-snug">{notif.detail}</p>
                                    <p className="text-[11px] text-text/40 mt-1">{notif.time}</p>
                                  </button>

                                  {/* Dismiss × */}
                                  <button
                                    onClick={(e) => handleDismiss(e, notif.id, notif.type)}
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

                    {/* Footer hint */}
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

            {/* User profile */}
            {/* User profile — click to view/edit personal profile */}
            <button
              onClick={() => navigate('/manager/profile')}
              className="flex items-center gap-2 md:gap-3 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              title="My Profile"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Mnav;
