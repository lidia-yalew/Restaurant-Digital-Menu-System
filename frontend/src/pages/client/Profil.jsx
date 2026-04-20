import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaSpinner as FaPreparing,
  FaUtensils,
  FaTrash,
  FaEye,
  FaRegClock
} from 'react-icons/fa';
import { useAuth } from '../../config/AuthContext';
import { getProfile, updateProfile } from '../../API/authapi';
import { fetchOrdersService, deleteOrderService, getModificationTimeRemaining } from '../../service/orderservice';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
    confirmed: 'bg-blue-500/20 text-blue-500 border-blue-500',
    preparing: 'bg-orange-500/20 text-orange-500 border-orange-500',
    ready: 'bg-green-500/20 text-green-500 border-green-500',
    served: 'bg-purple-500/20 text-purple-500 border-purple-500',
    cancelled: 'bg-red-500/20 text-red-500 border-red-500'
  };

  const statusIcons = {
    pending: <FaClock className="text-yellow-500" />,
    confirmed: <FaCheckCircle className="text-blue-500" />,
    preparing: <FaPreparing className="animate-spin text-orange-500" />,
    ready: <FaCheckCircle className="text-green-500" />,
    served: <FaUtensils className="text-purple-500" />,
    cancelled: <FaTimes className="text-red-500" />
  };

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.user) {
        setFormData({
          full_name: response.user.full_name || user?.username || '',
          email: response.user.email || '',
          phone: response.user.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch user orders
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
      
      // Filter orders for current user (by phone number)
      const userOrders = ordersArray.filter(order => 
        order.phone_number === formData.phone || 
        order.customer_name === formData.full_name
      );
      setOrders(userOrders);
      setFilteredOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (formData.phone) {
      fetchOrders();
    }
  }, [formData.phone]);

  // Filter orders by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Cancel order (only if within 5 minutes)
  const handleCancelOrder = async (order) => {
    const timeRemaining = getModificationTimeRemaining(order.created_at);
    
    if (!timeRemaining.canModify) {
      alert(`Cannot cancel order after 5 minutes. Order was placed ${timeRemaining.minutesPassed} minutes ago.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to cancel order #${order.id}?`)) {
      try {
        await deleteOrderService(order.id);
        await fetchOrders();
        alert('Order cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${numAmount.toFixed(2)}`;
  };

  const getTimeRemaining = (createdAt) => {
    const timeRemaining = getModificationTimeRemaining(createdAt);
    if (timeRemaining.canModify) {
      return `${timeRemaining.minutesRemaining} min left to cancel`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-primary mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">Profile Information</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-primary hover:text-primary/80 transition-all"
                  >
                    <FaEdit size={18} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="text-green-500 hover:text-green-400 transition-all"
                    >
                      <FaSave size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }}
                      className="text-red-500 hover:text-red-400 transition-all"
                    >
                      <FaTimes size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text/60 mb-1">
                    <FaUser className="inline mr-2 text-primary" /> Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="text-text">{formData.full_name || user?.username || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text/60 mb-1">
                    <FaEnvelope className="inline mr-2 text-primary" /> Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="text-text">{formData.email || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text/60 mb-1">
                    <FaPhone className="inline mr-2 text-primary" /> Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="text-text">{formData.phone || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <button
                  onClick={logout}
                  className="w-full bg-red-500/20 text-red-500 py-2 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2 text-white">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-text">My Orders</h2>
                
                {/* Status Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      statusFilter === 'all'
                        ? 'bg-primary '
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${
                        statusFilter === status
                          ? 'bg-primary '
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-primary text-4xl" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                  <FaShoppingBag className="text-5xl text-text/30 mx-auto mb-4" />
                  <p className="text-text/60">No orders found</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="mt-4 text-primary hover:underline"
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 rounded-xl border border-border p-4 hover:border-primary/50 transition-all"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-primary font-mono font-bold">#{order.id}</span>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status] || ''}`}>
                              {statusIcons[order.status]}
                              <span className="capitalize">{order.status}</span>
                            </div>
                            {order.status === 'pending' && getTimeRemaining(order.created_at) && (
                              <span className="text-xs text-yellow-500 flex items-center gap-1">
                                <FaRegClock size={10} />
                                {getTimeRemaining(order.created_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-text/60 text-sm">{formatDate(order.created_at)}</p>
                          <p className="text-text mt-1">
                            {order.items?.length} item(s) - Table {order.table_number}
                          </p>
                          <p className="text-primary font-bold mt-1">{formatCurrency(order.total_amount)}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="px-3 py-1.5 text-blue-400 border border-blue-400 rounded-lg hover:bg-blue-400/10 transition-all text-sm"
                          >
                            <FaEye className="inline mr-1" size={12} /> Details
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="px-3 py-1.5 text-red-400 border border-red-400 rounded-lg hover:bg-red-400/10 transition-all text-sm"
                            >
                              <FaTrash className="inline mr-1" size={12} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
          >
            <div className="sticky top-0 bg-card p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-text">Order Details</h2>
                <button onClick={() => setShowOrderDetails(false)} className="text-text/50 hover:text-text">
                  ✕
                </button>
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
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedOrder.status] || ''}`}>
                    {statusIcons[selectedOrder.status]}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
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
                <h3 className="text-text font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg">
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

              {selectedOrder.notes && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-text font-semibold mb-2">Special Notes</h3>
                  <p className="text-text/80 text-sm bg-gray-700/50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-card p-6 border-t border-border">
              <button onClick={() => setShowOrderDetails(false)} className="w-full py-2 border border-border rounded-lg text-text hover:bg-primary/10 transition-all">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;