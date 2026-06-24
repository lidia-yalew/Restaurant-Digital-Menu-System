import { apiRequest, authRequest } from "./apiconfig";

// Public - Create reservation
export const createReservation = (payload) => {
  // Fix: Use ethiopian_time_display from payload
  const enhancedPayload = {
    ...payload,
    original_time_ethiopian: payload.reservation_time,
    timezone: 'Africa/Addis_Ababa'
  };
  return apiRequest("/reservations", { method: "POST", body: enhancedPayload });
};
// Protected - Get all reservations (admin/manager)
export const getReservations = () => authRequest("/reservations");

// Protected - Get reservation by ID
export const getReservationById = (id) => authRequest(`/reservations/${id}`);

// Protected - Update reservation status
export const updateReservationStatus = (id, status, extra = {}) =>
  authRequest(`/reservations/${id}/status`, { method: "PATCH", body: { status, ...extra } });

export const updateReservation = (id, data) =>
  authRequest(`/reservations/${id}`, { method: 'PATCH', body: data });

// Protected - Delete reservation
export const deleteReservation = (id) =>
  authRequest(`/reservations/${id}`, { method: "DELETE" });