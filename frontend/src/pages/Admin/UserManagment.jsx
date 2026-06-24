import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaUserCog,
  FaCrown,
  FaUserShield,
  FaFire,
  FaUser,
  FaArrowUp,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSave,
  FaUndo,
  FaUserGraduate
} from 'react-icons/fa';
import { getAllUsers, updateUserRole, deleteUser } from '../../API/userapi';
import { registerUser } from '../../API/authapi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [upgradingRole, setUpgradingRole] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer',
    full_name: '',
    phone: ''
  });

 // UserManagement.jsx - Update the roles array
const roles = [
  { value: 'admin', label: 'Admin', icon: <FaCrown className="text-purple-500" />, description: 'Full system access', color: 'purple' },
  { value: 'manager', label: 'Manager', icon: <FaUserShield className="text-blue-500" />, description: 'Manage orders, menu, reservations', color: 'blue' },
  { value: 'chef', label: 'Chef', icon: <FaFire className="text-orange-500" />, description: 'Update food status, view orders', color: 'orange' }, // Changed from 'kitchen' to 'chef'
  { value: 'customer', label: 'Customer', icon: <FaUser className="text-green-500" />, description: 'Order food online', color: 'green' }
];

// Update role hierarchy
const roleHierarchy = {
  customer: 0,
  chef: 1,      // Changed from kitchen to chef
  manager: 2,
  admin: 3
};

// Update role badge styles
const getRoleBadge = (role) => {
  const styles = {
    admin: 'bg-purple-500/20 text-purple-500 border-purple-500',
    manager: 'bg-blue-500/20 text-blue-500 border-blue-500',
    chef: 'bg-orange-500/20 text-orange-500 border-orange-500', // Changed from kitchen to chef
    customer: 'bg-green-500/20 text-green-500 border-green-500'
  };
  const icons = {
    admin: <FaCrown size={12} />,
    manager: <FaUserShield size={12} />,
    chef: <FaFire size={12} />, // Changed from kitchen to chef
    customer: <FaUser size={12} />
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[role] || styles.customer}`}>
      {icons[role]}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

// Update available upgrades
const getAvailableUpgrades = (currentRole) => {
  const upgrades = {
    customer: [
      { value: 'chef', label: 'Chef', icon: '🔥'},
      { value: 'manager', label: 'Manager', icon: '🛡️'},
      { value: 'admin', label: 'Admin', icon: '👑' }
      
    ],
    chef: [ // Changed from kitchen to chef
      { value: 'manager', label: 'Manager', icon: '🛡️' },
      { value: 'admin', label: 'Admin',icon: '👑' },
      { value: 'customer', label: 'customer' }
    ],
    manager: [
      { value: 'admin', label: 'Admin', icon: '👑'},
      { value: 'chef', label: 'Chef', icon: '🔥'},
      { value: 'customer', label: 'customer' }
    ],
    admin: []
  };
  return upgrades[currentRole] || [];
};

  useEffect(() => {
    fetchUsers();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Sort users by role hierarchy (admin first)
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    return roleHierarchy[b.role] - roleHierarchy[a.role];
  });

  const handleRoleUpgrade = async (userId, newRole) => {
    setUpgradingRole(userId);
    setError(null);
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
      const user = users.find(u => u.id === userId);
      setSuccessMessage(`✅ ${user?.username || 'User'}'s role updated to ${newRole} successfully!`);
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.message || 'Failed to update user role');
    } finally {
      setUpgradingRole(null);
    }
  };

  const handleDelete = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    // Prevent deleting admin users
    if (user.role === 'admin') {
      setError('❌ Cannot delete admin users');
      return;
    }

    const confirmMessage = `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      setDeletingUser(id);
      setError(null);
      try {
        await deleteUser(id);
        await fetchUsers();
        setSuccessMessage(`✅ User "${user.username}" deleted successfully`);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.message || 'Failed to delete user');
      } finally {
        setDeletingUser(null);
      }
    }
  };


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(Array.isArray(response) ? response : (response.data || response.users || []));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleStats = () => {
    const stats = {};
    users.forEach(user => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <div className="p-4 bg-bg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">User Management</h1>
            <p className="text-text/60 text-sm mt-1">
              Manage staff accounts. Users register as customers, admin can upgrade customers role.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all flex items-center gap-2 text-xs"
            >
              <FaUndo size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <FaExclamationTriangle className="text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <FaTimes />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <FaCheckCircle className="text-green-500" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-2 md:gap-2 mb-6">
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text/60 text-xs p-2">Total Users</p>
              <p className="text-2xl font-bold text-text pl-4">{users.length}</p>
            </div>
            
          </div>
        </div>
        {roles.map(role => (
          <div key={role.value} className="bg-card rounded-xl border border-border ">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl opacity-40 pl-3 md:pl-12">{role.icon}</div>
                <p className="text-text/60 text-xs capitalize md:pl-8 ">{role.label}s</p>
                <p className="text-2xl font-bold text-text pl-3 md:pl-12">{roleStats[role.value] || 0}</p>
                
              </div>
              
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary text-sm text-text"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-card  border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary text-sm text-text"
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <FaUsers className="text-4xl text-text/20 mx-auto mb-4" />
          <p className="text-text/60">No users found</p>
          <p className="text-text/40 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                
                <th className="text-left py-3 px-4 text-text/60 font-medium text-sm">Username</th>
                <th className="text-left py-3 px-4 text-text/60 font-medium text-sm">Full Name</th>
                <th className="text-left py-3 px-4 text-text/60 font-medium text-sm">Email</th>
                <th className="text-left py-3 px-4 text-text/60 font-medium text-sm">Phone</th>
                <th className="text-left py-3 px-4 text-text/60 font-medium text-sm">Current Role</th>
                <th className="text-left py-3 px-4 text-text/60 font-medium text-sm">Upgrade Role</th>
                <th className="text-left py-3 px-4 text-text/60 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => {
                const availableUpgrades = getAvailableUpgrades(user.role);
                const isCurrentUser = user.id === JSON.parse(localStorage.getItem('user') || '{}')?.id;
                
                return (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className={`border-b border-border/50 hover:bg-primary/5 transition-all ${isCurrentUser ? 'bg-primary/5' : ''}`}
                  >
                    
                    <td className="py-3 px-4 text-text text-sm font-medium">
                      {user.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text text-sm">{user.full_name || '-'}</td>
                    <td className="py-3 px-4 text-text text-sm">{user.email || '-'}</td>
                    <td className="py-3 px-4 text-text text-sm">{user.phone || '-'}</td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">
                      {availableUpgrades.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => handleRoleUpgrade(user.id, e.target.value)}
                            value=""
                            className="px-2 py-1 rounded-md text-xs bg-card text-text border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary min-w-[130px]"
                            disabled={upgradingRole === user.id}
                          >
                            <option value="" disabled>↑ Upgrade to...</option>
                            {availableUpgrades.map(upgrade => (
                              <option key={upgrade.value} value={upgrade.value}>
                                {upgrade.icon} {upgrade.label}
                              </option>
                            ))}
                          </select>
                          {upgradingRole === user.id && <FaSpinner className="animate-spin" />}
                        </div>
                      ) : (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <FaCheckCircle size={12} /> Highest Role
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                          user.role === 'admin' 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-500 hover:bg-red-500/10'
                        }`}
                        disabled={user.role === 'admin' || deletingUser === user.id}
                        title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                      >
                        {deletingUser === user.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaTrash size={14} />
                            Delete
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;