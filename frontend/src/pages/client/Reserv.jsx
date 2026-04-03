import React, { useState } from "react";
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
  FaCheckCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import img2 from "../../assets/IMG/imag2.png";

const Reserv = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    occasion: "regular",
    specialRequests: "",
    tablePreference: "any"
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Available time slots
  const timeSlots = [
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM",
    "1:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
    "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"
  ];

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="text-4xl text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Reservation Confirmed!</h2>
          <p className="text-gray-300 mb-6">
            Thank you, {formData.name}! Your reservation has been confirmed for {formData.date} at {formData.time}.
          </p>
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-gray-400 text-sm mb-2">Reservation Details:</p>
            <p className="text-white"><span className="text-primary">Date:</span> {formData.date}</p>
            <p className="text-white"><span className="text-primary">Time:</span> {formData.time}</p>
            <p className="text-white"><span className="text-primary">Guests:</span> {formData.guests} people</p>
            <p className="text-white"><span className="text-primary">Table:</span> {tablePreferences.find(t => t.value === formData.tablePreference)?.label}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/menu")}
              className="flex-1 bg-primary text-white py-2 rounded-full font-semibold hover:bg-primary/80 transition-all"
            >
              View Menu
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: "", email: "", phone: "", date: "", time: "",
                  guests: "2", occasion: "regular", specialRequests: "", tablePreference: "any"
                });
              }}
              className="flex-1 border-2 border-primary text-primary py-2 rounded-full font-semibold hover:bg-primary hover:text-white transition-all"
            >
              New Reservation
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10"></div>
        <img
          src={img2}
          alt="Reservation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Make a Reservation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-200"
            >
              Book your table for an unforgettable dining experience
            </motion.p>
          </div>
        </div>
      </div>

      {/* Reservation Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700"
            >
              <FaClock className="text-3xl text-primary mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Opening Hours</h3>
              <p className="text-gray-400 text-sm">Mon - Fri: 11:00 AM - 10:00 PM</p>
              <p className="text-gray-400 text-sm">Sat - Sun: 10:00 AM - 11:00 PM</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700"
            >
              <FaPhone className="text-3xl text-primary mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Call to Reserve</h3>
              <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
              <p className="text-gray-400 text-sm">Available 9 AM - 9 PM</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700"
            >
              <FaUsers className="text-3xl text-primary mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Group Booking</h3>
              <p className="text-gray-400 text-sm">For 8+ guests</p>
              <p className="text-gray-400 text-sm">Special arrangements available</p>
            </motion.div>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700 overflow-hidden"
          >
            <div className="bg-primary/10 p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white text-center">Book Your Table</h2>
              <p className="text-gray-300 text-center mt-2">Fill in the details below to secure your reservation</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Phone Number"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Number of Guests */}
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                    <option value="10+">10+ Guests (Call for booking)</option>
                  </select>
                </div>

                {/* Date */}
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={today}
                    max={maxDateString}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Time */}
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Table Preference */}
                <div className="relative">
                  <FaChair className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="tablePreference"
                    value={formData.tablePreference}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {tablePreferences.map(pref => (
                      <option key={pref.value} value={pref.value}>{pref.label}</option>
                    ))}
                  </select>
                </div>

                {/* Occasion */}
                <div className="relative">
                  <FaUtensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {occasions.map(occ => (
                      <option key={occ.value} value={occ.value}>{occ.label}</option>
                    ))}
                  </select>
                </div>

                {/* Special Requests - Full Width */}
                <div className="md:col-span-2 relative">
                  <FaComment className="absolute left-3 top-4 text-gray-400" />
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Special requests (dietary restrictions, allergies, special arrangements...)"
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-primary resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/80 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Confirm Reservation"
                  )}
                </button>
              </div>

              {/* Note */}
              <p className="text-center text-gray-400 text-sm mt-4">
                We'll send a confirmation email with your reservation details.
                Free cancellation up to 2 hours before.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Reserv;