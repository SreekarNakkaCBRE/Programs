import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({email: decoded.sub, role_id: decoded.role_id});
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        try {
            const decoded = jwtDecode(token);
            setUser({email: decoded.sub, role_id: decoded.role_id});
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");   
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => 
    useContext(AuthContext);
    
