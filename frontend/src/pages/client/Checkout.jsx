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
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaRegClock,
  FaUser,
  FaPhone,
  FaUtensils,
  FaImage
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
  const [imageErrors, setImageErrors] = useState({});
  
  const [formData, setFormData] = useState({
    table_number: '',
    notes: '',
    payment_method: 'cash'
  });

  const { handleCreate, loading: orderLoading, error } = useCreate(createOrderService);

  // Load cart
  useEffect(() => {
    const loadCart = () => {
      if (location.state?.cart) {
        console.log('Loading cart from location.state:', location.state.cart);
        setCart(location.state.cart);
        setTotal(location.state.total);
        localStorage.setItem('checkoutCart', JSON.stringify(location.state.cart));
      } else {
        const savedCart = localStorage.getItem('checkoutCart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('Loading cart from localStorage:', parsedCart);
          setCart(parsedCart);
          setTotal(parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
        } else {
          navigate('/menu');
        }
      }
    };
    
    loadCart();
  }, [location, navigate]);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      alert('Please login to place an order');
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [user, navigate]);

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
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const orderData = {
      customer_name: user.full_name || user.username || 'Customer',
      phone_number: user.phone || '',
      table_number: parseInt(formData.table_number) || 1,
      notes: formData.notes || '',
      total_amount: total,
      user_id: user.id,
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }))
    };

    console.log('Sending order data:', orderData);

    try {
      const response = await handleCreate(orderData);
      setOrderNumber(response.id || Math.floor(Math.random() * 10000));
      setOrderPlaced(true);
      
      localStorage.removeItem('checkoutCart');
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Order failed:', err);
      alert(err.message || 'Failed to place order. Please try again.');
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

 // REPLACE getImageUrl in Checkout.jsx:
const getImageUrl = (item) => {
  const imageUrl = item.image_url || item.image || item.imageUrl || item.img;
  if (!imageUrl || imageErrors[item.id]) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:1994${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please login to continue with checkout</p>
          <button
            onClick={() => navigate('/login', { state: { from: '/checkout' } })}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

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
          <p className="text-gray-400 text-sm md:text-base mb-4">Thank you, {user?.full_name || user?.username}!</p>
          
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-xs md:text-sm">Order Number</p>
            <p className="text-xl md:text-2xl font-bold text-primary">#{orderNumber}</p>
          </div>
          
          <div className="space-y-2 text-left mb-6 text-sm md:text-base">
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
      <div className=" container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Checkout</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Review your order and complete payment</p>
        </div>

        {/* User Info Summary */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2">
            <FaUser className="text-primary" />
            <span className="text-white">Ordering as: <strong>{user?.full_name || user?.username}</strong></span>
          </div>
        </div>
</div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Order Summary - Left Side */}
          <div className="flex-1">
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
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-700/30 rounded-xl">
                      {/* Image Section */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                        {getImageUrl(item) ? (
                          <img
                            src={getImageUrl(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(item.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/30 to-primary/20">
                            <FaUtensils className="text-gray-400 text-2xl mb-1" />
                            <span className="text-[10px] text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-semibold text-white">{item.name}</h3>
                      
                        {item.description && (
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
                          >
                            <FaMinus size={10} className="text-white" />
                          </button>
                          <span className="text-white font-semibold min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors"
                          >
                            <FaPlus size={10} className="text-white" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {(item.price * item.quantity).toFixed(2)} ETB
                          </p>
                          
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Total - Right Side */}
          <div className="lg:w-80 xl:w-96">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 md:p-6 sticky top-24">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Order Total</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>{total.toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (0%)</span>
                  <span>0.00 ETB</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{total.toFixed(2)} ETB</span>
                  </div>
                </div>
              </div>

              {/* Table Number */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-primary" /> Table Number (Optional)
                </label>
              <input
  type="number"
  name="table_number"
  value={formData.table_number}
  onChange={handleInputChange}
  placeholder="Enter table number for dine-in"
  min="1"
  max="25"
  step="1"
  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
/>

                <p className="text-xs text-gray-500 mt-1">Leave empty for takeaway</p>
              </div>

              {/* Special Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Special Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requests? (allergies, preferences, etc.)"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payment_method: 'cash' }))}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
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
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg border transition-all ${
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
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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