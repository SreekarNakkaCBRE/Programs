import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" className="header">
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <img 
                        src="/static/cbre_logo_1a.jpg" 
                        alt="CBRE Logo" 
                        style={{ height: '40px', marginRight: '16px' }}
                    />
                    <Typography variant="h6" component="div" className="header-title">
                        Role Management System
                    </Typography>
                </Box>
                
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" className="user-info">
                            Welcome, {user.email}
                        </Typography>
                        <Button 
                            color="inherit" 
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
