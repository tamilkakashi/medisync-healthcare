import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor for Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'An unexpected error occurred';
        // We can trigger toasts here if we set up a global toast system
        return Promise.reject(error);
    }
);

export default api;
