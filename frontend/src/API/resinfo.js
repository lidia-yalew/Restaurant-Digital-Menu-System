import { apiRequest, authRequest } from "./apiconfig";


// Public - Get all restaurant info
export const getRestaurantInfo = async () => {
  const response = await apiRequest("/restaurant/info");
  return response;
};

// IMPORTANT: This is what your component needs
export const updateSection = async (section, data) => {
  return await authRequest(`/restaurant/section/${section}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Convenience functions (optional)
export const updateHeroSection = async (data) => {
  return await updateSection('hero', data);
};

export const updateAboutSection = async (data) => {
  return await updateSection('about', data);
};

export const updateCtaSection = async (data) => {
  return await updateSection('cta', data);
};

export const updateSettings = async (data) => {
  return await updateSection('settings', data);
};

// Stats CRUD
export const addStat = async (stat) => {
  return await authRequest("/restaurant/stats", {
    method: "POST",
    body: JSON.stringify(stat),
  });
};

export const updateStat = async (id, stat) => {
  return await authRequest(`/restaurant/stats/${id}`, {
    method: "PUT",
    body: JSON.stringify(stat),
  });
};

export const deleteStat = async (id) => {
  return await authRequest(`/restaurant/stats/${id}`, {
    method: "DELETE",
  });
};

// Team CRUD
export const addTeamMember = async (member) => {
  return await authRequest("/restaurant/team", {
    method: "POST",
    body: JSON.stringify(member),
  });
};

export const updateTeamMember = async (id, member) => {
  return await authRequest(`/restaurant/team/${id}`, {
    method: "PUT",
    body: JSON.stringify(member),
  });
};

export const deleteTeamMember = async (id) => {
  return await authRequest(`/restaurant/team/${id}`, {
    method: "DELETE",
  });
};

// Milestones CRUD
export const addMilestone = async (milestone) => {
  return await authRequest("/restaurant/milestones", {
    method: "POST",
    body: JSON.stringify(milestone),
  });
};

export const updateMilestone = async (id, milestone) => {
  return await authRequest(`/restaurant/milestones/${id}`, {
    method: "PUT",
    body: JSON.stringify(milestone),
  });
};

export const deleteMilestone = async (id) => {
  return await authRequest(`/restaurant/milestones/${id}`, {
    method: "DELETE",
  });
};

// Values CRUD
export const addValue = async (value) => {
  return await authRequest("/restaurant/values", {
    method: "POST",
    body: JSON.stringify(value),
  });
};

export const updateValue = async (id, value) => {
  return await authRequest(`/restaurant/values/${id}`, {
    method: "PUT",
    body: JSON.stringify(value),
  });
};

export const deleteValue = async (id) => {
  return await authRequest(`/restaurant/values/${id}`, {
    method: "DELETE",
  });
};

// Initialize restaurant
export const initializeRestaurant = async (data) => {
  return await authRequest("/restaurant/initialize", {
    method: "POST",
    body: JSON.stringify(data),
  });
};