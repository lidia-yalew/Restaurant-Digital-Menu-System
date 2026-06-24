import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaEdit, FaSave, FaTimes, FaSpinner,
  FaShoppingBag, FaClock, FaCheckCircle,
  FaSpinner as FaPreparing, FaUtensils, FaTrash,
  FaEye, FaRegClock, FaCalendarCheck,
  FaClock as FaClockIcon, FaPhone, FaEnvelope,
  FaCalendarAlt, FaUsers, FaPencilAlt, FaBan, FaLock,FaCamera 
} from 'react-icons/fa';
import { useAuth } from '../../config/AuthContext';
import { fetchOrdersService, deleteOrderService, getModificationTimeRemaining } from '../../service/orderservice';
import { getReservations, updateReservation , deleteReservation, updateReservationStatus } from '../../API/reservapi';


function parseEthiopianTimeToWesternMinutes(ethiopianTimeStr) {
  if (!ethiopianTimeStr) return 0;
  const match = ethiopianTimeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const modifier = match[3].toUpperCase();
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return ((hours * 60 + minutes) + 360) % 1440; // +6h, wrap at 24h
}

function getReservationWindowStatus(reservation) {
  // Returns { canEdit, canCancel, minutesUntilReservation, editClosesIn, cancelClosesIn }
  const now = new Date();
  const utc3Now = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const todayStr = utc3Now.toISOString().split('T')[0];
  const currentWesternMinutes = utc3Now.getUTCHours() * 60 + utc3Now.getUTCMinutes();

  const resDate = reservation.reservation_date?.split('T')[0];
  if (!resDate) return { canEdit: false, canCancel: false };

  

  const ethiopianTime = reservation.original_time_ethiopian || reservation.reservation_time;
  const reservationWesternMinutes = parseEthiopianTimeToWesternMinutes(ethiopianTime);

  let minutesUntilReservation;
  if (resDate > todayStr) {
    // Future date: calculate days difference + time
    const daysAhead = Math.floor(
      (new Date(resDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
    );
    minutesUntilReservation = daysAhead * 1440 + (reservationWesternMinutes - currentWesternMinutes);
  } else if (resDate === todayStr) {
    minutesUntilReservation = reservationWesternMinutes - currentWesternMinutes;
  } else {
    minutesUntilReservation = -1; // past
  }

  const canEdit   = minutesUntilReservation > 180; // >3 hours
  const canCancel = minutesUntilReservation > 60;  // >1 hour

  const editClosesIn   = canEdit   ? minutesUntilReservation - 180 : 0;
  const cancelClosesIn = canCancel ? minutesUntilReservation - 60  : 0;

  return { canEdit, canCancel, minutesUntilReservation, editClosesIn, cancelClosesIn };
}

function formatMinutes(mins) {
  if (mins <= 0) return '0 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Ethiopian time slots for the edit modal (matching your reservation form)
const ETHIOPIAN_TIME_SLOTS = [
  '2:30 AM','3:00 AM','3:30 AM',
  '4:00 AM','4:30 AM','5:00 AM','5:30 AM','6:00 AM','6:30 AM',
  '7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM',
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM',
  '1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '',profile_image: ''  });
  const [showAllOrders, setShowAllOrders] = useState(false);
const [showAllReservations, setShowAllReservations] = useState(false);
const [openDropdown, setOpenDropdown] = useState(null); 


  // Reservation states
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
 


  // Edit reservation modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [editForm, setEditForm] = useState({ reservation_date: '', reservation_time: '', guests: 2 });
  const [editLoading, setEditLoading] = useState(false);

  // Cancel confirmation
  const [cancellingId, setCancellingId] = useState(null);
const [orderDateFilter, setOrderDateFilter] = useState('all');
const [reservationDateFilter, setReservationDateFilter] = useState('all');
const [orderCustomDate, setOrderCustomDate] = useState('');
const [reservationCustomDate, setReservationCustomDate] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [reservationStatusFilter, setReservationStatusFilter] = useState('all');
const isWithinDateFilter = (dateString, filter, customDate = '') => {
  const date = new Date(dateString);
  const now = new Date();
  if (filter === 'today') {
    return date.toDateString() === now.toDateString();
  }
  if (filter === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return date >= weekAgo && date <= now;
  }
  if (filter === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (filter === 'custom' && customDate) {
    return date.toDateString() === new Date(customDate).toDateString();
  }
  return true; // 'all'
};

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
function getEthiopianNow() {
  const ethiopianNow = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));
  const todayStr = ethiopianNow.toISOString().split('T')[0];
  const currentMinutes = ethiopianNow.getUTCHours() * 60 + ethiopianNow.getUTCMinutes();
  return { todayStr, currentMinutes };
}
useEffect(() => {
  if (user) {
    setFormData({
      full_name: user.full_name || user.username || '',
      phone: user.phone || '',
      email: user.email || '',
      profile_image: user.profile_image || '',
    });
  }
}, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetchOrdersService();
      let ordersArray = Array.isArray(response) ? response
        : response.data ? response.data
        : response.orders ? response.orders : [];
      const userOrders = ordersArray.filter(order =>
        (user?.id && order.user_id === user.id) ||
        (user?.username && order.customer_name === user.username) ||
        (formData.full_name && order.customer_name === formData.full_name)
      );
      setOrders(userOrders);
      setFilteredOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    setReservationsLoading(true);
    try {
      const response = await getReservations();
      let reservationsArray = Array.isArray(response) ? response
        : response.data ? response.data : [];
      const userReservations = reservationsArray.filter(res =>
        res.phone_number === user?.phone ||
        res.customer_name === user?.full_name ||
        res.customer_name === user?.username
      );
      setReservations(userReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setReservationsLoading(false);
    }
  };

  useEffect(() => {
    if (user) { fetchOrders(); fetchReservations(); }
  }, [user]);

// Orders filtered by date first, then status
useEffect(() => {
  let result = orders.filter(o => isWithinDateFilter(o.created_at, orderDateFilter, orderCustomDate));
  if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
  setFilteredOrders(result);
}, [statusFilter, orderDateFilter, orderCustomDate, orders]);

// Reservations filtered by date first, then status
const filteredReservations = reservations.filter(res => {
  const dateMatch = isWithinDateFilter(res.reservation_date, reservationDateFilter, reservationCustomDate);
  const statusMatch = reservationStatusFilter === 'all' || res.status === reservationStatusFilter;
  return dateMatch && statusMatch;
});

const handleUpdateProfile = async () => {
  setLoading(true);
  try {
    const { updateProfile } = await import('../../API/authapi');

    const response = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      profile_image: formData.profile_image || null,  // ← ADD THIS
    });

    if (response.success) {
      const updatedUser = { ...user, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Also update auth context so UI refreshes immediately
      if (window.updateAuthUser) window.updateAuthUser(updatedUser);
      setEditing(false);
      alert('Profile updated successfully!');
    }
  } catch (error) {
    alert('Failed to update profile: ' + error.message);
  } finally {
    setLoading(false);
  }
};

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
        alert('Failed to cancel order');
      }
    }
  };

  // ── Reservation: Cancel ──────────────────────────────────────────────────
  const handleCancelReservation = async (res) => {
    const { canCancel } = getReservationWindowStatus(res);
    if (!canCancel) {
      alert('Cannot cancel within 1 hour of your reservation time.');
      return;
    }
    setCancellingId(res.id);
  };

  const confirmCancelReservation = async () => {
  try {
    await updateReservationStatus(cancellingId, 'cancelled');
    await fetchReservations();
    alert('Reservation cancelled successfully!');
  } catch (error) {
    console.error('Cancel error:', error);
    alert('Failed to cancel reservation. Please try again.');
  } finally {
    setCancellingId(null);
  }
};

  // ── Reservation: Edit ────────────────────────────────────────────────────
  const openEditModal = (res) => {
    const { canEdit } = getReservationWindowStatus(res);
    if (!canEdit) {
      alert('Reservations can only be edited more than 3 hours before the booking time.');
      return;
    }
    setEditingReservation(res);
    setEditForm({
      reservation_date: res.reservation_date?.split('T')[0] || '',
      reservation_time: res.original_time_ethiopian || res.reservation_time || '',
      guests: res.guests || 2,
    });
    setShowEditModal(true);
  };

 const handleSaveEdit = async () => {
  if (!editForm.reservation_date || !editForm.reservation_time) {
    alert('Please fill in all fields.');
    return;
  }
  setEditLoading(true);
  try {
    // Import the updateReservation function
    const { updateReservation } = await import('../../API/reservapi');
    
    // Call the updateReservation function with the correct parameters
    await updateReservation(editingReservation.id, {
      reservation_date: editForm.reservation_date,
      reservation_time: editForm.reservation_time,
      original_time_ethiopian: editForm.reservation_time,
      guests: parseInt(editForm.guests),
    });
    
    setShowEditModal(false);
    setEditingReservation(null);
    await fetchReservations();
    alert('Reservation updated successfully!');
  } catch (error) {
    console.error('Edit error:', error);
    alert(`Failed to update reservation: ${error.message || 'Please try again.'}`);
  } finally {
    setEditLoading(false);
  }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0.00 ETB';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0.00 ETB';
    return `${numAmount.toFixed(2)} ETB`;
  };

  const getTimeRemaining = (createdAt) => {
    const timeRemaining = getModificationTimeRemaining(createdAt);
    if (timeRemaining.canModify) return `${timeRemaining.minutesRemaining} min left to cancel`;
    return null;
  };

  const formatReservationDate = (dateString) => new Date(dateString).toLocaleDateString();

 const getReservationStatusBadge = (status, reservation = null) => {
  // Check if pending reservation is actually expired
  if (status === 'pending' && reservation) {
    const { todayStr, currentMinutes } = getEthiopianNow();
    const resDate = reservation.reservation_date?.split('T')[0];
    const ethiopianTime = reservation.original_time_ethiopian || reservation.reservation_time;
    const match = ethiopianTime?.match(/(\d+):(\d+)\s+(AM|PM)/i);
    
    if (match && resDate === todayStr) {
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2]);
      const mod = match[3].toUpperCase();
      if (mod === 'PM' && hours !== 12) hours += 12;
      if (mod === 'AM' && hours === 12) hours = 0;
      const resWesternMinutes = ((hours * 60 + mins) + 360) % 1440;
      const deadlineMinutes = resWesternMinutes - 30;
      
      if (currentMinutes > deadlineMinutes) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
            expired
          </span>
        );
      }
    }
    
    // Past date and still pending = expired
    if (resDate && resDate < todayStr) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
          expired
        </span>
      );
    }
  }

  const colors = {
    pending:   'bg-yellow-500/20 text-yellow-500',
    confirmed: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
    completed: 'bg-blue-500/20 text-blue-500'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20 text-gray-500'}`}>
      {status}
    </span>
  );
};
  

  if (!user) {
    return (
      <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text mb-4">Please login to view your profile</p>
          <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-lg">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-primary mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
 {/* Profile Card */}
<div className="lg:col-span-1">
  <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-24">
    
    {/* ── Top banner + avatar ── */}
<div className="relative h-24 bg-gradient-to-r from-primary/30 to-primary/10">
  {/* Role badge top-left */}
  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/30 text-white text-xs font-medium capitalize">
    {user.role}
  </span>

  {/* Avatar — centered, overlapping the banner bottom */}
  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
    <div className="relative group">
      {/* Circle */}
      <div className="w-30 h-30 rounded-full border-4 border-card bg-primary/20 flex items-center justify-center overflow-hidden">
        {formData.profile_image ? (
          <img
            src={formData.profile_image}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-primary select-none">
            {(formData.full_name || user.username || '?')[0].toUpperCase()}
          </span>
        )}
      </div>

      {/* Camera overlay — visible on hover OR when editing */}
      {editing && (
        <>
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaCamera size={16} className="text-white" />
            <span className="text-white text-[10px] mt-1">Change</span>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              // Resize before base64 to keep DB size reasonable
              const reader = new FileReader();
              reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX = 200;
                  const ratio = Math.min(MAX / img.width, MAX / img.height);
                  canvas.width = img.width * ratio;
                  canvas.height = img.height * ratio;
                  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                  const compressed = canvas.toDataURL('image/jpeg', 0.7);
                  setFormData(f => ({ ...f, profile_image: compressed }));
                };
                img.src = reader.result;
              };
              reader.readAsDataURL(file);
            }}
          />
          {/* Small camera badge bottom-right */}
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg"
          >
            <FaCamera size={10} className="text-white" />
          </label>
        </>
      )}
    </div>
  </div>
