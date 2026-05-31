import axios from 'axios';

// Base API Configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Backend URL (Relative for Proxy/Vercel)
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add Token and Tenant context to requests
api.interceptors.request.use(config => {
    // Check if we are calling a master admin endpoint or a regular business endpoint
    const isAdminRequest = config.url?.startsWith('/admin') || config.url?.includes('/restricciones');
    
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const slug = localStorage.getItem('tenantSlug');

    // Choose the correct token based on context
    const effectiveToken = isAdminRequest ? (adminToken || token) : token;

    if (effectiveToken) {
        config.headers.Authorization = `Bearer ${effectiveToken}`;
    }
    
    if (slug) {
        config.headers['X-Tenant-Slug'] = slug;
    }

    return config;
});

// Interceptors for Error Handling could go here
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
