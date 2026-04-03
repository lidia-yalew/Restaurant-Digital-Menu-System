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
  FaCheckDouble
} from 'react-icons/fa';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      table: 5,
      items: [
        { name: "Margherita Pizza", quantity: 2, status: "preparing", time: 15 },
        { name: "Greek Salad", quantity: 1, status: "pending", time: 10 }
      ],
      status: "preparing",
      timeReceived: "10:30 AM",
      estimatedTime: "10:45 AM"
    },
    {
      id: 2,
      table: 3,
      items: [
        { name: "Grilled Salmon", quantity: 1, status: "pending", time: 20 },
        { name: "Mango Smoothie", quantity: 2, status: "pending", time: 5 }
      ],
      status: "pending",
      timeReceived: "10:45 AM",
      estimatedTime: "11:05 AM"
    },
    {
      id: 3,
      table: 7,
      items: [
        { name: "Chocolate Cake", quantity: 1, status: "ready", time: 10 },
        { name: "Coffee", quantity: 2, status: "ready", time: 3 }
      ],
      status: "ready",
      timeReceived: "11:00 AM",
      estimatedTime: "11:10 AM"
    }
  ]);

  const [stats, setStats] = useState({
    totalOrders: 8,
    preparing: 3,
    pending: 4,
    completed: 1,
    avgPrepTime: 12
  });

  const updateItemStatus = (orderId, itemName, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.name === itemName ? { ...item, status: newStatus } : item
              )
            }
          : order
      )
    );
  };

  const updateOrderStatus = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    const allItemsReady = order.items.every(item => item.status === 'ready');
    
    if (allItemsReady) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'ready' }
            : order
        )
      );
    }
  };

  const completeOrder = (orderId) => {
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'preparing': return <FaSpinner className="animate-spin text-blue-500" />;
      case 'ready': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      default: return <FaHourglassHalf className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kitchen Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time order management for kitchen staff</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all">
              Refresh Orders
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
            </div>
            <FaUtensils className="text-blue-500 text-3xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
            </div>
            <FaClock className="text-yellow-500 text-3xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Preparing</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.preparing}</h3>
            </div>
            <FaSpinner className="text-blue-500 text-3xl opacity-50 animate-spin" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ready</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
            </div>
            <FaCheckCircle className="text-green-500 text-3xl opacity-50" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Prep Time</p>
              <h3 className="text-2xl font-bold text-purple-600">{stats.avgPrepTime} min</h3>
            </div>
            <FaHourglassHalf className="text-purple-500 text-3xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Order Header */}
              <div className={`p-4 border-b ${getStatusColor(order.status)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">Table {order.table}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-medium capitalize">{order.status}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Received: {order.timeReceived}</span>
                  <span>Est. Ready: {order.estimatedTime}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{item.quantity}x</span>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Prep time: {item.time} min</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => {
                            updateItemStatus(order.id, item.name, e.target.value);
                            updateOrderStatus(order.id);
                          }}
                          className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)} focus:outline-none`}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="p-4 bg-gray-50 border-t">
                {order.status === 'ready' ? (
                  <button
                    onClick={() => completeOrder(order.id)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                  >
                    <FaCheckDouble /> Complete Order
                  </button>
                ) : (
                  <div className="text-center text-gray-500 text-sm">
                    <FaBell className="inline mr-1" />
                    Preparing in progress...
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-12">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">All Orders Completed!</h3>
          <p className="text-gray-500">Great job! No pending orders in the kitchen.</p>
        </div>
      )}

      {/* Real-time Update Simulation */}
      <div className="mt-8 bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Real-time:</span> Kitchen is connected. Orders update automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboard;