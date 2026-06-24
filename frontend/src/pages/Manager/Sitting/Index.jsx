import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../config/AuthContext';
import {
  FaInfoCircle,
  FaUtensils,
  FaCalendarCheck,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';

function SettingsIndex() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const menuItems = [
    // Admin only
    ...(isAdmin ? [
      {
        id: 'restaurant-info',
        title: 'Restaurant Information',
        description: 'Edit public website content, team, milestones',
        path: 'restaurant-info',
        icon: FaInfoCircle,
        badge: 'Admin only',
      }
    ] : []),

    // Both admin and manager
    ...(isAdmin || isManager ? [
      {
        id: 'working-hours',
        title: 'Working Hours',
        description: 'Set opening and closing times',
        path: 'working-hours',
        icon: FaClock,
      },
      {
        id: 'tables',
        title: 'Table Configuration',
        description: 'Manage table count and capacity',
        path: 'tables',
        icon: FaUtensils,
      },
      {
        id: 'reservations-config',
        title: 'Reservation Settings',
        description: 'Booking window, auto-expire rules',
        path: 'reservations-config',
        icon: FaCalendarCheck,
      },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-primary mb-2">Settings</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your restaurant preferences</p>

        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-gray-800 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <Icon className="text-primary text-lg" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-text font-medium">{item.title}</span>
                      {item.badge && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <FaArrowRight className="text-text text-sm group-hover:text-primary transition-all shrink-0" />
              </button>
            );
          })}

          {menuItems.length === 0 && (
            <p className="text-center text-gray-500 py-8">No settings available for your role.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsIndex;