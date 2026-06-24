import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaEye, FaSpinner, FaCheckCircle, FaTimesCircle, FaClock,
  FaUser, FaPhone, FaCalendarAlt, FaComment, FaTrash, FaSearch, FaBell,
} from 'react-icons/fa';
import { getReservations, updateReservationStatus, deleteReservation } from '../../../API/reservapi';

// ─────────────────────────────────────────────
// TIME HELPERS  (UTC+3 = Ethiopian wall-clock)
// ─────────────────────────────────────────────

function getEthiopianNow() {
  const et = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const todayStr = et.toISOString().split('T')[0];
  const currentMinutes = et.getUTCHours() * 60 + et.getUTCMinutes();
  return { todayStr, currentMinutes };
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

function shouldAutoExpire(res) {
  if (res.status !== 'pending') return false;
  const { todayStr, currentMinutes } = getEthiopianNow();
  const resDate = res.reservation_date?.split('T')[0];
  if (!resDate) return false;
  if (resDate < todayStr) return true;
  if (resDate === todayStr) {
    const t = res.original_time_ethiopian || res.reservation_time;
    return currentMinutes > parseEthiopianTimeToMinutes(t) - 30;
  }
  return false;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  const [filteredStats, setFilteredStats] = useState({
    total: 0, totalGuests: 0, confirmed: 0, pending: 0,
    cancelled: 0, completed: 0, expired: 0,
  });

  // IDs we've already tried (and failed) to expire on the backend — skip them forever
  const expiredOnServer = new Set();

  // ── deadline badge ──────────────────────────────────────────────────────
  const getDeadlineStatus = (res) => {
    if (res.status !== 'pending') return null;
    const { todayStr, currentMinutes } = getEthiopianNow();
    const resDate = res.reservation_date?.split('T')[0];
    if (resDate !== todayStr) return null;
    const t = res.original_time_ethiopian || res.reservation_time;
    const deadline = parseEthiopianTimeToMinutes(t) - 30;
    if (currentMinutes > deadline)
      return { text: 'expired', color: 'text-red-500', urgent: true, expired: true };
    const left = deadline - currentMinutes;
    if (left <= 5)  return { text: `${left}m left!`, color: 'text-red-500',    urgent: true  };
    if (left <= 15) return { text: `${left}m left`,  color: 'text-orange-500', urgent: true  };
    if (left <= 30) return { text: `${left}m left`,  color: 'text-yellow-500', urgent: false };
                    return { text: `${left}m left`,  color: 'text-green-500',  urgent: false };
  };

  // ── fetch + auto-expire ─────────────────────────────────────────────────
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getReservations();
      const raw = Array.isArray(response) ? response : response.data || response.reservations || [];

      // Detect customer edits
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const customerUpdated = raw.filter(
        (r) => r.updated_at > fiveMinutesAgo && r.updated_at !== r.created_at && r.status === 'pending',
      );
      if (customerUpdated.length > 0) setRecentlyUpdated(customerUpdated);

      const processed = await Promise.all(
        raw.map(async (res) => {
          if (res.status !== 'pending') return res;

          if (!shouldAutoExpire(res)) return res;

          // Already failed for this ID — just mark locally, don't hit the server
          if (expiredOnServer.has(res.id)) {
  return { ...res, status: 'expired', cancelled_by: 'system' };
}
try {
  await updateReservationStatus(res.id, 'expired', { cancelled_by: 'system' });
} catch {
  expiredOnServer.add(res.id);
}
          return { ...res, status: 'expired', cancelled_by: 'system' };
        }),
      );

      setReservations(processed);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── filters ─────────────────────────────────────────────────────────────
  const filterByDate = useCallback((res, range, customDateValue) => {
    const resDateStr = res.reservation_date?.split('T')[0];
    if (!resDateStr) return true;
    const resDate = new Date(resDateStr);
    const { todayStr: today } = getEthiopianNow();

    switch (range) {
      case 'today': return resDateStr === today;
      case 'week': {
        const weekAgo = new Date(Date.now() + 3 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000);
        return resDateStr >= weekAgo.toISOString().split('T')[0];
      }
      case 'month': {
        const ref = new Date(Date.now() + 3 * 60 * 60 * 1000);
        ref.setUTCMonth(ref.getUTCMonth() - 1);
        return resDate >= ref;
      }
      case 'year': {
        const ref = new Date(Date.now() + 3 * 60 * 60 * 1000);
        ref.setUTCFullYear(ref.getUTCFullYear() - 1);
        return resDate >= ref;
      }
      case 'custom': return customDateValue ? resDateStr === customDateValue : true;
      default: return true;
    }
  }, []);

  const applyFilters = useCallback((arr) => {
  // Date + search filtered (but NOT status filtered) — for accurate stats
  let dateSearchFiltered = arr.filter((r) => filterByDate(r, dateRange, customDate));
  if (searchTerm)
    dateSearchFiltered = dateSearchFiltered.filter(
      (r) =>
        r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone_number?.includes(searchTerm) ||
        r.id?.toString().includes(searchTerm),
    );

  // Stats always from date+search only, never status-filtered
  setFilteredStats({
    total:       dateSearchFiltered.length,
    totalGuests: dateSearchFiltered.reduce((s, r) => s + (r.guests || 0), 0),
    confirmed:   dateSearchFiltered.filter((r) => r.status === 'confirmed').length,
    pending:     dateSearchFiltered.filter((r) => r.status === 'pending').length,
    cancelled:   dateSearchFiltered.filter((r) => r.status === 'cancelled').length,
    completed:   dateSearchFiltered.filter((r) => r.status === 'completed').length,
    expired:     dateSearchFiltered.filter((r) => r.status === 'expired').length,
  });

  // Table gets status filter applied on top
  const tableFiltered = statusFilter !== 'all'
    ? dateSearchFiltered.filter((r) => r.status === statusFilter)
    : dateSearchFiltered;

  setFilteredReservations(tableFiltered);
}, [statusFilter, dateRange, customDate, searchTerm, filterByDate]);

  useEffect(() => { applyFilters(reservations); }, [applyFilters, reservations]);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 60000);
    return () => clearInterval(interval);
  }, [fetchReservations]);

  // Sync modal when list refreshes
  useEffect(() => {
    if (selectedReservation) {
      const fresh = reservations.find((r) => r.id === selectedReservation.id);
      if (fresh) setSelectedReservation(fresh);
    }
  }, [reservations]);

  // ── actions ──────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus, cancelledBy = 'manager') => {
    try {
      await updateReservationStatus(id, newStatus, { cancelled_by: cancelledBy });
      await fetchReservations();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await deleteReservation(id);
      setShowDetails(false);
      fetchReservations();
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert('Failed to delete reservation');
    }
  };

  // ── display helpers ───────────────────────────────────────────────────────
  const getStatusBadge = (status, cancelledBy) => {
    const colorMap = {
      pending:   'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-green-500/20 text-green-500',
      cancelled:
        cancelledBy === 'customer' ? 'bg-orange-500/20 text-orange-400'
        : cancelledBy === 'system' ? 'bg-gray-500/20 text-gray-400'
        : 'bg-red-500/20 text-red-500',
      completed: 'bg-blue-500/20 text-blue-500',
      expired:   'bg-gray-500/20 text-gray-400',
    };
    const iconMap = {
      pending:   <FaClock className="text-yellow-500 mr-1" size={12} />,
      confirmed: <FaCheckCircle className="text-green-500 mr-1" size={12} />,
      cancelled: <FaTimesCircle className={`mr-1 ${cancelledBy === 'customer' ? 'text-orange-400' : cancelledBy === 'system' ? 'text-gray-400' : 'text-red-500'}`} size={12} />,
      completed: <FaCheckCircle className="text-blue-500 mr-1" size={12} />,
      expired:   <FaTimesCircle className="text-gray-400 mr-1" size={12} />,
    };
    let label = status;
    if (status === 'cancelled') {
      if (cancelledBy === 'customer') label = 'cancelled (customer)';
      else if (cancelledBy === 'manager') label = 'cancelled (manager)';
      else if (cancelledBy === 'system') label = 'expired';
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorMap[status] || 'bg-gray-500/20 text-gray-500'}`}>
        {iconMap[status]}
        {label}
      </span>
    );
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleString();

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today':  return "Today's Reservations";
      case 'week':   return 'Last 7 Days';
      case 'month':  return 'Last 30 Days';
      case 'year':   return 'Last 12 Months';
      case 'custom': return customDate ? `Reservations for ${new Date(customDate).toLocaleDateString()}` : 'All Reservations';
      default:       return 'All Reservations';
    }
  };

  const convertToEthiopianDisplay = (res) => {
    if (res.original_time_ethiopian) return res.original_time_ethiopian;
    try {
      const et = new Date(new Date(`${res.reservation_date}T${res.reservation_time}`).getTime() + 6 * 60 * 60 * 1000);
      let h = et.getHours();
      const m = et.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return res.reservation_time;
    }
  };

  const isRowLocked = (res) =>
    ['cancelled', 'completed', 'expired','confirmed'].includes(res.status);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Reservation Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage customer reservations · auto-expires 30 min before booking time</p>
          </div>
        </div>

        {/* Customer-edit notification */}
        {recentlyUpdated.length > 0 && (
          <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-3 mb-6 flex items-start justify-between gap-3">
            <p className="text-blue-400 text-sm flex items-start gap-2">
              <FaBell className="mt-0.5 shrink-0" />
              <span>
                <strong>{recentlyUpdated.length}</strong>{' '}
                reservation{recentlyUpdated.length > 1 ? 's were' : ' was'} recently edited by{' '}
                {recentlyUpdated.length > 1 ? 'customers' : 'a customer'}:{' '}
                {recentlyUpdated.map((r) => `#${r.id} (${r.customer_name})`).join(', ')}
              </span>
            </p>
            <button onClick={() => setRecentlyUpdated([])} className="text-blue-400 hover:text-white text-xl leading-none shrink-0">×</button>
          </div>
        )}
        <div className='flex justify-between items-center' >
      <div></div>  {/* Date range pills */}
        <div className="mb-4 items-end">
          <label className="block text-xs font-medium text-primary mb-1">Date Range</label>
          <div className="flex flex-wrap gap-1.5">
            {['today', 'week', 'month', 'year'].map((r) => (
              <button
                key={r}
                onClick={() => { setDateRange(r); setCustomDate(''); }}
                className={`px-2 py-1 rounded-md text-xs capitalize transition-all ${
                  dateRange === r && !customDate ? 'bg-primary text-white' : 'bg-card text-gray-400 hover:bg-gray-700'
                }`}
              >{r}</button>
            ))}
            <input
              type="date" value={customDate}
              onChange={(e) => { setDateRange('custom'); setCustomDate(e.target.value); }}
              className="px-2 py-1 rounded-md text-xs bg-card text-text border border-gray-700 focus:outline-none focus:border-primary"
              style={{ width: 130 }}
            />
          </div>
        </div>
