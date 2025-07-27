import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        const response = await axios.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);


        const profile = await axios.get('/users/my_profile', {
            headers: { Authorization: `Bearer ${response.data.access_token}` }
        });

        setUser(profile.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        // Keep profile pictures in localStorage - they're user-specific and should persist
        // Only remove auth token, not profile pics
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/users/my_profile', { 
                headers: { Authorization: `Bearer ${token}` } 
            })
                .then(response => {
                    setUser(response.data.user);
                })
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, setUser: updateUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

