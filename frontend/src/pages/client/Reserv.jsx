import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers,
  FaUtensils,
  FaChair,
  FaComment,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { createReservation } from "../../API/reservapi";
import { useAuth } from "../../config/AuthContext";
import HeroSection from '../../componests/HeroSection';
import imghero from "../../assets/IMG/imghero.jfif"
import emailjs from "@emailjs/browser";
const EMAILJS_SERVICE_ID  = "service_a3lacf2";
const EMAILJS_TEMPLATE_ID = "template_gw19ea5";
const EMAILJS_PUBLIC_KEY  = "KvUG9Z5wlUAX82Bfd";

const Reserv = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    reservation_date: "",
    reservation_time: "",
    guests: "2",
    occasion: "regular",
    special_requests: "",
    table_preference: "any"
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reservationDetails, setReservationDetails] = useState(null);
  const [selectedTimeDisplay, setSelectedTimeDisplay] = useState("");

  // Auto-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.full_name || user.username || '',
        email: user.email || '',
        phone_number: user.phone || ''
      }));
    }
  }, [user]);

  // Available time slots in Ethiopian Time
  const ethiopianTimeSlots = [
    '2:30 AM','3:00 AM','3:30 AM','4:00 AM','4:30 AM','5:00 AM','5:30 AM',
    '6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM',
    '9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM',
    '1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
  ];

  const timeSlots = ethiopianTimeSlots;

  // Table preferences
  const tablePreferences = [
    { value: "any", label: "Any Table", icon: FaChair },
    { value: "window", label: "Window View", icon: FaChair },
    { value: "private", label: "Private Room", icon: FaChair },
    { value: "outdoor", label: "Outdoor Seating", icon: FaChair }
  ];

  // Occasions
  const occasions = [
    { value: "regular", label: "Regular Dining" },
    { value: "birthday", label: "Birthday Celebration" },
    { value: "anniversary", label: "Anniversary" },
    { value: "business", label: "Business Meeting" },
    { value: "date", label: "Romantic Date" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "reservation_time") {
      setSelectedTimeDisplay(value);
      setFormData(prev => ({
        ...prev,
        reservation_time: value
      }));
    } else if (name === "phone_number") {
      // Only allow digits and limit to 10 characters
      let cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 10) {
        cleaned = cleaned.slice(0, 10);
      }
      setFormData(prev => ({
        ...prev,
        [name]: cleaned
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      sessionStorage.setItem('pendingReservation', JSON.stringify(formData));
      alert('Please login to complete your reservation');
      navigate('/login', { state: { from: '/reserve' } });
      return;
    }
    
    // Validate phone number - must be exactly 10 digits
    if (!formData.phone_number || formData.phone_number.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await createReservation({
        customer_name: formData.customer_name,
        email: formData.email,
        phone_number: formData.phone_number,
        reservation_date: formData.reservation_date,
        reservation_time: selectedTimeDisplay,
        guests: parseInt(formData.guests),
        table_preference: formData.table_preference,
        occasion: formData.occasion,
        special_requests: formData.special_requests,
        original_time_ethiopian: selectedTimeDisplay
      });
      
      if (response.success) {
  // Send confirmation email
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email:         formData.email,
        customer_name:    formData.customer_name,
        reservation_date: formData.reservation_date,
        reservation_time: selectedTimeDisplay,
        guests:           formData.guests,
        table_preference: tablePreferences.find(t => t.value === formData.table_preference)?.label,
        occasion:         occasions.find(o => o.value === formData.occasion)?.label,
        reservation_id:   response.reservation?.id || "N/A",
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log("Confirmation email sent!");
  } catch (emailErr) {
    // Don't block success screen if email fails
    console.warn("Email failed:", emailErr);
  }

  // Show success screen regardless
  setReservationDetails(response.reservation);
  setSubmitted(true);
}
    } catch (err) {
      console.error('Reservation error:', err);
      setError(err.message || 'Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayTime = () => {
    return selectedTimeDisplay;
  };

  const ethiopianNow = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));
  const today = ethiopianNow.toISOString().split('T')[0];
  const maxDate = new Date(ethiopianNow.getTime());
  maxDate.setUTCMonth(maxDate.getUTCMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full mx-auto p-4 sm:p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
          >
            <FaCheckCircle className="text-2xl sm:text-4xl text-white" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3 sm:mb-4">Reservation Confirmed!</h2>
          <p className="text-text/70 text-sm sm:text-base mb-4 sm:mb-6">
            Thank you, {formData.customer_name}! Your reservation has been confirmed.We'll send a confirmation email with your reservation details
          </p>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-left">
            <p className="text-text/60 text-xs sm:text-sm mb-2">Reservation Details:</p>
            <p className="text-text text-sm sm:text-base"><span className="text-primary">Date:</span> {formData.reservation_date}</p>
            <p className="text-text text-sm sm:text-base"><span className="text-primary">Time:</span> {getDisplayTime()} (Ethiopian)</p>
            <p className="text-text text-sm sm:text-base"><span className="text-primary">Guests:</span> {formData.guests} people</p>
            <p className="text-text text-sm sm:text-base"><span className="text-primary">Table:</span> {tablePreferences.find(t => t.value === formData.table_preference)?.label}</p>
            {reservationDetails?.id && (
              <p className="text-text text-sm sm:text-base mt-2"><span className="text-primary">Reservation ID:</span> #{reservationDetails.id}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/menu")}
              className="w-full sm:flex-1 bg-primary text-white py-2 px-4 rounded-full font-semibold hover:bg-primary/80 transition-all shadow-button text-sm sm:text-base"
            >
              View Menu
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  customer_name: user?.full_name || "", email: user?.email || "", phone_number: user?.phone || "", 
                  reservation_date: "", reservation_time: "",
                  guests: "2", occasion: "regular", special_requests: "", table_preference: "any"
                });
                setSelectedTimeDisplay("");
                setReservationDetails(null);
              }}
              className="w-full sm:flex-1 border-2 border-primary text-primary py-2 px-4 rounded-full font-semibold hover:bg-primary hover:text-white transition-all text-sm sm:text-base"
            >
              New Reservation
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <HeroSection
        image={imghero}
        title="Make a Reservation"
        subtitle="Book your table for an unforgettable dining experience"
        height="h-[40vh] sm:h-[50vh] md:h-[55vh]"
      />

      {/* Login Reminder Banner */}
      {!user && (
        <div className="bg-yellow-500/20 border border-yellow-500 mx-3 sm:mx-4 mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-center">
          <p className="text-yellow-500 text-xs sm:text-sm">
            🔐 Please <button onClick={() => navigate('/login')} className="underline font-semibold">login</button> to make a reservation. Your details will be auto-filled!
          </p>
        </div>
      )}

      {/* Reservation Form */}
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:shadow-large transition-all duration-300"
            >
              <FaClock className="text-2xl sm:text-3xl text-primary mx-auto mb-2 sm:mb-3" />
              <h3 className="text-text font-semibold text-sm sm:text-base mb-1">Opening Hours</h3>
              <p className="text-text/60 text-xs sm:text-sm">Ethiopian Time: 2:30 AM - 3:30 PM</p>
              <p className="text-text/60 text-xs sm:text-sm">Western Time: 8:30 PM - 9:30 AM</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:shadow-large transition-all duration-300"
            >
              <FaPhone className="text-2xl sm:text-3xl text-primary mx-auto mb-2 sm:mb-3" />
              <h3 className="text-text font-semibold text-sm sm:text-base mb-1">Call to Reserve</h3>
              <p className="text-text/60 text-xs sm:text-sm">+1 (555) 123-4567</p>
              <p className="text-text/60 text-xs sm:text-sm">Available 24/7</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:shadow-large transition-all duration-300"
            >
              <FaUsers className="text-2xl sm:text-3xl text-primary mx-auto mb-2 sm:mb-3" />
              <h3 className="text-text font-semibold text-sm sm:text-base mb-1">Group Booking</h3>
              <p className="text-text/60 text-xs sm:text-sm">For 8+ guests</p>
              <p className="text-text/60 text-xs sm:text-sm">Special arrangements available</p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-center text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-large"
          >
            <div className="bg-primary/10 p-4 sm:p-6 border-b border-border">
              <h2 className="text-xl sm:text-2xl font-bold text-text text-center">Book Your Table</h2>
              <p className="text-text/60 text-xs sm:text-sm text-center mt-1 sm:mt-2">Fill in the details below to secure your reservation (Ethiopian Time)</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Name */}
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                   placeholder="Email Address"
required
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    pattern="[0-9]{10}"
                    placeholder="Phone Number"
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary transition-all"
                  />
                  {formData.phone_number && formData.phone_number.length !== 10 && (
                    <p className="text-red-500 text-xs mt-1">Phone number must be exactly 10 digits</p>
                  )}
                </div>

                {/* Number of Guests */}
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                    <option value="10+">10+ Guests (Call for booking)</option>
                  </select>
                </div>

                {/* Date */}
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <input
                    type="date"
                    name="reservation_date"
                    value={formData.reservation_date}
                    onChange={handleChange}
                    required
                    min={today}
                    max={maxDateString}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Time - Ethiopian Time */}
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <select
                    name="reservation_time"
                    value={selectedTimeDisplay}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all"
                  >
                    <option value="">Select Ethiopian Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time} (Ethiopian)</option>
                    ))}
                  </select>
                </div>

                {/* Table Preference */}
                <div className="relative">
                  <FaChair className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <select
                    name="table_preference"
                    value={formData.table_preference}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all"
                  >
                    {tablePreferences.map(pref => (
                      <option key={pref.value} value={pref.value}>{pref.label}</option>
                    ))}
                  </select>
                </div>

                {/* Occasion */}
                <div className="relative">
                  <FaUtensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40 text-xs sm:text-sm" />
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary appearance-none cursor-pointer transition-all"
                  >
                    {occasions.map(occ => (
                      <option key={occ.value} value={occ.value}>{occ.label}</option>
                    ))}
                  </select>
                </div>

                {/* Special Requests - Full Width */}
                <div className="md:col-span-2 relative">
                  <FaComment className="absolute left-3 top-3 sm:top-4 text-text/40 text-xs sm:text-sm" />
                  <textarea
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleChange}
                    placeholder="Special requests (dietary restrictions, allergies, special arrangements...)"
                    rows="3"
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-bg border border-border rounded-lg sm:rounded-xl text-text text-sm sm:text-base focus:outline-none focus:border-primary resize-none transition-all"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-primary/80 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-6 sm:mt-8 shadow-button"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Confirm Reservation"
                )}
              </button>

              {/* Note */}
              <p className="text-center text-text/50 text-xs sm:text-sm mt-3 sm:mt-4">
                We'll send a confirmation email with your reservation details.
                Free cancellation up to 2 hours before (Ethiopian Time).
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reserv;