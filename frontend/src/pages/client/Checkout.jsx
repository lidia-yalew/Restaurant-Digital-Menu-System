import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCreditCard,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaRegClock
} from 'react-icons/fa';
import { useAuth } from '../../config/AuthContext';
import { createOrderService } from '../../service/orderservice';
import { useCreate } from '../../Hook/useinsert';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderResponse, setOrderResponse] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    table_number: '',
    notes: '',
    payment_method: 'cash'
  });

  // Use your existing useCreate hook
  const { handleCreate, loading: orderLoading, error } = useCreate(createOrderService);

  // Load cart from location state or localStorage
  useEffect(() => {
    if (location.state?.cart) {
      setCart(location.state.cart);
      setTotal(location.state.total);
      // Save to localStorage for backup
      localStorage.setItem('checkoutCart', JSON.stringify(location.state.cart));
    } else {
      const savedCart = localStorage.getItem('checkoutCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        setTotal(parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
      } else {
        navigate('/menu');
      }
    }
  }, [location, navigate]);

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.full_name || user.username || '',
        phone_number: user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      const newCart = cart.filter(item => item.id !== itemId);
      setCart(newCart);
      const newTotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotal(newTotal);
      localStorage.setItem('checkoutCart', JSON.stringify(newCart));
    } else {
      const newCart = cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCart(newCart);
      const newTotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotal(newTotal);
      localStorage.setItem('checkoutCart', JSON.stringify(newCart));
    }
  };

  const removeItem = (itemId) => {
    const newCart = cart.filter(item => item.id !== itemId);
    setCart(newCart);
    const newTotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
    localStorage.setItem('checkoutCart', JSON.stringify(newCart));
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.customer_name || !formData.customer_name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!formData.phone_number || !formData.phone_number.trim()) {
      alert('Please enter your phone number');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Format order data correctly for backend
    const orderData = {
      customer_name: formData.customer_name.trim(),
      phone_number: formData.phone_number.trim(),
      table_number: parseInt(formData.table_number) || 1,
      notes: formData.notes || '',
      total_amount: total,
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }))
    };

    console.log('Sending order data:', orderData);

    try {
      const response = await handleCreate(orderData);
      console.log('Order response:', response);
      setOrderResponse(response);
      setOrderNumber(response.id || Math.floor(Math.random() * 10000));
      setOrderPlaced(true);
      
      // Clear cart
      localStorage.removeItem('checkoutCart');
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Order failed:', err);
      alert(err.message || 'Failed to place order. Please try again.');
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 text-center border border-gray-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 md:w-20 md:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FaCheckCircle className="text-3xl md:text-4xl text-white" />
          </motion.div>
          
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-400 text-sm md:text-base mb-4">Thank you for your order</p>
          
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-xs md:text-sm">Order Number</p>
            <p className="text-xl md:text-2xl font-bold text-primary">#{orderNumber}</p>
          </div>
          
          <div className="space-y-2 text-left mb-6 text-sm md:text-base">
            <p className="text-gray-300">📧 Confirmation sent to {formData.phone_number}</p>
            <p className="text-gray-300 flex items-center gap-2">
              <FaRegClock className="text-primary" />
              Estimated preparation time: 20-30 minutes
            </p>
            <p className="text-gray-300">📍 Please wait at Table {formData.table_number || 'counter'}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/menu')}
              className="bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/80 transition-all sm:flex-1"
            >
              Order More
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all sm:flex-1"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-16 md:pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate('/menu')}
            className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition-all text-sm md:text-base"
          >
            <FaArrowLeft size={14} className="md:text-base" /> Back to Menu
          </button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Checkout</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Review your order and complete payment</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Order Summary - Left Side */}
          <div className="flex-1 space-y-6">
            {/* Cart Items */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Order Summary</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="mt-4 text-primary hover:underline text-sm"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-gray-700/30 rounded-xl">
                      {/* Item Image */}
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[10px] text-gray-400">No img</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-semibold text-white truncate">{item.name}</h3>
                        <p className="text-primary text-xs md:text-sm">${item.price}</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 md:w-7 md:h-7 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-all"
                        >
                          <FaMinus size={8} className="md:text-[10px] text-white" />
                        </button>
                        <span className="text-white text-sm md:text-base w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 md:w-7 md:h-7 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-all"
                        >
                          <FaPlus size={8} className="md:text-[10px] text-white" />
                        </button>
                      </div>
                      
                      {/* Item Total & Remove */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-sm md:text-base font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 text-[10px] md:text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Customer Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaUser className="inline mr-2 text-primary" /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full px-3 md:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary text-sm md:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaPhone className="inline mr-2 text-primary" /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-3 md:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary text-sm md:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaMapMarkerAlt className="inline mr-2 text-primary" /> Table Number
                  </label>
                  <input
                    type="number"
                    name="table_number"
                    value={formData.table_number}
                    onChange={handleInputChange}
                    placeholder="Enter table number (if dining in)"
                    className="w-full px-3 md:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default table 1 if not specified</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Special Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any special requests or dietary restrictions?"
                    className="w-full px-3 md:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary resize-none text-sm md:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Total - Right Side */}
          <div className="lg:w-80 xl:w-96">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 md:p-6 sticky top-24">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Order Total</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm md:text-base text-gray-300">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base text-gray-300">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-base md:text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_method: 'cash' }))}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm md:text-base ${
                      formData.payment_method === 'cash'
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <FaMoneyBillWave />
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_method: 'card' }))}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm md:text-base ${
                      formData.payment_method === 'card'
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <FaCreditCard />
                    Card
                  </button>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading || cart.length === 0}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {orderLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;