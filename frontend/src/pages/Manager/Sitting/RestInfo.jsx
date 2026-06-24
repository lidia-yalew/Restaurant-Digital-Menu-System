import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaSpinner, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { getRestaurantInfo } from '../../../API/resinfo';


import {
  updateSection,
  addStat,
  updateStat,
  deleteStat,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addValue,        // Add this
  updateValue,     // Add this
  deleteValue      // Add this
} from '../../../API/resinfo';
import { useAuth } from '../../../config/AuthContext';

function RestaurantInfo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  
  // Separate state for different sections
  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    button_text: '',
    button_link: ''
  });
  
  const [aboutData, setAboutData] = useState({
    title: '',
    description_1: '',
    description_2: '',
    description_3: '',
    image_url: ''
  });
  

  
  const [settingsData, setSettingsData] = useState({
    restaurant_name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [stats, setStats] = useState([]);
  const [values, setValues] = useState([]);
  const [team, setTeam] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [editingStat, setEditingStat] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  

useEffect(() => {
  if (user?.role !== 'admin') {
    navigate('/manager/dashboard');
  }
}, [user]);
  const fetchData = async () => {
    try {
      const response = await getRestaurantInfo();
      let data = response;
      if (response.success && response.data) {
        data = response.data;
      }
      
      // Set section data
      setHeroData({
        title: data.hero_title || '',
        subtitle: data.hero_subtitle || '',
        image_url: data.hero_image || '',
        button_text: data.hero_button_text || '',
        button_link: data.hero_button_link || ''
      });
      
      setAboutData({
        title: data.about_title || '',
        description_1: data.about_description_1 || '',
        description_2: data.about_description_2 || '',
        description_3: data.about_description_3 || '',
        image_url: data.about_image || ''
      });
      
   
      
      setSettingsData({
        restaurant_name: data.restaurant_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || ''
      });
      
      setStats(data.stats || []);
      setValues(data.values || []);
      setTeam(data.team || []);
      setMilestones(data.milestones || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  // Save section handlers
  const saveHeroSection = async () => {
    setSaving(true);
    try {
      await updateSection('hero', heroData);
      alert('Hero section updated successfully!');
    } catch (error) {
      console.error('Error saving hero section:', error);
      alert('Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  const saveAboutSection = async () => {
    setSaving(true);
    try {
      await updateSection('about', aboutData);
      alert('About section updated successfully!');
    } catch (error) {
      console.error('Error saving about section:', error);
      alert('Failed to save about section');
    } finally {
      setSaving(false);
    }
  };



  const saveSettings = async () => {
    setSaving(true);
    try {
      await updateSection('settings', settingsData);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Stats CRUD
  const handleAddStat = async () => {
    const newStat = {
      number: 'New',
      label: 'New Stat',
      icon_name: 'FaStar',
      display_order: stats.length
    };
    try {
      const result = await addStat(newStat);
      setStats([...stats, result.data || result]);
      setEditingStat(stats.length);
    } catch (error) {
      console.error('Error adding stat:', error);
      alert('Failed to add stat');
    }
  };

  const handleUpdateStat = async (id, data) => {
    try {
      const result = await updateStat(id, data);
      setStats(stats.map(stat => stat.id === id ? (result.data || result) : stat));
      setEditingStat(null);
    } catch (error) {
      console.error('Error updating stat:', error);
      alert('Failed to update stat');
    }
  };

  const handleDeleteStat = async (id) => {
    if (window.confirm('Are you sure you want to delete this stat?')) {
      try {
        await deleteStat(id);
        setStats(stats.filter(stat => stat.id !== id));
      } catch (error) {
        console.error('Error deleting stat:', error);
        alert('Failed to delete stat');
      }
    }
  };
// Values CRUD
const handleAddValue = async () => {
  const newValue = {
    title: 'New Value',
    description: 'Description',
    icon_name: 'FaHeart',
    display_order: values.length
  };
  try {
    const result = await addValue(newValue);
    setValues([...values, result.data || result]);
    setEditingValue(values.length);
  } catch (error) {
    console.error('Error adding value:', error);
    alert('Failed to add value');
  }
};

const handleUpdateValue = async (id, data) => {
  try {
    const result = await updateValue(id, data);
    setValues(values.map(value => value.id === id ? (result.data || result) : value));
    setEditingValue(null);
  } catch (error) {
    console.error('Error updating value:', error);
    alert('Failed to update value');
  }
};

const handleDeleteValue = async (id) => {
  if (window.confirm('Are you sure you want to delete this value?')) {
    try {
      await deleteValue(id);
      setValues(values.filter(value => value.id !== id));
    } catch (error) {
      console.error('Error deleting value:', error);
      alert('Failed to delete value');
    }
  }
};
  // Team CRUD
  const handleAddTeam = async () => {
    const newMember = {
      name: 'New Chef',
      role: 'Chef',
      description: 'Description',
      image_url: '',
      email: '',
      display_order: team.length
    };
    try {
      const result = await addTeamMember(newMember);
      setTeam([...team, result.data || result]);
      setEditingTeam(team.length);
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member');
    }
  };

  const handleUpdateTeam = async (id, data) => {
    try {
      const result = await updateTeamMember(id, data);
      setTeam(team.map(member => member.id === id ? (result.data || result) : member));
      setEditingTeam(null);
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(id);
        setTeam(team.filter(member => member.id !== id));
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Failed to delete team member');
      }
    }
  };

  // Milestones CRUD
  const handleAddMilestone = async () => {
    const newMilestone = {
      year: '2024',
      title: 'New Milestone',
      description: 'Description',
      display_order: milestones.length
    };
    try {
      const result = await addMilestone(newMilestone);
      setMilestones([...milestones, result.data || result]);
      setEditingMilestone(milestones.length);
    } catch (error) {
      console.error('Error adding milestone:', error);
      alert('Failed to add milestone');
    }
  };

  const handleUpdateMilestone = async (id, data) => {
    try {
      const result = await updateMilestone(id, data);
      setMilestones(milestones.map(m => m.id === id ? (result.data || result) : m));
      setEditingMilestone(null);
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await deleteMilestone(id);
        setMilestones(milestones.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error deleting milestone:', error);
        alert('Failed to delete milestone');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', name: 'Hero Section' },
    { id: 'about', name: 'About Section' },
    { id: 'stats', name: 'Stats' },
    { id: 'values', name: 'Values' },
    { id: 'team', name: 'Expert chefs' },
    { id: 'milestones', name: 'Milestones' },
    
    { id: 'settings', name: 'R-Profile' }
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/manager/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-primary mb-6">Restaurant Information Manager</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-2 ">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-all bg-card text-text ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hero Title</label>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => setHeroData({...heroData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hero Subtitle</label>
                <textarea
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({...heroData, subtitle: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={heroData.image_url}
                  onChange={(e) => setHeroData({...heroData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveHeroSection}
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/80 flex items-center gap-2"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Hero Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About Section Tab */}
        {activeTab === 'about' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">About Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">About Title</label>
                <input
                  type="text"
                  value={aboutData.title}
                  onChange={(e) => setAboutData({...aboutData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description 1</label>
                <textarea
                  value={aboutData.description_1}
                  onChange={(e) => setAboutData({...aboutData, description_1: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description 2</label>
                <textarea
                  value={aboutData.description_2}
                  onChange={(e) => setAboutData({...aboutData, description_2: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description 3</label>
                <textarea
                  value={aboutData.description_3}
                  onChange={(e) => setAboutData({...aboutData, description_3: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">About Image URL</label>
                <input
                  type="text"
                  value={aboutData.image_url}
                  onChange={(e) => setAboutData({...aboutData, image_url: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveAboutSection}
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/80 flex items-center gap-2"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save About Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Statistics</h2>
              <button
                onClick={handleAddStat}
                className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30"
              >
                <FaPlus size={12} /> Add Stat
              </button>
            </div>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={stat.id} className="border border-gray-700 rounded-lg p-4">
                  {editingStat === index ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={stat.number}
                        onChange={(e) => setStats(stats.map(s => s.id === stat.id ? {...s, number: e.target.value} : s))}
                        placeholder="Number"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => setStats(stats.map(s => s.id === stat.id ? {...s, label: e.target.value} : s))}
                        placeholder="Label"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <select
                        value={stat.icon_name}
                        onChange={(e) => setStats(stats.map(s => s.id === stat.id ? {...s, icon_name: e.target.value} : s))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="FaClock">Clock</option>
                        <option value="FaUsers">Users</option>
                        <option value="FaUtensils">Utensils</option>
                        <option value="FaAward">Award</option>
                        <option value="FaStar">Star</option>
                        <option value="FaHeart">Heart</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStat(stat.id, stat)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStat(null)}
                          className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{stat.number}</p>
                        <p className="text-white">{stat.label}</p>
                        <p className="text-xs text-gray-400">{stat.icon_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingStat(index)}
                          className="p-2 text-blue-400 hover:text-blue-300"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteStat(stat.id)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
{/* Values Tab */}
{activeTab === 'values' && (
  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-white">Core Values</h2>
      <button
        onClick={handleAddValue}
        className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30"
      >
        <FaPlus size={12} /> Add Value
      </button>
    </div>
    <div className="space-y-4">
      {values.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No values added yet. Click "Add Value" to create your first core value.
        </div>
      ) : (
        values.map((value, index) => (
          <div key={value.id} className="border border-gray-700 rounded-lg p-4">
            {editingValue === index ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={value.title}
                  onChange={(e) => setValues(values.map(v => v.id === value.id ? {...v, title: e.target.value} : v))}
                  placeholder="Title"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <textarea
                  value={value.description}
                  onChange={(e) => setValues(values.map(v => v.id === value.id ? {...v, description: e.target.value} : v))}
                  placeholder="Description"
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <select
                  value={value.icon_name}
                  onChange={(e) => setValues(values.map(v => v.id === value.id ? {...v, icon_name: e.target.value} : v))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="FaHeart">Heart (Passion)</option>
                  <option value="FaLeaf">Leaf (Fresh)</option>
                  <option value="FaStar">Star (Quality)</option>
                  <option value="FaTruck">Truck (Delivery)</option>
                  <option value="FaUsers">Users (Community)</option>
                  <option value="FaAward">Award (Excellence)</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateValue(value.id, value)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingValue(null)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-primary">{value.title}</p>
                  <p className="text-white mt-1">{value.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Icon: {value.icon_name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingValue(index)}
                    className="p-2 text-blue-400 hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteValue(value.id)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </div>
)}
        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Team Members</h2>
              <button
                onClick={handleAddTeam}
                className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30"
              >
                <FaPlus size={12} /> Add Team Member
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.map((member, index) => (
                <div key={member.id} className="border border-gray-700 rounded-lg p-4">
                  {editingTeam === index ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => setTeam(team.map(m => m.id === member.id ? {...m, name: e.target.value} : m))}
                        placeholder="Name"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => setTeam(team.map(m => m.id === member.id ? {...m, role: e.target.value} : m))}
                        placeholder="Role"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <textarea
                        value={member.description}
                        onChange={(e) => setTeam(team.map(m => m.id === member.id ? {...m, description: e.target.value} : m))}
                        placeholder="Description"
                        rows="2"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={member.image_url}
                        onChange={(e) => setTeam(team.map(m => m.id === member.id ? {...m, image_url: e.target.value} : m))}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateTeam(member.id, member)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTeam(null)}
                          className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{member.name}</p>
                          <p className="text-sm text-primary">{member.role}</p>
                          <p className="text-xs text-gray-400 mt-1">{member.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTeam(index)}
                            className="p-2 text-blue-400 hover:text-blue-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(member.id)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
{/* Milestones Tab */}
{activeTab === 'milestones' && (
  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-white">Milestones</h2>
      <button
        onClick={handleAddMilestone}
        className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-1 rounded-lg hover:bg-primary/30"
      >
        <FaPlus size={12} /> Add Milestone
      </button>
    </div>
    <div className="space-y-4">
      {milestones.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No milestones added yet. Click "Add Milestone" to create your first milestone.
        </div>
      ) : (
        milestones.map((milestone, index) => (
          <div key={milestone.id} className="border border-gray-700 rounded-lg p-4">
            {editingMilestone === index ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={milestone.year}
                  onChange={(e) => setMilestones(milestones.map(m => m.id === milestone.id ? {...m, year: e.target.value} : m))}
                  placeholder="Year (e.g., 2020)"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <input
                  type="text"
                  value={milestone.title}
                  onChange={(e) => setMilestones(milestones.map(m => m.id === milestone.id ? {...m, title: e.target.value} : m))}
                  placeholder="Title"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <textarea
                  value={milestone.description}
                  onChange={(e) => setMilestones(milestones.map(m => m.id === milestone.id ? {...m, description: e.target.value} : m))}
                  placeholder="Description"
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateMilestone(milestone.id, milestone)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingMilestone(null)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold text-primary">{milestone.year}</p>
                  <p className="text-lg font-semibold text-white">{milestone.title}</p>
                  <p className="text-gray-400 mt-1">{milestone.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingMilestone(index)}
                    className="p-2 text-blue-400 hover:text-blue-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </div>
)}
       

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Restaurant Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={settingsData.restaurant_name}
                  onChange={(e) => setSettingsData({...settingsData, restaurant_name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={settingsData.email}
                  onChange={(e) => setSettingsData({...settingsData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={settingsData.phone}
                  onChange={(e) => setSettingsData({...settingsData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Address</label>
                <textarea
                  value={settingsData.address}
                  onChange={(e) => setSettingsData({...settingsData, address: e.target.value})}
                  rows="2"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/80 flex items-center gap-2"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantInfo;