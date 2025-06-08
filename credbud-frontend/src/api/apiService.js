import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:1234/api/v1',
});
// Interceptors to attach tokens if needed
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken'); // Assuming you save a token in cookies
  const apiKey = Cookies.get('x-api-key'); // Assuming you save a token in cookies
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Api-Key'] = apiKey;
  }
  return config;
});

export const login = async (userType) => {
  const now = new Date();
  const response = await api.get(`/auth/login/?userType=${userType}`);
  if (response.data) {
    Cookies.set('x-api-key', response.data.customToken, { secure: true, sameSite: "strict" });
    localStorage.setItem('userProfile', JSON.stringify({ data: response.data.user, expiry: now.getTime() + (10 * 60 * 1000) }));
  }
  //   return response.data;

};

export const fetchUserData = async () => {
  const response = await api.get(`/user/profile`);
  return response.data;
};
export const searchUser = async (searchQuery, searchField, userType) => {
  const response = await api.post(`/user/search`, { searchQuery, searchField, userType });
  return response.data.result;
};

export const getUserAttendance = async (id, department, division, subject, admissionYear, searchType) => {
  const response = await api.post(`/attendance/fetch`, { id, department, division, subject, admissionYear, searchType });
  return response.data;
};


export const uploadData = async (data) => {
  const response = await api.post(`/user/add`, data);
  return response.data;
};
export const updateTerm = async (data) => {
  const response = await api.post(`/user/updateSemester`, data);
  return response.data;
};
export const updateRemarks = async (data) => {
  const response = await api.post(`/grant/update/remarks`, data);
  return response.data;
};
export const addExtras = async (data) => {
  const response = await api.post(`/grant/update/extras`, data);
  return response.data;
};
export const getStats = async () => {
  const response = await api.get(`/admin/stats`);
  return response.data;
};
export const getSubjectStats = async (data) => {
  const response = await api.post(`/admin/staff/subject/stats`, data);
  return response.data;
};
export const editStaffProfile = async (data) => {
  const response = await api.post(`/admin/staff/update`, data);
  return response.data;
};
export const getCodes = async (data) => {
  const response = await api.post(`/attendance/createCodes`, data);
  return response.data;
};
export const uploadSubjects = async (data) => {
  const response = await api.post(`/subjects/add`, data);
  return response.data;
};
export const updateMarks = async (data) => {
  const response = await api.post(`/grant/update/exam`, data);
  return response.data;
};
export const updateAssignments = async (data) => {
  const response = await api.post(`/grant/update/assignments`, data);
  return response.data;
};


// In api/apiService.js

export const allocateSubject = async (studentId, subjectId) => {
  return await axios.post(`/allocate-subject`, { studentId, subjectId });
};

export const revokeSubject = async (studentId, subjectId) => {
  return await axios.post(`/revoke-subject`, { studentId, subjectId });
};
