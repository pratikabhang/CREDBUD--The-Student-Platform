import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:1234/api/v1',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  const apiKey = Cookies.get('x-api-key');
  console.log('Request interceptor:', { token, apiKey }); // Debug log

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (apiKey) {
    config.headers['X-Api-Key'] = apiKey;
  }

  return config;
});


// Login API - sets tokens
export const login = async (userType) => {
  const now = new Date();
  const response = await api.get(`/auth/login/?userType=${userType}`);
  console.log('Login response:', response.data); // Check tokens here

  if (response.data) {
    if (response.data.customToken) {
      Cookies.set('x-api-key', response.data.customToken, { secure: true, sameSite: "strict" });
    }
    if (response.data.authToken) {
      Cookies.set('authToken', response.data.authToken, { secure: true, sameSite: "strict" });
    }
    localStorage.setItem('userProfile', JSON.stringify({ data: response.data.user, expiry: now.getTime() + (10 * 60 * 1000) }));
  }
  return response.data;
};


// Other API calls using api instance
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

// Fix allocateSubject and revokeSubject to use api instance with interceptors
export const allocateSubject = async (studentId, subjectId) => {
  const response = await api.post(`/allocate-subject`, { studentId, subjectId });
  return response.data;
};

export const revokeSubject = async (studentId, subjectId) => {
  const response = await api.post(`/revoke-subject`, { studentId, subjectId });
  return response.data;
};
