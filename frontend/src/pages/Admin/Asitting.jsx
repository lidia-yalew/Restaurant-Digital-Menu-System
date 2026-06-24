import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaInfoCircle, 
  FaUtensils, 
  FaUsers, 
  FaCalendarCheck, 
  FaClock, 
  FaPhoneAlt,
  FaArrowRight
} from 'react-icons/fa';

function AsettingsIndex() {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'restaurant', title: 'Restaurant Information', icon: FaInfoCircle, path: 'restaurant-info' },
    { id: 'menu', title: 'Menu Management', icon: FaUtensils, path: '/settings/menu' },
    { id: 'users', title: 'User Management', icon: FaUsers, path: '/settings/users' },
    { id: 'reservations', title: 'Reservations', icon: FaCalendarCheck, path: '/settings/reservations' },
    { id: 'hours', title: 'Business Hours', icon: FaClock, path: '/settings/hours' },
    { id: 'contact', title: 'Contact Information', icon: FaPhoneAlt, path: '/settings/contact' }
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-sm mb-6">Manage your restaurant preferences</p>
        
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <Icon className="text-primary text-lg" />
                  </div>
                  <span className="text-white font-medium">{item.title}</span>
                </div>
                <FaArrowRight className="text-gray-600 text-sm group-hover:text-primary transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AsettingsIndex;