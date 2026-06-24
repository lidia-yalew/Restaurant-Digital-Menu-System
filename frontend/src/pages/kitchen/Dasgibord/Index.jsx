import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaFire,
  FaUtensils,
  FaBell,
  FaHourglassHalf,
  FaCheckDouble,
  FaSync,
  FaArrowLeft,
  FaHome,
  FaCalendarDay
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchOrdersService, updateOrderStatusService } from '../../../service/orderservice';

const KitchenDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    conformed: 0,
    pending: 0,
    avgPrepTime: 0
  });

  // Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const orderDate = new Date(dateString);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchOrdersService();
      let ordersArray = Array.isArray(response) ? response : (response.data || response.orders || []);
      
      // Filter ONLY today's active orders
      const todayOrders = ordersArray.filter(order => isToday(order.created_at));
      const activeTodayOrders = todayOrders.filter(order => 
        ['pending', 'confirmed'].includes(order.status)
      );
      
      setOrders(activeTodayOrders);
      
      // Get latest 4 orders for the quick view section
      const sortedByTime = [...activeTodayOrders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setLatestOrders(sortedByTime.slice(0, 4));
      
      calculateStats(activeTodayOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersArray) => {
    const total = ordersArray.length;
    const conformed = ordersArray.filter(o => o.status === 'conformed').length;
    const pending = ordersArray.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    
    
    // Calculate average preparation time from items
    let totalPrepTime = 0;
    let itemCount = 0;
    ordersArray.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          totalPrepTime += item.preparation_time || 15;
          itemCount++;
        });
      }
    });
    const avgPrepTime = itemCount > 0 ? Math.round(totalPrepTime / itemCount) : 12;
    
    setStats({ totalOrders: total, conformed, pending, avgPrepTime });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusService(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const completeOrder = async (orderId) => {
    try {
      await updateOrderStatusService(orderId, 'served');
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    // Check for midnight reset
    const checkMidnight = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
      );
      const msUntilMidnight = night.getTime() - now.getTime();
      
      setTimeout(() => {
        fetchOrders(); // Refresh at midnight
        setInterval(() => {
          fetchOrders();
        }, 86400000); // 24 hours
      }, msUntilMidnight);
    };
    
    checkMidnight();
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'conformed': return <FaSpinner className="animate-spin text-blue-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      default: return <FaHourglassHalf className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'conformed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'border-l-4 border-yellow-500';
      case 'confirmed': return 'border-l-4 border-yellow-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateEstimatedTime = (order) => {
    if (!order.items || order.items.length === 0) return '10 min';
    let maxPrepTime = 0;
    order.items.forEach(item => {
      maxPrepTime = Math.max(maxPrepTime, item.preparation_time || 15);
    });
    return `${maxPrepTime} min`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className='bg-bg'>
      {/* Navigation Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-2">
              <FaCalendarDay className="text-primary" />
              Today's Orders Only - Resets at midnight
            </p>
          </div>
          <button 
            onClick={fetchOrders}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2"
          >
            <FaSync size={14} /> Refresh Orders
          </button>
        </div>
      </div>

      {/* Today's Date Banner */}
      <div className="bg-blue-50 rounded-xl p-3 mb-6 border border-blue-200">
        <div className="flex items-center gap-2 text-blue-700 text-sm">
          <FaCalendarDay />
          <span><strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> - Showing only today's active orders</span>
        </div>
      </div>

      {/* Stats Cards - Today's data only */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Active</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
            </div>
            <FaUtensils className="text-blue-500 text-3xl opacity-50" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Orders today</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
            </div>
            <FaClock className="text-yellow-500 text-3xl opacity-50" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Awaiting preparation</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">conformed</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.conformed}</h3>
            </div>
            <FaSpinner className="text-blue-500 text-3xl opacity-50 animate-spin" />
          </div>
          <p className="text-xs text-gray-400 mt-2">In kitchen</p>
        </div>
        
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Prep Time</p>
              <h3 className="text-2xl font-bold text-purple-600">{stats.avgPrepTime} min</h3>
            </div>
            <FaHourglassHalf className="text-purple-500 text-3xl opacity-50" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Per order today</p>
        </div>
      </div>

      {/* Latest Orders Section - 4 most recent */}
      {latestOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">📋 Latest Orders</h2>
            <button 
              onClick={() => navigate('/manager/active-orders')}
              className="text-primary text-sm hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${getOrderStatusColor(order.status)}`}
              >
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Order #{order.id}</span>
                    <span className="text-xs text-gray-500">Table {order.table_number}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{formatTime(order.created_at)}</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span className="text-xs capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="space-y-1">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{item.quantity}x {item.name}</span>
                        <span className="text-gray-500">${item.price_at_time}</span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                    )}
                  </div>
                  {order.status === 'ready' ? (
                    <button
                      onClick={() => completeOrder(order.id)}
                      className="w-full mt-3 bg-green-500 text-white py-1.5 rounded-lg text-xs hover:bg-green-600 transition-all"
                    >
                      Mark Served
                    </button>
                  ) : order.status === 'conformed' ? (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full mt-3 bg-green-500 text-white py-1.5 rounded-lg text-xs hover:bg-green-600 transition-all"
                    >
                      Mark Ready
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'conformed')}
                      className="w-full mt-3 bg-blue-500 text-white py-1.5 rounded-lg text-xs hover:bg-blue-600 transition-all"
                    >
                      Start conformed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Active Orders Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text">🍳 All Active Orders ({orders.length})</h2>
        </div>
        
        {orders.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">All Orders Completed!</h3>
            <p className="text-gray-500">Great job! No pending orders in the kitchen for today.</p>
            <button
              onClick={fetchOrders}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
            >
              Refresh Orders
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all ${getOrderStatusColor(order.status)}`}
                >
                  {/* Order Header */}
                  <div className={`p-4 border-b ${getStatusColor(order.status)}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                        <p className="text-sm text-gray-600">Table {order.table_number || 'N/A'}</p>
                        {order.customer_name && (
                          <p className="text-xs text-gray-500 mt-1">Customer: {order.customer_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium capitalize">{order.status}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Received: {formatTime(order.created_at)}</span>
                      <span>Est. Ready: {calculateEstimatedTime(order)}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Items ({order.items?.length || 0})</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{item.quantity}x</span>
                              <span className="text-gray-700">{item.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Prep time: {item.preparation_time || 15} min</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Special Notes */}
                    {order.notes && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-700">
                          <span className="font-semibold">📝 Note:</span> {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="p-4 bg-gray-50 border-t">
                    {order.status === 'ready' ? (
                      <button
                        onClick={() => completeOrder(order.id)}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheckDouble /> Mark as Served
                      </button>
                    ) : order.status === 'conformed' ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle /> Mark as Ready
                      </button>
                    ) : (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'conformed')}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <FaFire /> Start conformed
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Real-time Status */}
      <div className="mt-8 bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Real-time:</span> Kitchen is connected. Orders update automatically.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/manager/active-orders')}
              className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all"
            >
              View All Orders
            </button>
            <button
              onClick={fetchOrders}
              className="text-sm bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-all"
            >
              <FaSync size={12} className="inline mr-1" /> Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;