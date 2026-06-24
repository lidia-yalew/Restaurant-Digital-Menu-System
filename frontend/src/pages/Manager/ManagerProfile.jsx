import React, { useState, useEffect } from 'react';
import {
  FaUser, FaEdit, FaSave, FaTimes, FaSpinner,
  FaPhone, FaEnvelope, FaCamera, FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../../config/AuthContext';

const ManagerProfile = () => {
  const { user, logout,updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', profile_image: '' });

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

 const handleUpdateProfile = async () => {
  setLoading(true);
  try {
    const { updateProfile } = await import('../../API/authapi');
    const response = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      profile_image: formData.profile_image || null,
    });
    if (response.success) {
      updateUser(response.user);   // ← replaces the localStorage + window.updateAuthUser lines
      setEditing(false);
      alert('Profile updated successfully!');
    }
  } catch (error) {
    alert('Failed to update profile: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleCancelEdit = () => {
    setEditing(false);
    setFormData({
      full_name: user.full_name || user.username || '',
      phone: user.phone || '',
      email: user.email || '',
      profile_image: user.profile_image || '',
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
  };

  if (!user) return null;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-text mb-6">My Profile</h1>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Banner + avatar */}
          <div className="relative h-24 bg-gradient-to-r from-primary/30 to-primary/10">
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/30 text-white text-xs font-medium capitalize">
              {user.role}
            </span>

            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative group">
                <div className="w-30 h-30 rounded-full border-4 border-card bg-primary/20 flex items-center justify-center overflow-hidden">
                  {formData.profile_image ? (
                    <img src={formData.profile_image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary select-none">
                      {(formData.full_name || user.username || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {editing && (
                  <>
                    <label
                      htmlFor="manager-avatar-upload"
                      className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaCamera size={14} className="text-white" />
                      <span className="text-white text-[9px] mt-1">Change</span>
                    </label>
                    <input
                      id="manager-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <label
                      htmlFor="manager-avatar-upload"
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                    >
                      <FaCamera size={10} className="text-white" />
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Name + edit toggle */}
          <div className="pt-12 pb-4 px-6 text-center border-b border-border">
            <h3 className="text-lg font-bold text-text">{formData.full_name || user.username}</h3>
            <div className="flex items-center justify-center mt-1">
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-primary text-xs hover:text-primary/80 transition-all">
                  <FaEdit size={11} /> Edit
                </button>
              ) : (
                <button onClick={handleCancelEdit} className="flex items-center gap-1 text-red-400 text-xs hover:text-red-300">
                  <FaTimes size={11} /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="p-5 space-y-3">
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

          <div className="px-5 pb-5">
            <button
              onClick={logout}
              className="w-full bg-red-500/10 text-red-500 py-2.5 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <FaSignOutAlt size={13} /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
