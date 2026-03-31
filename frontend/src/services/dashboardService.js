import api from './api';

export const getDashboardCounters = async () => {
  return await api.get('/admin/dashboard/counter');
};

export const getWeeklyData = async () => {
  return await api.get('/admin/dashboard/weekly-data');
};

export const getMonthlyData = async () => {
  return await api.get('/admin/dashboard/monthly-data');
};

export const getCategoryData = async () => {
  return await api.get('/admin/dashboard/category-data');
};