</div>

    {/* ── Name + username below avatar ── */}
    <div className="pt-12 pb-4 px-6 text-center border-b border-border">
      <h3 className="text-lg font-bold text-text">
        {formData.full_name || user.username}
      </h3>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-primary text-xs hover:text-primary/80 transition-all">
            <FaEdit size={11} /> Edit
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  full_name: user.full_name || user.username || '',
                  phone: user.phone || '',
                  email: user.email || '',
                  profile_image: user.profile_image || '',
                });
              }}
              className="flex items-center gap-1 text-red-400 text-xs hover:text-red-300"
            >
              <FaTimes size={11} /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>

    {/* ── Info fields ── */}
    <div className="p-5 space-y-3">

      

      {/* Full Name */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-bg/40 border border-border">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FaUser size={13} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text/40 mb-0.5">Full Name</p>
          {editing ? (
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full bg-transparent text-text text-sm focus:outline-none border-b border-primary/40 pb-0.5"
            />
          ) : (
            <p className="text-text text-sm font-medium truncate">
              {formData.full_name || <span className="text-text/30 italic font-normal">Not set</span>}
            </p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-bg/40 border border-border">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FaPhone size={13} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text/40 mb-0.5">Phone</p>
          {editing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
              placeholder="09........"
              className="w-full bg-transparent text-text text-sm focus:outline-none border-b border-primary/40 pb-0.5"
            />
          ) : (
            <p className="text-text text-sm font-medium truncate">
              {formData.phone || <span className="text-text/30 italic font-normal">Not set</span>}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-bg/40 border border-border">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FaEnvelope size={13} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text/40 mb-0.5">Email</p>
          {editing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              className="w-full bg-transparent text-text text-sm focus:outline-none border-b border-primary/40 pb-0.5"
            />
          ) : (
            <p className="text-text text-sm font-medium truncate">
              {formData.email || <span className="text-text/30 italic font-normal">Not set</span>}
            </p>
          )}
        </div>
      </div>

      {/* Save button */}
      {editing && (
        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white rounded-xl hover:bg-primary/80 transition-all text-sm font-medium flex items-center justify-center gap-2 mt-1"
        >
          {loading ? <FaSpinner className="animate-spin" size={14} /> : <FaSave size={14} />}
          Save Changes
        </button>
      )}
    </div>

    {/* ── Logout ── */}
    <div className="px-5 pb-5">
      <button
        onClick={logout}
        className="w-full bg-red-500/10 text-red-500 py-2.5 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
      >
        <FaTimes size={13} /> Logout
      </button>
    </div>

  </div>
</div>
          {/* Orders + Reservations */}
          <div className="lg:col-span-2 space-y-6">
           {/* ── Orders Card ── */}
<div className="bg-card rounded-2xl border border-border p-6">
  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
    <h2 className="text-xl font-semibold text-text flex items-center gap-2">
      <FaShoppingBag className="text-primary" /> My Orders
    </h2>
  </div>

  {/* Date filter */}
  <div className="flex gap-2 overflow-x-auto pb-1 mb-3 justify-end">
    {[
      { key: 'all', label: 'All' },
      { key: 'today', label: 'Today' },
      { key: 'week', label: 'This Week' },
      { key: 'month', label: 'This Month' },
      { key: 'custom', label: '📅 Pick Day' },
    ].map(({ key, label }) => (
      <button key={key}
        onClick={() => { setOrderDateFilter(key); setStatusFilter('all'); }}
        className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap text-white transition-all ${
          orderDateFilter === key ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
        }`}
      >{label}</button>
    ))}
  </div>

  {orderDateFilter === 'custom' && (
    <div className="mb-3">
      <input type="date" value={orderCustomDate}
        max={new Date().toISOString().split('T')[0]}
        onChange={(e) => setOrderCustomDate(e.target.value)}
        className="px-3 py-2 rounded-lg bg-bg border border-primary/50 text-text text-sm focus:outline-none focus:border-primary"
      />
    </div>
  )}

  {orderDateFilter !== 'all' && (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
      {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
        <button key={s} onClick={() => setStatusFilter(s)}
          className={`px-3 py-1.5 rounded-lg text-sm capitalize text-white transition-all ${
            statusFilter === s ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >{s === 'all' ? '📋 All Status' : s}</button>
      ))}
    </div>
  )}

  {loading ? (
    <div className="flex justify-center items-center h-40">
      <FaSpinner className="animate-spin text-primary text-4xl" />
    </div>
  ) : filteredOrders.length === 0 ? (
    <div className="text-center py-5">
      <FaShoppingBag className="text-xl text-text/20 mx-auto mb-3" />
      <p className="text-text/50">No orders found</p>
      <button onClick={() => navigate('/menu')} className="mt-3 text-primary hover:underline text-sm">Start Ordering</button>
    </div>
  ) : (
    <div className="rounded-xl border border-border overflow-hidden">
      {(showAllOrders ? filteredOrders : filteredOrders.slice(0, 3)).map((order, idx, arr) => (
        <div key={order.id}>
          <div className="p-4 hover:bg-primary/5 bg-bg transition-all">
            <div className="flex items-center justify-between">
              {/* Left: status + time remaining */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || ''}`}>
                  {statusIcons[order.status]}
                  <span className="capitalize">{order.status}</span>
                </div>
                {order.status === 'pending' && getTimeRemaining(order.created_at) && (
                  <span className="text-xs text-yellow-500 flex items-center gap-1">
                    <FaRegClock size={10} /> {getTimeRemaining(order.created_at)}
                  </span>
                )}
              </div>

              {/* Right: date + dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-text/40">{formatDate(order.created_at).split(' ')[0]}</span>

                {/* Dropdown trigger */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === `order-${order.id}` ? null : `order-${order.id}`)}
                    className="w-7 h-7 rounded-full hover:bg-primary/10 flex items-center justify-center text-text/50 hover:text-primary transition-all"
                  >
                    ⋮
                  </button>

                  <AnimatePresence>
                    {openDropdown === `order-${order.id}` && (
                      <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-xl w-44 overflow-hidden"
                        >
                          {/* View */}
                          <button
                            onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); setOpenDropdown(null); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-text hover:bg-primary/10 flex items-center gap-2 transition-all"
                          >
                            <FaEye size={12} className="text-primary" /> View Details
                          </button>

                          <hr className="border-border" />

                          {/* Cancel — locked unless pending + within time */}
                          {order.status === 'pending' ? (
                            <button
                              onClick={() => { handleCancelOrder(order); setOpenDropdown(null); }}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-all"
                            >
                              <FaTrash size={12} /> Cancel Order
                            </button>
                          ) : (
                            <div className="px-4 py-2.5 text-sm text-text/30 flex items-center gap-2 cursor-not-allowed">
                              <FaLock size={11} /> Cancel Locked
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Order details row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              <div><p className="text-text/40 text-xs">Items</p><p className="text-text text-sm font-medium">{order.items?.length || 0} items</p></div>
              <div><p className="text-text/40 text-xs">Table</p><p className="text-text text-sm">Table {order.table_number}</p></div>
              <div><p className="text-text/40 text-xs">Total</p><p className="text-primary text-sm font-bold">{formatCurrency(order.total_amount)}</p></div>
              <div><p className="text-text/40 text-xs">Time</p><p className="text-text text-sm">{formatDate(order.created_at).split(' ')[1]}</p></div>
            </div>
          </div>

          {/* Separator between items, not after last */}
          {idx < arr.length - 1 && <hr className="border-border" />}
        </div>
      ))}
    </div>
  )}

  {filteredOrders.length > 3 && (
    <button onClick={() => setShowAllOrders(!showAllOrders)}
      className="w-full py-2 mt-3 border border-border rounded-lg text-text/50 hover:text-primary hover:border-primary transition-all text-sm"
    >
      {showAllOrders ? '▲ Show Less' : `▼ Show ${filteredOrders.length - 3} More Orders`}
    </button>
  )}
</div>

       {/* ── Reservations Card ── */}
<div className="bg-card rounded-2xl border border-border p-6">
  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
    <h2 className="text-xl font-semibold text-text flex items-center gap-2">
      <FaCalendarCheck className="text-primary" /> My Reservations
    </h2>
  </div>

  {/* Date filter */}
  <div className="flex gap-2 overflow-x-auto pb-1 mb-3 justify-end">
    {[
      { key: 'all', label: 'All' },
      { key: 'today', label: 'Today' },
      { key: 'week', label: 'This Week' },
      { key: 'month', label: 'This Month' },
      { key: 'custom', label: '📅 Pick Day' },
    ].map(({ key, label }) => (
      <button key={key}
        onClick={() => { setReservationDateFilter(key); setReservationStatusFilter('all'); }}
        className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap text-white transition-all ${
          reservationDateFilter === key ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
        }`}
      >{label}</button>
    ))}
  </div>

  {reservationDateFilter === 'custom' && (
    <div className="mb-3">
      <input type="date" value={reservationCustomDate}
        onChange={(e) => setReservationCustomDate(e.target.value)}
        className="px-3 py-2 rounded-lg bg-bg border border-primary/50 text-text text-sm focus:outline-none focus:border-primary"
      />
    </div>
  )}

  {reservationDateFilter !== 'all' && (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
      {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
        <button key={s} onClick={() => setReservationStatusFilter(s)}
          className={`px-3 py-1.5 rounded-lg text-sm capitalize text-white transition-all ${
            reservationStatusFilter === s ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >{s === 'all' ? '📋 All Status' : s}</button>
      ))}
    </div>
  )}

  {reservationsLoading ? (
    <div className="flex justify-center items-center h-32">
      <FaSpinner className="animate-spin text-primary text-2xl" />
    </div>
  ) : filteredReservations.length === 0 ? (
    <div className="text-center py-10">
      <FaCalendarCheck className="text-4xl text-text/20 mx-auto mb-2" />
      <p className="text-text/50">No reservations found</p>
      <button onClick={() => navigate('/reserve')} className="mt-2 text-primary hover:underline text-sm">Make a Reservation</button>
    </div>
  ) : (
    <div className="rounded-xl border border-border overflow-hidden">
      {(showAllReservations ? filteredReservations : filteredReservations.slice(0, 3)).map((res, idx, arr) => {
        const { canEdit, canCancel, editClosesIn, cancelClosesIn } = getReservationWindowStatus(res);
        const isLocked = res.status === 'cancelled' || res.status === 'completed';

        return (
          <div key={res.id} className={isLocked ? 'opacity-60' : ''}>
            <div className="p-4 bg-bg hover:bg-primary/5 transition-all">
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {getReservationStatusBadge(res.status, res)}
                  <span className="text-text/50 text-xs flex items-center gap-1">
                    <FaClockIcon size={10} /> {res.original_time_ethiopian || res.reservation_time}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-text/40">{formatReservationDate(res.reservation_date)}</span>

                  {/* Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === `res-${res.id}` ? null : `res-${res.id}`)}
                      className="w-7 h-7 rounded-full hover:bg-primary/10 flex items-center justify-center text-text/50 hover:text-primary transition-all"
                    >
                      ⋮
                    </button>

                    <AnimatePresence>
                      {openDropdown === `res-${res.id}` && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-xl w-52 overflow-hidden"
                          >
                            {/* View — always available */}
                            <button
                              onClick={() => { setSelectedOrder(res); setShowOrderDetails(true); setOpenDropdown(null); }}
                              className="w-full px-4 py-2.5 text-left text-sm text-text hover:bg-primary/10 flex items-center gap-2 transition-all"
                            >
                              <FaEye size={12} className="text-primary" /> View Details
                            </button>

                            <hr className="border-border" />

                            {/* Edit */}
                            {canEdit ? (
                              <button
                                onClick={() => { openEditModal(res); setOpenDropdown(null); }}
                                className="w-full px-4 py-2.5 text-left text-sm text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 transition-all"
                              >
                                <FaPencilAlt size={11} /> Edit Reservation
                                <span className="ml-auto text-xs text-text/30">{formatMinutes(editClosesIn)}</span>
                              </button>
                            ) : (
                              <div className="px-4 py-2.5 text-sm text-text/30 flex items-center gap-2 cursor-not-allowed">
                                <FaLock size={11} /> Edit Locked
                                <span className="ml-auto text-xs">{canCancel ? '<3h' : ''}</span>
                              </div>
                            )}

                            <hr className="border-border" />

                            {/* Cancel */}
                            {canCancel ? (
                              <button
                                onClick={() => { handleCancelReservation(res); setOpenDropdown(null); }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-all"
                              >
                                <FaBan size={11} /> Cancel Reservation
                                <span className="ml-auto text-xs text-text/30">{formatMinutes(cancelClosesIn)}</span>
                              </button>
                            ) : (
                              <div className="px-4 py-2.5 text-sm text-text/30 flex items-center gap-2 cursor-not-allowed">
                                <FaLock size={11} /> Cancel Locked
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div><p className="text-text/40 text-xs">Customer</p><p className="text-text text-sm font-medium truncate">{res.customer_name}</p></div>
                <div><p className="text-text/40 text-xs">Phone</p><p className="text-text text-sm">{res.phone_number}</p></div>
                <div><p className="text-text/40 text-xs">Guests</p><p className="text-text text-sm">{res.guests} people</p></div>
                <div><p className="text-text/40 text-xs">Table</p><p className="text-text text-sm capitalize">{res.table_preference || 'Any'}</p></div>
              </div>

              
            </div>

            {idx < arr.length - 1 && <hr className="border-border" />}
          </div>
        );
      })}
    </div>
  )}

  {filteredReservations.length > 3 && (
    <button onClick={() => setShowAllReservations(!showAllReservations)}
      className="w-full py-2 mt-3 border border-border rounded-lg text-text/50 hover:text-primary hover:border-primary transition-all text-sm"
    >
      {showAllReservations ? '▲ Show Less' : `▼ Show ${filteredReservations.length - 3} More Reservations`}
    </button>
  )}
</div>
          </div>
        </div>
      </div>

      {/* ── Edit Reservation Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && editingReservation && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-2xl max-w-md w-full border border-border p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text flex items-center gap-2">
                  <FaPencilAlt className="text-primary" /> Edit Reservation #{editingReservation.id}
                </h2>
                <button onClick={() => setShowEditModal(false)} className="text-text/50 hover:text-text text-2xl">×</button>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-text/60 mb-1 flex items-center gap-2">
                    <FaCalendarAlt className="text-primary" size={12} /> New Date
                  </label>
                  <input
                    type="date"
                    value={editForm.reservation_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditForm(f => ({ ...f, reservation_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-text/60 mb-1 flex items-center gap-2">
                    <FaClockIcon className="text-primary" size={12} /> New Time (Ethiopian)
                  </label>
                  <select
                    value={editForm.reservation_time}
                    onChange={(e) => setEditForm(f => ({ ...f, reservation_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="">Select time...</option>
                    {ETHIOPIAN_TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-text/60 mb-1 flex items-center gap-2">
                    <FaUsers className="text-primary" size={12} /> Number of Guests
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditForm(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                      className="w-8 h-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-all flex items-center justify-center font-bold"
                    >−</button>
                    <span className="text-text font-semibold text-lg w-8 text-center">{editForm.guests}</span>
                    <button
                      onClick={() => setEditForm(f => ({ ...f, guests: Math.min(20, f.guests + 1) }))}
                      className="w-8 h-8 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-all flex items-center justify-center font-bold"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 border border-border rounded-lg text-text/70 hover:bg-gray-800 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {editLoading ? <FaSpinner className="animate-spin" /> : <FaSave size={14} />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Cancel Confirmation Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {cancellingId !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-2xl max-w-sm w-full border border-border p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <FaBan className="text-red-500 text-2xl" />
              </div>
              <h2 className="text-lg font-bold text-text mb-2">Cancel Reservation?</h2>
              <p className="text-text/60 text-sm mb-6">This action cannot be undone. Your table will be released.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancellingId(null)}
                  className="flex-1 py-2 border border-border rounded-lg text-text/70 hover:bg-gray-800 transition-all text-sm"
                >
                  Keep it
                </button>
                <button
                  onClick={confirmCancelReservation}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <FaBan size={13} /> Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Order/Reservation Details Modal ───────────────────────────────── */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="sticky top-0 bg-card p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-text">{selectedOrder.items ? 'Order Details' : 'Reservation Details'}</h2>
                <button onClick={() => setShowOrderDetails(false)} className="text-text/50 hover:text-text">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-text/60 text-sm">ID</p><p className="text-text font-mono">#{selectedOrder.id}</p></div>
                <div>
                  <p className="text-text/60 text-sm">Status</p>
                  {selectedOrder.items
                    ? <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedOrder.status] || ''}`}>{statusIcons[selectedOrder.status]}<span className="capitalize">{selectedOrder.status}</span></div>
                    : getReservationStatusBadge(selectedOrder.status)
                  }
                </div>
                <div><p className="text-text/60 text-sm">Date & Time</p><p className="text-text text-sm">{formatDate(selectedOrder.created_at)}</p></div>
                <div><p className="text-text/60 text-sm">Table</p><p className="text-text">{selectedOrder.table_number || selectedOrder.table_preference || 'Any'}</p></div>
              </div>
              {selectedOrder.items && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-text font-semibold mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-400/30 rounded-lg">
                        <div><p className="text-text text-sm font-medium">{item.name}</p><p className="text-text/60 text-xs">Qty: {item.quantity}</p></div>
                        <p className="text-primary text-sm font-semibold">{formatCurrency(item.price_at_time)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                    <span className="text-text font-semibold">Total</span>
                    <span className="text-primary text-xl font-bold">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-text font-semibold mb-2">Special Notes</h3>
                  <p className="text-text/80 text-sm bg-gray-400/50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
              {selectedOrder.special_requests && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-text font-semibold mb-2">Special Requests</h3>
                  <p className="text-text/80 text-sm bg-gray-400/50 p-3 rounded-lg">{selectedOrder.special_requests}</p>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-card p-6 border-t border-border">
              <button onClick={() => setShowOrderDetails(false)} className="w-full py-2 border border-border rounded-lg text-text hover:bg-primary/10 transition-all">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
