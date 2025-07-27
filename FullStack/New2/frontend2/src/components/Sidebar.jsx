import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Base menu items for all users
    const baseMenuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/profile', label: 'My Profile', icon: '👤' }
    ];

    // Admin-only menu items
    const adminMenuItems = [
        { path: '/users-management', label: 'Users Management', icon: '👥' },
        { path: '/create-user', label: 'Create User', icon: '➕' },
    ];

    // Combine menu items based on user role
    const menuItems = user?.role?.name === 'admin' 
        ? [...baseMenuItems, ...adminMenuItems]
        : baseMenuItems;

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div style={sidebarStyles} className="sidebar">
            <div style={userCardStyles}>
                <div style={avatarStyles}>
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={userDetailsStyles}>
                    <p style={userNameStyles}>{user?.first_name} {user?.last_name}</p>
                    <p style={userRoleStyles}>{user?.role?.name || 'User'}</p>
                </div>
            </div>
            
            <nav style={navStyles}>
                <ul style={menuListStyles}>
                    {menuItems.map((item) => (
                        <li key={item.path} style={menuItemStyles}>
                            <button
                                onClick={() => handleNavigation(item.path)}
                                style={{
                                    ...menuButtonStyles,
                                    ...(location.pathname === item.path ? activeMenuButtonStyles : {})
                                }}
                            >
                                <span style={iconStyles}>{item.icon}</span>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

const sidebarStyles = {
    backgroundColor: colors.primary.darkTeal,
    width: '250px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: '70px',
    overflowY: 'auto',
    borderRight: `1px solid ${colors.primary.gray}`,
    zIndex: 999
};

const userCardStyles = {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.primary.gray}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const avatarStyles = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem'
};

const userDetailsStyles = {
    flex: 1
};

const userNameStyles = {
    color: colors.white,
    margin: '0 0 0.25rem 0',
    fontSize: '0.9rem',
    fontWeight: '600'
};

const userRoleStyles = {
    color: colors.secondary.lightGreen,
    margin: 0,
    fontSize: '0.8rem',
    textTransform: 'capitalize'
};

const navStyles = {
    padding: '1rem 0'
};

const menuListStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0
};

const menuItemStyles = {
    margin: '0.25rem 0'
};

const menuButtonStyles = {
    width: '100%',
    padding: '1rem 1.5rem',
    backgroundColor: 'transparent',
    color: colors.secondary.lightGreen,
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    borderRadius: '0'
};

const activeMenuButtonStyles = {
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    fontWeight: '600'
};

const iconStyles = {
    fontSize: '1.2rem'
};

export default Sidebar;
