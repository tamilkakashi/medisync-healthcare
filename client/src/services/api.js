import axios from 'axios';
import { handleClientMockRequest, isStaticHosting } from './clientMockDb';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure adapter: If on GitHub Pages or if backend is offline, route to clientMockDb
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

api.defaults.adapter = async (config) => {
    // If running on GitHub Pages (static site) or forced mock, serve immediately from client mock DB
    if (isStaticHosting()) {
        return handleClientMockRequest(config);
    }

    try {
        return await defaultAdapter(config);
    } catch (error) {
        // Fall back to client mock DB if backend is offline, 404, or network error
        const isOfflineOrNotFound = !error.response || error.response.status === 404 || error.response.status >= 500 || error.code === 'ERR_NETWORK';
        if (isOfflineOrNotFound) {
            console.warn('[MediSync API] Backend server unreachable or 404, falling back to Client Mock DB:', config.url);
            try {
                return await handleClientMockRequest(config);
            } catch (mockError) {
                return Promise.reject(mockError);
            }
        }
        return Promise.reject(error);
    }
};

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
        return Promise.reject(error);
    }
);

export default api;
