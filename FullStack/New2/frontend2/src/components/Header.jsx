import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { colors } from "../utils/colors";
import { getImageUrl } from "../config/api";

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setShowProfileDropdown(false);
    };

    const handleDashboardClick = () => {
        navigate('/dashboard');
        setShowProfileDropdown(false);
    };

    const handleAdminClick = () => {
        navigate('/users-management');
        setShowProfileDropdown(false);
    };

    const handleCreateUserClick = () => {
        navigate('/create-user');
        setShowProfileDropdown(false);
    };

    const handleLogoClick = () => {
        window.open('https://www.cbre.com/', '_blank');
    };

    return (
        <header style={headerStyles}>
            <div style={headerContentStyles}>
                <div style={logoContainerStyles}>
                    <img onClick={handleLogoClick}
                        src="/logo.jpg" 
                        alt="Logo" 
                        style={logoImageStyles}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                        
                        
                    />
                    <h2 style={logoTextStyles}>Role Management Dashboard</h2>
                </div>
                <div style={userInfoStyles}>
                    {user ? (
                        <div style={profileContainerStyles}>
                            <span style={welcomeTextStyles}>Welcome, {user.first_name + ' ' + user.last_name || 'User'}</span>
                            <div style={profileDropdownContainerStyles} ref={dropdownRef}>
                                <div style={profilePinStyles} onClick={toggleProfileDropdown}>
                                    <div style={profileAvatarStyles}>
                                        {user.profile_pic ? (
                                            <img 
                                                src={getImageUrl(user.profile_pic)} 
                                                alt="Profile" 
                                                style={profileImageStyles}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div style={profileInitialStyles}>
                                            {user.first_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    </div>
                                    <span style={dropdownArrowStyles}>▼</span>
                                </div>
                                
                                {showProfileDropdown && (
                                    <div style={dropdownMenuStyles}>
                                        <div style={dropdownItemStyles} onClick={handleDashboardClick}>
                                            🏠 Dashboard
                                        </div>
                                        <div style={dropdownItemStyles} onClick={handleProfileClick}>
                                            👤 My Profile
                                        </div>
                                        {user.role?.name === 'admin' && (
                                            <>
                                            <div style={dropdownItemStyles} onClick={handleAdminClick}>
                                                👥 Users Management
                                            </div>
                                            <div style={dropdownItemStyles} onClick={handleCreateUserClick}>
                                                ➕ Create User
                                            </div>
                                            </>
                                            
                                        )}
                                        <div style={{...dropdownItemStyles, ...logoutItemStyles}} onClick={handleLogout}>
                                            🚪 Logout
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button style={loginButtonStyles} onClick={() => navigate('/login')}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

const headerStyles = {
    backgroundColor: colors.primary.darkGreen,
    color: colors.white,
    padding: '12px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const headerContentStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem'
};

const logoContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
};

const logoImageStyles = {
    height: '50px',
    width: 'auto',
    borderRadius: '4px'
};

const logoTextStyles = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: colors.primary.brightGreen,
    margin: 0
};

const userInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const profileContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const welcomeTextStyles = {
    color: colors.white,
    fontSize: '0.9rem'
};

const profileDropdownContainerStyles = {
    position: 'relative'
};

const profilePinStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '20px',
    transition: 'background-color 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
};

const profileAvatarStyles = {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden'
};

const profileImageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
};

const profileInitialStyles = {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem'
};

const dropdownArrowStyles = {
    fontSize: '0.7rem',
    color: colors.white,
    transition: 'transform 0.3s ease'
};

const dropdownMenuStyles = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: colors.white,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${colors.secondary.paleGray}`,
    minWidth: '180px',
    zIndex: 1001,
    marginTop: '0.5rem'
};

const dropdownItemStyles = {
    padding: '0.75rem 1rem',
    color: colors.primary.darkGreen,
    cursor: 'pointer',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s ease',
    borderBottom: `1px solid ${colors.secondary.paleGray}`
    
    
};

const logoutItemStyles = {
    borderBottom: 'none',
    color: colors.danger
};

const loginButtonStyles = {
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
};

export default Header;