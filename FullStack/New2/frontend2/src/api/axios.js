import axios from "axios";


const instance = axios.create({
// baseURL: "https://6vmzsd54-8000.auc1.devtunnels.ms"
    baseURL:"http://localhost:8000",
    
});

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    

    if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
});

instance.interceptors.response.use(
    
    response => response,
    error => {
        const email = localStorage.getItem('email');
        const password = localStorage.getItem('password');
        const PrevRequest = error?.config;
        if (error?.response?.status === 401 && !PrevRequest?.sent) {
            PrevRequest.sent = true;
            return instance.post('/auth/login', {email,password}).then(
                res => {
                    localStorage.setItem('token', res.data.access_token);
                    PrevRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
                    return instance(PrevRequest);
                }
            );
        }
    }
);

export default instance;
