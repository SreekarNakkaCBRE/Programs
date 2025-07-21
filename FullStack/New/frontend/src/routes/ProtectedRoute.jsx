import {Navigate} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoutes({ children, requiredRole }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && (!user.role_id || user.role_id !== requiredRole)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
}