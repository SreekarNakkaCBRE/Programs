import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

function PrivateRoute({ children, requireAdmin = false }) {
    const { user, loading } = useAuth();

    // Add spinner animation CSS
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={loadingStyles}>
                <div style={spinnerStyles}></div>
                <p>Loading...</p>
            </div>
        );
    }

    // If no user is logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If admin is required but user is not admin, redirect to dashboard
    if (requireAdmin && user.role?.name !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // If user is logged in (and admin if required), render the children components
    return children;
}

const loadingStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
};

const spinnerStyles = {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #003F2D',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
};

export default PrivateRoute;
