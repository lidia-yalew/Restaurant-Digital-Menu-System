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
  FaEye,
  FaPrint,
  FaUserCheck,
  FaCrown,
  FaUserShield,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchOrdersService, updateOrderStatusService } from '../../service/orderservice';
import { useAuth } from '../../config/AuthContext';

const ActiveOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || 'customer';
  
  // Role-based permissions
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isChef = userRole === 'kitchen';
  const isStaff = userRole === 'staff';
  
  const canViewAllOrders = isAdmin || isManager;
  const canUpdateStatus = isAdmin || isManager || isChef;
  const canCancelOrder = isAdmin || isManager;
  const canPrintOrder = isAdmin || isManager || isChef || isStaff;
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dateRange, setDateRange] = useState('today'); // today, week, month
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Stats for today only
  const [stats, setStats] = useState({
    totalActive: 0,
    pending: 0,
    Conformed: 0,
  });

  const statuses = [
    { value: 'all', label: 'All Active', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow', action: 'Start Preparing' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue', action: 'Start Preparing' },
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today', icon: <FaCalendarDay size={14} /> },
    { value: 'week', label: 'This Week', icon: <FaCalendarWeek size={14} /> },
    { value: 'month', label: 'This Month', icon: <FaCalendarAlt size={14} /> }
  ];

  // Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const orderDate = new Date(dateString);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  };

  // Filter orders by date
  const filterByDate = (order, range, customDateValue = null) => {
    if (!order.created_at) return false;
    
    const orderDate = new Date(order.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(range) {
      case 'today':
        const orderDateOnly = new Date(orderDate);
        orderDateOnly.setHours(0, 0, 0, 0);
        return orderDateOnly.getTime() === today.getTime();
        
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return orderDate >= weekAgo;
        
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return orderDate >= monthAgo;
        
      default:
        return true;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchOrdersService();
      let ordersArray = Array.isArray(response) ? response : (response.data || response.orders || []);
      
      // Get today's orders first
      const todayOrders = ordersArray.filter(order => isToday(order.created_at));
      const activeTodayOrders = todayOrders.filter(order => 
        ['pending', 'confirmed',].includes(order.status)
      );
      
      setOrders(activeTodayOrders);
      applyFilters(activeTodayOrders);
      calculateStats(activeTodayOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // For date range filtering (when manager wants to see historical data)
  const fetchOrdersByDateRange = async (range, custom = null) => {
    setLoading(true);
    try {
      const response = await fetchOrdersService();
      let ordersArray = Array.isArray(response) ? response : (response.data || response.orders || []);
      
      let filteredByDate = ordersArray.filter(order => filterByDate(order, range, custom));
      let activeFiltered = filteredByDate.filter(order => 
        ['pending', 'confirmed'].includes(order.status)
      );
      
      setOrders(activeFiltered);
      applyFilters(activeFiltered);
      calculateStats(activeFiltered);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersArray) => {
    const total = ordersArray.length;
    const pending = ordersArray.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    const Conformed = ordersArray.filter(o => o.status === 'Conformed').length;
    
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
    const avgPrepTime = itemCount > 0 ? Math.round(totalPrepTime / itemCount) : 15;
    
    setStats({ totalActive: total, pending, Conformed});
  };

  const applyFilters = (ordersArray = orders) => {
    let filtered = [...ordersArray];
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toString().includes(searchTerm) ||
        order.table_number?.toString().includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range === 'today') {
      fetchOrders(); // Today's orders only
    } else {
      fetchOrdersByDateRange(range);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, orders]);

  useEffect(() => {
    fetchOrders(); // Initial load - today's orders only
    
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
        // Set up next midnight check
        setInterval(() => {
          fetchOrders();
        }, 86400000); // 24 hours
      }, msUntilMidnight);
    };
    
    checkMidnight();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      if (dateRange === 'today') {
        fetchOrders();
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!canUpdateStatus) {
      alert('You do not have permission to update order status');
      return;
    }
    
    try {
      await updateOrderStatusService(orderId, newStatus);
      if (dateRange === 'today') {
        fetchOrders();
      } else {
        fetchOrdersByDateRange(dateRange);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!canCancelOrder) {
      alert('You do not have permission to cancel orders');
      return;
    }
    
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await updateOrderStatusService(orderId, 'cancelled');
        if (dateRange === 'today') {
          fetchOrders();
        } else {
          fetchOrdersByDateRange(dateRange);
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order');
      }
    }
  };

  const printOrder = (order) => {
    if (!canPrintOrder) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Order #${order.id}</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h1>Order #${order.id}</h1>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><strong>Table:</strong> ${order.table_number}</p>
          <p><strong>Customer:</strong> ${order.customer_name}</p>
          <p><strong>Time:</strong> ${new Date(order.created_at).toLocaleTimeString()}</p>
          <h2>Items:</h2>
          <ul>
            ${order.items?.map(item => `<li>${item.quantity}x ${item.name} - $${item.price_at_time}</li>`).join('')}
          </ul>
          <h3>Total: $${order.total_amount}</h3>
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Conformed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Conformed': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      default: return <FaHourglassHalf className="text-gray-500" />;
    }
  };

  const getNextAction = (status) => {
    switch(status) {
      case 'pending':
      case 'confirmed':
        return { text: 'Start Preparing', nextStatus: 'preparing', color: 'bg-blue-500' };
      default:
        return null;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateRangeLabel = () => {
    switch(dateRange) {
      case 'today': return "Today's Orders";
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      default: return 'Active Orders';
    }
  };

  const RoleBadge = () => {
    if (isAdmin) return <div className="flex items-center gap-1 text-purple-600 text-sm"><FaCrown /> Admin</div>;
    if (isManager) return <div className="flex items-center gap-1 text-blue-600 text-sm"><FaUserShield /> Manager</div>;
    if (isChef) return <div className="flex items-center gap-1 text-orange-600 text-sm"><FaFire /> Kitchen</div>;
    if (isStaff) return <div className="flex items-center gap-1 text-green-600 text-sm"><FaUserCheck /> Staff</div>;
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text">Active Orders</h1>
            <p className="text-gray-500 text-sm mt-1">
              {dateRange === 'today' ? '📅 Today\'s orders only - Resets at midnight' : `📊 ${getDateRangeLabel()}`}
            </p>
          </div>
          <div className="flex gap-2">
           
            <button 
              onClick={() => dateRange === 'today' ? fetchOrders() : fetchOrdersByDateRange(dateRange)}
              className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2 text-sm"
            >
              <FaSync size={12} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Based on selected date range */}
      <div className="grid grid-cols-3  gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">{dateRange === 'today' ? "Today's Active" : "Total Active"}</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalActive}</h3>
          {dateRange === 'today' && <p className="text-xs text-gray-400 mt-1">Resets at midnight</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Conformed</p>
          <h3 className="text-2xl font-bold text-green-600">{stats.Conformed}</h3>
        </div>
       
      </div>

      {/* Midnight Reset Info Banner */}
      {dateRange === 'today' && (
        <div className="bg-blue-50 rounded-xl p-3 mb-6 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <FaClock />
            <span>Showing only <strong>today's orders</strong>. Active orders reset at midnight. Use date filters to view historical data.</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm ${
                  statusFilter === status.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
            
          </div>
          <div className="flex-1 min-w-[20px] text-text">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order #, customer or table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary   bg-card"
              />
            </div>
          </div>
          
        </div>
      </div>

      {/* Orders Grid */}
      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Orders!</h3>
          <p className="text-gray-500">All orders for {getDateRangeLabel().toLowerCase()} have been completed.</p>
          {dateRange !== 'today' && (
            <button
              onClick={() => handleDateRangeChange('today')}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              View Today's Orders
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders for {getDateRangeLabel().toLowerCase()}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredOrders.map((order, index) => {
                const nextAction = getNextAction(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                  >
                    {/* Order Header */}
                    <div className={`p-4 border-b ${getStatusColor(order.status)}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                            <span className="text-xs text-gray-400">Table {order.table_number}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{order.customer_name || 'Guest'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium capitalize">{order.status}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Received: {formatTime(order.created_at)}</span>
                        <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <div className="space-y-2">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.name}</span>
                            <span className="text-gray-500">${item.price_at_time}</span>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                        )}
                      </div>
                      
                      {order.notes && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-700">📝 {order.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <FaEye size={14} /> View
                        </button>
                        
                        {canPrintOrder && (
                          <button
                            onClick={() => printOrder(order)}
                            className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-all"
                            title="Print Order"
                          >
                            <FaPrint size={14} />
                          </button>
                        )}
                        
                        {canCancelOrder && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all"
                            title="Cancel Order"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      {nextAction && canUpdateStatus && (
                        <button
                          onClick={() => updateOrderStatus(order.id, nextAction.nextStatus)}
                          className={`w-full mt-2 ${nextAction.color} text-white py-2 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm`}
                        >
                          {nextAction.text === 'Start Preparing' && <FaFire size={14} />}
                          {nextAction.text === 'Mark Conformed' && <FaCheckCircle size={14} />}
                          {nextAction.text === 'Mark Served' && <FaCheckDouble size={14} />}
                          {nextAction.text}
                        </button>
                      )}
                      
                      {!canUpdateStatus && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                          <FaEye className="inline mr-1" size={12} />
                          View only mode
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Order Details Modal - Same as before */}
      <AnimatePresence>
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                  <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Order ID</p>
                    <p className="text-lg font-bold text-primary">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="text-gray-800">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Table Number</p>
                    <p className="text-gray-800">Table {selectedOrder.table_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Customer</p>
                    <p className="text-gray-800">{selectedOrder.customer_name || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Order Time</p>
                    <p className="text-gray-800">{formatTime(selectedOrder.created_at)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-gray-800 font-medium">{item.name}</p>
                          <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-primary font-semibold">${item.price_at_time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <span className="font-semibold text-gray-800">Total Amount</span>
                    <span className="text-primary text-xl font-bold">${selectedOrder.total_amount}</span>
                  </div>
                </div>
                
                {selectedOrder.notes && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Special Notes</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="sticky bottom-0 bg-white p-6 border-t">
                <button onClick={() => setShowDetails(false)} className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveOrdersPage;