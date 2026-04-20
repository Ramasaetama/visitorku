import api from './api';

// ─── Admin Event ──────────────────────────────────────────────────────────────

export const getAllEvents = (params = {}) => {
  return api.get('/admin/event', { params });
};

export const getEventById = (id) => {
  return api.get(`/admin/event/${id}`);
};

export const createEvent = (payload) => {
  return api.post('/admin/event', payload);
};

export const updateEvent = (id, payload) => {
  return api.put(`/admin/event/${id}`, payload);
};

export const deleteEvent = (id) => {
  return api.delete(`/admin/event/${id}`);
};

export const finishEvent = (id) => {
  return api.post(`/admin/event/${id}/finish`);
};

export const getEventCheckInOutCount = (id) => {
  return api.get(`/admin/event/${id}/check-in-out-count`);
};

export const downloadEventExcel = (eventId) => {
  return api.get(`/admin/event/download/${eventId}/event-excel`, {
    responseType: 'blob',
  });
};

// ─── Admin Event Visitor ──────────────────────────────────────────────────────

export const getEventVisitors = (eventId, params = {}) => {
  return api.get(`/admin/event-visitor/${eventId}`, { params });
};

export const addEventVisitor = (payload) => {
  return api.post('/admin/event-visitor', payload);
};

export const getEventVisitorById = (id) => {
  return api.get(`/admin/event-visitor/show/${id}`);
};

export const updateEventVisitor = (id, payload) => {
  return api.put(`/admin/event-visitor/${id}`, payload);
};

export const deleteEventVisitor = (id) => {
  return api.delete(`/admin/event-visitor/${id}`);
};

// ─── Admin Event Feedback ─────────────────────────────────────────────────────

export const getEventFeedbackList = (eventId, params = {}) => {
  return api.get(`/admin/event-feedback/${eventId}/list`, { params });
};

export const getEventSatisfaction = (eventId) => {
  return api.get(`/admin/event-feedback/${eventId}/satisfaction`);
};

export const getEventFeedbackDetail = (id) => {
  return api.get(`/admin/event-feedback/${id}`);
};

export const downloadEventFeedbackExcel = (eventId) => {
  return api.get(`/admin/event-feedback/download/${eventId}/event-excel`, {
    responseType: 'blob',
  });
};
