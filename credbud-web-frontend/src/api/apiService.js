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
}, (error) => {
  return Promise.reject(error);
});

// Login function with proper error handling
export const login = async (userType) => {
  try {
    const now = new Date();
    const response = await api.get(`/auth/login/?userType=${userType}`);
    if (response.data) {
      Cookies.set('x-api-key', response.data.customToken, { secure: true, sameSite: "strict" });
      localStorage.setItem('userProfile', JSON.stringify({data: response.data.user, expiry: now.getTime() + (10 * 60 * 1000)}));
    }
    return response.data; // Optionally return response if you need it
  } catch (error) {
    console.error('Login failed', error);
    throw error;
  }
};

// Fetch user profile data
export const fetchUserData = async () => {
  try {
    const response = await api.get(`/user/profile`);
    return response.data;
  } catch (error) {
    console.error('Fetching user data failed', error);
    throw error;
  }
};

// Search for users
export const searchUser = async (searchQuery, searchField, userType) => {
  try {
    const response = await api.post(`/user/search`, { searchQuery, searchField, userType });
    return response.data.result;
  } catch (error) {
    console.error('User search failed', error);
    throw error;
  }
};

// Get user attendance
export const getUserAttendance = async (id, department, division, subject, admissionYear, searchType) => {
  try {
    const response = await api.post(`/attendance/fetch`, { id, department, division, subject, admissionYear, searchType });
    return response.data;
  } catch (error) {
    console.error('Fetching attendance failed', error);
    throw error;
  }
};

// Upload user data
export const uploadData = async (data) => {
  try {
    const response = await api.post(`/user/add`, data);
    return response.data;
  } catch (error) {
    console.error('Uploading data failed', error);
    throw error;
  }
};

// Update term
export const updateTerm = async (data) => {
  try {
    const response = await api.post(`/user/updateSemester`, data);
    return response.data;
  } catch (error) {
    console.error('Updating term failed', error);
    throw error;
  }
};

// Update remarks
export const updateRemarks = async (data) => {
  try {
    const response = await api.post(`/grant/update/remarks`, data);
    return response.data;
  } catch (error) {
    console.error('Updating remarks failed', error);
    throw error;
  }
};

// Add extras
export const addExtras = async (data) => {
  try {
    const response = await api.post(`/grant/update/extras`, data);
    return response.data;
  } catch (error) {
    console.error('Adding extras failed', error);
    throw error;
  }
};

// Get stats
export const getStats = async () => {
  try {
    const response = await api.get(`/admin/stats`);
    return response.data;
  } catch (error) {
    console.error('Fetching stats failed', error);
    throw error;
  }
};

// Get subject stats
export const getSubjectStats = async (data) => {
  try {
    const response = await api.post(`/admin/staff/subject/stats`, data);
    return response.data;
  } catch (error) {
    console.error('Fetching subject stats failed', error);
    throw error;
  }
};

// Edit staff profile
export const editStaffProfile = async (data) => {
  try {
    const response = await api.post(`/admin/staff/update`, data);
    return response.data;
  } catch (error) {
    console.error('Editing staff profile failed', error);
    throw error;
  }
};

// Get codes
export const getCodes = async (data) => {
  try {
    const response = await api.post(`/attendance/createCodes`, data);
    return response.data;
  } catch (error) {
    console.error('Fetching codes failed', error);
    throw error;
  }
};

// Upload subjects
export const uploadSubjects = async (data) => {
  try {
    const response = await api.post(`/subjects/add`, data);
    return response.data;
  } catch (error) {
    console.error('Uploading subjects failed', error);
    throw error;
  }
};

// Update marks
export const updateMarks = async (data) => {
  try {
    const response = await api.post(`/grant/update/exam`, data);
    return response.data;
  } catch (error) {
    console.error('Updating marks failed', error);
    throw error;
  }
};

// Update assignments
export const updateAssignments = async (data) => {
  try {
    const response = await api.post(`/grant/update/assignments`, data);
    return response.data;
  } catch (error) {
    console.error('Updating assignments failed', error);
    throw error;
  }
};
