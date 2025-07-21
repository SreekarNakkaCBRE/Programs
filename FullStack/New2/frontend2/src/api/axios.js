import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:8000"
});

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set default Content-Type if not already specified
    if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
});

export default instance;
