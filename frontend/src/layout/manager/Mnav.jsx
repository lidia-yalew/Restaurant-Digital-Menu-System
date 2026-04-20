import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaUtensils,
  FaShoppingCart,
  FaFileAlt,
  FaCalendarAlt,
  FaCog,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaUserCircle,
  FaChevronLeft,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { useAuth } from '../../config/AuthContext';
import { logout as logoutAPI } from '../../API/authapi';

// Custom hook for theme (matching your Nav component)
const useTheme = () => {
  const [theme, setTheme] = useState("light");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme = saved || (systemDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    setIsLoaded(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  return { theme, toggleTheme, isLoaded };
};

const Mnav = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isLoaded } = useTheme();

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navigation = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: FaHome },
    { name: 'Menu Management', path: '/manager/menu', icon: FaUtensils },
    { name: 'Order Management', path: '/manager/orders', icon: FaShoppingCart },
    { name: 'Reports', path: '/manager/reports', icon: FaFileAlt },
    { name: 'Reservations', path: '/manager/reservations', icon: FaCalendarAlt },
    { name: 'Customers', path: '/manager/customers', icon: FaUsers },
    { name: 'Settings', path: '/manager/settings', icon: FaCog },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logoutAPI();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const getUserName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return 'Manager';
  };

  const getUserRole = () => {
    if (user?.role) return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    return 'Manager';
  };

  // Don't render until theme is loaded
  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-bg">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      </div>
    );
  }

  // Overlay for mobile
  const MobileOverlay = () => (
    <AnimatePresence>
      {sidebarOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
        />
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-screen bg-bg text-text">
      {/* Mobile Overlay */}
      <MobileOverlay />

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial={{ x: isMobile ? -280 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className={`
              bg-card shadow-lg h-full fixed md:relative z-30 transition-all duration-300 border-r border-border
              ${sidebarOpen ? 'w-64' : 'w-20'}
            `}
            style={{ width: sidebarOpen ? 280 : 80 }}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-button">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-bold text-lg text-text whitespace-nowrap"
                    >
                      <h1 className="font-serif italic text-md font-bold text-primary">
                        Restaurants Manager
                      </h1>
                    </motion.span>
                  )}
                </div>
                {/* Close button on mobile */}
                {isMobile && sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all md:hidden text-text"
                  >
                    <FaTimes size={18} />
                  </button>
                )}
                {/* Toggle button on desktop */}
                {!isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hidden md:block text-text"
                  >
                    {sidebarOpen ? 
                      <FaChevronLeft size={18} /> : 
                      <FaBars size={18} />
                    }
                  </button>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-6 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all
                        ${active 
                          ? 'bg-primary text-white shadow-button' 
                          : 'text-text hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                      title={!sidebarOpen ? item.name : ''}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card shadow-sm h-16 flex items-center justify-between px-4 md:px-6 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all md:hidden text-text"
            >
              <FaBars size={20} />
            </button>
            
            <h1 className="text-lg md:text-xl font-semibold text-text truncate">
              {navigation.find(nav => nav.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <motion.span
                key={theme}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-base"
              >
                {theme === 'light' ? <FaMoon className="text-text" /> : <FaSun className="text-yellow-500" />}
              </motion.span>
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
              <FaBell className="text-text" size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-button">
                <FaUserCircle className="text-white" size={18} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-text">{getUserName()}</p>
                <p className="text-xs text-text/70">{getUserRole()}</p>
              </div>
            </div>
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

export default Mnav;