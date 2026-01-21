import axios from 'axios';

const API_URL = 'http://localhost:4000'; // Adjust if backend runs on different port

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    // No refresh token, logout or throw
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                if (response.status === 201 || response.status === 200) {
                    const { access_token } = response.data;
                    localStorage.setItem('access_token', access_token);
                    console.log("Access token: ", access_token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh token invalid, logout
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const createUser = (data: any) => api.post('/users', data);

export const getClasses = () => api.get('/school/classes');
export const createClass = (data: any) => api.post('/school/classes', data);

export const getStudents = () => api.get('/school/students');
export const createStudent = (data: any) => api.post('/school/students', data);

export const getTeachers = () => api.get('/school/teachers');
export const createTeacher = (data: any) => api.post('/school/teachers', data);

export const getAttendance = () => api.get('/school/attendance');
export const createAttendance = (data: any) => api.post('/school/attendance', data);

export const getMarks = () => api.get('/school/marks');
export const createMark = (data: any) => api.post('/school/marks', data);

export default api;