</div>
        {/* Stats — clickable to filter */}
<div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6 ">
  {[
    { label: 'Total',     value: filteredStats.total,       color: 'text-green-800',  bg: 'from-primary to-primary',       border: 'border-primary/30',    filter: 'all'       },
    { label: 'Confirmed', value: filteredStats.confirmed,   color: 'text-green-800',  bg: 'from-green-500 to-green-600',   border: 'border-green-500/30',  filter: 'confirmed' },
    { label: 'Pending',   value: filteredStats.pending,     color: 'text-yellow-800', bg: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500/30', filter: 'pending'   },
    { label: 'Completed', value: filteredStats.completed,   color: 'text-blue-800',   bg: 'from-blue-500 to-blue-600',     border: 'border-blue-500/30',   filter: 'completed' },
    { label: 'expired',   value: filteredStats.expired,     color: 'text-gray-800',   bg: 'from-gray-500 to-gray-500',     border: 'border-gray-500/30',   filter: 'expired'   },
    { label: 'Guests',    value: filteredStats.totalGuests, color: 'text-purple-800', bg: 'from-purple-500 to-purple-600', border: 'border-purple-500/30', filter: null        },
  ].map(({ label, value, color, bg, border, filter }) => {
    const isActive = statusFilter === filter;
    // A filter is currently applied AND this card is not the active one AND it's not Guests
    const isDimmed = statusFilter !== 'all' && filter !== null && !isActive;

    return (
      <button
        key={label}
        onClick={() => filter && setStatusFilter(filter)}
        className={`bg-gradient-to-r ${bg} rounded-xl p-4 border text-left w-full transition-all ${
          filter
            ? isActive
              ? `${border} ring-2 ring-offset-1 ring-offset-gray-900 ring-current brightness-125`
              : `${border} hover:brightness-110 cursor-pointer`
            : `${border} cursor-default`
        }`}
      >
        <p className="text-gray-800 text-xs mb-1">{label}</p>
        <p className={`text-2xl font-bold ${isDimmed ? 'text-gray-600' : color}`}>
          {isDimmed ? '–' : value}
        </p>
        {filter && (
          <p className={`text-xs mt-1 ${isActive ? color : 'text-text'}`}>
            {isActive ? '● active' : 'click to filter'}
          </p>
        )}
      </button>
    );
  })}
</div>

        {/* Search */}
        <div className="mb-6 max-w-sm">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text" placeholder="Name, phone or ID…" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 rounded-md text-xs bg-card border border-gray-700 text-text focus:outline-none focus:border-primary placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-primary text-4xl" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 rounded-2xl">
            <FaCalendarAlt className="text-5xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reservations found for {getDateRangeLabel().toLowerCase()}</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  {[ 'Customer', 'Phone', 'Date', 'Time', 'Guests', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium text-sm whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((res) => {
                  const deadline = getDeadlineStatus(res);
                  const locked = isRowLocked(res);
                  return (
                    <tr key={res.id} className={`border-b border-gray-800/50 hover:bg-primary/5 transition-all ${res.status === 'expired' ? 'opacity-60 bg-red-900/10' : ''}`}>
                      
                      <td className="py-3 px-4 text-white text-sm">{res.customer_name}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{res.phone_number}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm whitespace-nowrap">{new Date(res.reservation_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm whitespace-nowrap">
                        {convertToEthiopianDisplay(res)}
                        {deadline && (
                          <span className={`ml-2 text-xs ${deadline.color} ${deadline.urgent ? 'animate-pulse font-bold' : ''}`}>
                            ({deadline.text})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{res.guests}</td>
                      <td className="py-3 px-4">{getStatusBadge(res.status, res.cancelled_by)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedReservation(res); setShowDetails(true); }}
                            className="p-1.5 text-primary hover:text-primary/80 transition-all" title="View Details"
                          ><FaEye size={16} /></button>
                          <select
                            disabled={locked}
                            value={res.status === 'expired' ? 'cancelled' : res.status}
                            onChange={(e) => handleStatusChange(res.id, e.target.value, 'manager')}
                            className={`px-2 py-1 rounded-md text-xs border border-gray-700 ${locked ? 'bg-card text-text cursor-not-allowed opacity-50' : 'bg-card text-text cursor-pointer'}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirm</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedReservation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800"
          >
            <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Reservation Details</h2>
              <button onClick={() => setShowDetails(false)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <p className="text-gray-500 text-sm">Reservation ID</p>
                  <p className="text-2xl font-bold text-primary font-mono">#{selectedReservation.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  {getStatusBadge(selectedReservation.status, selectedReservation.cancelled_by)}
                </div>
              </div>

              {/* Cancellation notice */}
              {(selectedReservation.status === 'cancelled' || selectedReservation.status === 'expired') && (
                <div className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
                  selectedReservation.cancelled_by === 'customer' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                }`}>
                  <FaTimesCircle className="shrink-0" />
                  {selectedReservation.cancelled_by === 'customer'  ? 'Cancelled by the customer'
                   : selectedReservation.cancelled_by === 'system'  ? 'expired — deadline passed'
                   : selectedReservation.status === 'expired'       ? 'expired — 30-minute window closed'
                   : 'Cancelled by manager'}
                </div>
              )}

              {/* Customer info */}
              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><FaUser className="text-primary" /> Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><p className="text-gray-500 text-sm">Full Name</p><p className="text-white font-medium">{selectedReservation.customer_name}</p></div>
                  <div><p className="text-gray-500 text-sm">Phone Number</p><p className="text-white flex items-center gap-2"><FaPhone className="text-gray-500 text-sm" />{selectedReservation.phone_number}</p></div>
                </div>
              </div>

              {/* Reservation details */}
              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><FaCalendarAlt className="text-primary" /> Reservation Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><p className="text-gray-500 text-sm">Reservation Date</p><p className="text-white">{formatDate(selectedReservation.reservation_date)}</p></div>
                  <div><p className="text-gray-500 text-sm">Ethiopian Time</p><p className="text-primary font-semibold">{selectedReservation.original_time_ethiopian || convertToEthiopianDisplay(selectedReservation)}</p></div>
                 
                  <div><p className="text-gray-500 text-sm">Guests</p><p className="text-white">{selectedReservation.guests}</p></div>
                  <div><p className="text-gray-500 text-sm">Created At Western Time</p><p className="text-white text-sm">{formatDateTime(selectedReservation.created_at)}</p></div>
                </div>
              </div>

              {selectedReservation.special_requests && (
                <div className="border-t border-gray-800 pt-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><FaComment className="text-primary" /> Special Requests</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4"><p className="text-gray-300 italic">"{selectedReservation.special_requests}"</p></div>
                </div>
              )}

              {/* Update status */}
              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-white font-semibold mb-3">Update Status</h3>
                <div className="flex gap-3">
                  <select
                    disabled={isRowLocked(selectedReservation)}
                    value={selectedReservation.status === 'expired' ? 'cancelled' : selectedReservation.status}
                    onChange={(e) => handleStatusChange(selectedReservation.id, e.target.value, 'manager')}
                    className={`flex-1 px-4 py-2 border border-gray-700 rounded-lg text-sm ${isRowLocked(selectedReservation) ? 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-50' : 'bg-card text-text'}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-900 p-6 border-t border-gray-800">
              <button onClick={() => setShowDetails(false)} className="w-full py-2 border border-gray-700 rounded-lg text-white hover:bg-card transition-all text-sm">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReservationsManagement;
