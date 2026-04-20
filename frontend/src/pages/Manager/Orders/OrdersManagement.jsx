import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaSpinner as FaPreparing,
  FaUtensils,
  FaPhone,
  FaUser,
  FaSync,
  FaFilter,
  FaTimes
} from 'react-icons/fa';
import { fetchOrdersService, updateOrderStatusService } from '../../../service/orderservice';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });

  const statuses = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'orange' },
    { value: 'ready', label: 'Ready', color: 'green' },
    { value: 'served', label: 'Served', color: 'purple' }
  ];

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
    confirmed: 'bg-blue-500/20 text-blue-500 border-blue-500',
    preparing: 'bg-orange-500/20 text-orange-500 border-orange-500',
    ready: 'bg-green-500/20 text-green-500 border-green-500',
    served: 'bg-purple-500/20 text-purple-500 border-purple-500'
  };

  const statusIcons = {
    pending: <FaClock className="text-yellow-500" />,
    confirmed: <FaCheckCircle className="text-blue-500" />,
    preparing: <FaPreparing className="animate-spin text-orange-500" />,
    ready: <FaCheckCircle className="text-green-500" />,
    served: <FaUtensils className="text-purple-500" />
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toFixed(2)}`;
  };

  const parseAmount = (amount) => {
    if (amount === null || amount === undefined) return 0;
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? 0 : numAmount;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchOrdersService();
      
      let ordersArray = [];
      if (Array.isArray(response)) {
        ordersArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        ordersArray = response.data;
      } else if (response.orders && Array.isArray(response.orders)) {
        ordersArray = response.orders;
      }
      
      setOrders(ordersArray);
      applyFilters(ordersArray);
      calculateStats(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersArray) => {
    const total = ordersArray.length;
    const totalRevenue = ordersArray.reduce((sum, order) => sum + parseAmount(order.total_amount), 0);
    const avgOrderValue = total > 0 ? totalRevenue / total : 0;
    
    setStats({
      total,
      totalRevenue,
      avgOrderValue
    });
  };

  const filterByDate = (order, range, customDateValue = null) => {
    if (!order.created_at) return true;
    
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
        
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        return orderDate >= yearAgo;
        
      case 'custom':
        if (customDateValue) {
          const selectedDate = new Date(customDateValue);
          selectedDate.setHours(0, 0, 0, 0);
          const orderDateOnly = new Date(orderDate);
          orderDateOnly.setHours(0, 0, 0, 0);
          return orderDateOnly.getTime() === selectedDate.getTime();
        }
        return true;
        
      default:
        return true;
    }
  };

  const applyFilters = (ordersArray = orders) => {
    let filtered = [...ordersArray];
    
    filtered = filtered.filter(order => filterByDate(order, dateRange, customDate));
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone_number?.includes(searchTerm) ||
        order.id?.toString().includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters();
    calculateStats(orders);
  }, [searchTerm, statusFilter, dateRange, customDate]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusService(orderId, newStatus);
      await fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-500/20 text-gray-500'}`}>
        {statusIcons[status]}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getDateRangeLabel = () => {
    switch(dateRange) {
      case 'today': return 'Today\'s Orders';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'year': return 'Last 12 Months';
      case 'custom': return customDate ? `Orders for ${new Date(customDate).toLocaleDateString()}` : 'All Orders';
      default: return 'All Orders';
    }
  };

  const filteredTotalRevenue = filteredOrders.reduce((sum, order) => sum + parseAmount(order.total_amount), 0);

  return (
    <div className="bg-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Order Management</h1>
            <p className="text-text/50 text-sm mt-1">View and manage all customer orders</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-card text-text px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/10 transition-all border border-border"
            >
              <FaFilter size={14} className="text-primary" /> Filters
            </button>
            <button
              onClick={fetchOrders}
              className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/20 transition-all"
            >
              <FaSync size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/30 bg-card/50">
          <p className="text-text/60 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
          <p className="text-xs text-text/50 mt-1">{getDateRangeLabel()}</p>
        </div>
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl p-4 border border-primary/30 bg-card/50">
          <p className="text-text/60 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-text/50 mt-1">All orders</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/30 bg-card/50">
          <p className="text-text/60 text-sm">Average Order Value</p>
          <p className="text-2xl font-bold text-text">{formatCurrency(stats.avgOrderValue)}</p>
          <p className="text-xs text-text/50 mt-1">Per order</p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {statuses.filter(s => s.value !== 'all').map((status) => {
          const count = orders.filter(o => o.status === status.value).length;
          return (
            <div 
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`bg-card rounded-xl p-3 text-center border cursor-pointer transition-all ${
                statusFilter === status.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {statusIcons[status.value]}
                <span className="text-xs text-text/60">{status.label}</span>
              </div>
              <p className="text-xl font-bold text-text">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl border border-border p-4 mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-text font-semibold">Advanced Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-text/50 hover:text-text transition-all">
                <FaTimes size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Date Range</label>
                <div className="flex flex-wrap gap-2">
                  {['today', 'week', 'month', 'year'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setCustomDate('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                        dateRange === range && !customDate
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-text/70 hover:bg-gray-600'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                  <div className="relative">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setDateRange('custom');
                        setCustomDate(e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm bg-gray-700 text-text border border-border focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/50 text-sm" />
                  <input
                    type="text"
                    placeholder="Search by name, phone or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-border rounded-lg text-text focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateRange('today');
                  setCustomDate('');
                }}
                className="text-sm text-primary hover:text-primary/80 transition-all"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-card/30 rounded-2xl">
          <FaUtensils className="text-5xl text-text/40 mx-auto mb-4" />
          <p className="text-text/60 text-lg">No orders found for {getDateRangeLabel().toLowerCase()}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-text/60 text-sm">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <p className="text-text/60 text-sm">
              Total: {formatCurrency(filteredTotalRevenue)}
            </p>
          </div>

          <div className="overflow-x-auto bg-card rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-800/30">
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Table</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Items</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-text/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-border/50 hover:bg-primary/5 transition-all"
                  >
                    <td className="py-3 px-4 text-text font-mono text-sm">#{order.id}</td>
                    <td className="py-3 px-4 text-text">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-text/50 text-xs" />
                        <span>{order.customer_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text/80 text-sm">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-text/50 text-xs" />
                        <span>{order.phone_number}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text text-center">Table {order.table_number}</td>
                    <td className="py-3 px-4 text-text/80 text-sm">
                      {order.items?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-primary font-semibold">{formatCurrency(order.total_amount)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border bg-card ${statusColors[order.status] || ''}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="served">Served</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-text/60 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetails(true);
                        }}
                        className="p-1.5 text-primary hover:text-primary/80 transition-all"
                        title="View Details"
                      >
                        <FaEye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {showDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
            >
              <div className="sticky top-0 bg-card p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-text">Order Details</h2>
                  <button onClick={() => setShowDetails(false)} className="text-text/50 hover:text-text">✕</button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text/60 text-sm">Order ID</p>
                    <p className="text-text font-mono">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-text/60 text-sm">Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <p className="text-text/60 text-sm">Date & Time</p>
                    <p className="text-text text-sm">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-text/60 text-sm">Table Number</p>
                    <p className="text-text">Table {selectedOrder.table_number}</p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-text font-semibold mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-text/60 text-sm">Name</p>
                      <p className="text-text">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-text/60 text-sm">Phone</p>
                      <p className="text-text">{selectedOrder.phone_number}</p>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-3">
                      <p className="text-text/60 text-sm">Special Notes</p>
                      <p className="text-text text-sm bg-gray-700/50 p-2 rounded-lg mt-1">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-border pt-4">
                  <h3 className="text-text font-semibold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={`${selectedOrder.id}-item-${idx}`} className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="text-text text-sm font-medium">{item.name}</p>
                          <p className="text-text/60 text-xs">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-primary text-sm font-semibold">{formatCurrency(item.price_at_time)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                    <span className="text-text font-semibold">Total Amount</span>
                    <span className="text-primary text-xl font-bold">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-card p-6 border-t border-border">
                <button onClick={() => setShowDetails(false)} className="w-full py-2 border border-border rounded-lg text-text hover:bg-primary/10 transition-all">
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

export default OrdersManagement;