import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { colors } from '../utils/colors';
import { loadImageFromStatic } from "../utils/profilePicUtils";


function Dashboard() {
 
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch dashboard stats when component mounts
        const fetchStats = async () => {
            try {
                setLoading(true);
                // Only fetch user stats if user is admin
                if (user?.role?.name === 'admin') {
                    const response = await axios.get('/users/list');
                    const users = response.data.users || [];
                    setStats({
                        totalUsers: users.length,
                        activeUsers: users.filter(u => u.is_active).length,
                        adminUsers: users.filter(u => u.role?.name === 'admin').length
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role?.name === 'admin') {
            fetchStats();
        }
    }, [user?.role?.name]);

    if (!user) {
        return (
            <div style={containerStyles}>
                <div style={loadingStyles}>Loading...</div>
            </div>
        );
    }

    const isAdmin = user.role?.name === 'admin';

    return (
        <div style={containerStyles}>
            <div style={headerStyles}>
                <h1 style={titleStyles}>
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                </h1>
                <p style={subtitleStyles}>
                    Welcome back, {user.first_name} {user.last_name}!
                </p>
            </div>
            
            <div style={welcomeCardStyles}>
                <div style={userInfoStyles}>
                    <div style={avatarStyles}>
                        {user.profile_pic ? (
                            <img 
                                src={loadImageFromStatic(user.profile_pic)} 
                                alt="Profile" 
                                style={avatarStyles}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : 
                        <div style={profileInitialStyles}>
                            {user.first_name?.[0]?.toUpperCase() + user.last_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        }
                        
                    </div>
                    <div style={userDetailsStyles}>
                        <h2 style={userNameStyles}>{user.first_name} {user.last_name}</h2>
                        <p style={userRoleStyles}>Role: {user.role?.name || 'User'}</p>
                        <p style={userEmailStyles}>Email: {user.email}</p>
                        {user.contact_number && (
                            <p style={userContactStyles}>Contact: {user.contact_number}</p>
                        )}
                    </div>
                </div>
                <div style={actionButtonsStyles}>
                    <button 
                        style={primaryButtonStyles}
                        onClick={() => navigate('/profile')}
                    >
                        Edit Profile
                    </button>
                    {isAdmin && (
                        <button 
                            style={secondaryButtonStyles}
                            onClick={() => navigate('/admin')}
                        >
                            Admin Panel
                        </button>
                    )}
                </div>
            </div>

            {isAdmin && (
                <div style={statsContainerStyles}>
                    <h2 style={sectionTitleStyles}>System Overview</h2>
                    <div style={statsGridStyles}>
                        <div style={statCardStyles}>
                            <h3 style={statTitleStyles}>Total Users</h3>
                            <p style={statNumberStyles}>
                                {loading ? '...' : stats.totalUsers}
                            </p>
                        </div>
                        <div style={statCardStyles}>
                            <h3 style={statTitleStyles}>Active Users</h3>
                            <p style={statNumberStyles}>
                                {loading ? '...' : stats.activeUsers}
                            </p>
                        </div>
                        <div style={statCardStyles}>
                            <h3 style={statTitleStyles}>Admin Users</h3>
                            <p style={statNumberStyles}>
                                {loading ? '...' : stats.adminUsers}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div style={actionsContainerStyles}>
                <h2 style={sectionTitleStyles}>Quick Actions</h2>
                <div style={actionsGridStyles}>
                    <div style={actionCardStyles} onClick={() => navigate('/profile')}>
                        <div style={actionIconStyles}>👤</div>
                        <h3 style={actionTitleStyles}>My Profile</h3>
                        <p style={actionDescStyles}>View and edit your profile information</p>
                    </div>
                    
                    {isAdmin && (
                        <>
  
                            <div style={actionCardStyles} onClick={() => navigate('/users-list')}>
                                <div style={actionIconStyles}>👥</div>
                                <h3 style={actionTitleStyles}>Users Management</h3>
                                <p style={actionDescStyles}>View and manage all users</p>
                            </div>

                            <div style={actionCardStyles} onClick={() => navigate('/create-user')}>
                                <div style={actionIconStyles}>➕</div>
                                <h3 style={actionTitleStyles}>Create User</h3>
                                <p style={actionDescStyles}>Add a new user to the system</p>
                            </div>
                        </>
                    
                    )}
                  
                </div>
            </div>
        </div>
    );
}

const containerStyles = {
    padding: '1rem'
};

const headerStyles = {
    marginBottom: '2rem'
};

const titleStyles = {
    color: colors.primary.darkGreen,
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0'
};

const subtitleStyles = {
    color: colors.secondary.darkGray,
    fontSize: '1.1rem',
    margin: 0
};

const loadingStyles = {
    textAlign: 'center',
    padding: '2rem',
    color: colors.secondary.darkGray,
    fontSize: '1.1rem'
};

const welcomeCardStyles = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 63, 45, 0.1)',
    border: `1px solid ${colors.secondary.paleGray}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
};

const userInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
};

const avatarStyles = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '2rem'
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
    fontSize: '2rem'
};

const userDetailsStyles = {
    flex: 1
};

const userNameStyles = {
    color: colors.primary.darkGreen,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.5rem 0'
};

const userRoleStyles = {
    color: colors.secondary.darkGray,
    fontSize: '1rem',
    margin: '0 0 0.25rem 0'
};

const userEmailStyles = {
    color: colors.secondary.darkGray,
    fontSize: '0.9rem',
    margin: '0 0 0.25rem 0'
};

const userContactStyles = {
    color: colors.secondary.darkGray,
    fontSize: '0.9rem',
    margin: 0
};

const actionButtonsStyles = {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
};

const primaryButtonStyles = {
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

const secondaryButtonStyles = {
    backgroundColor: colors.secondary.teal,
    color: colors.white,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

const statsContainerStyles = {
    marginBottom: '2rem'
};

const sectionTitleStyles = {
    color: colors.primary.darkGreen,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
};

const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
};

const statCardStyles = {
    backgroundColor: colors.white,
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 63, 45, 0.1)',
    border: `1px solid ${colors.secondary.paleGray}`
};

const statTitleStyles = {
    color: colors.secondary.darkGray,
    fontSize: '0.9rem',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const statNumberStyles = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: colors.primary.darkGreen,
    margin: 0
};

const actionsContainerStyles = {
    marginBottom: '2rem'
};

const actionsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
};

const actionCardStyles = {
    backgroundColor: colors.white,
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 63, 45, 0.1)',
    border: `1px solid ${colors.secondary.paleGray}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

const actionIconStyles = {
    fontSize: '2.5rem',
    marginBottom: '1rem'
};

const actionTitleStyles = {
    color: colors.primary.darkGreen,
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0'
};

const actionDescStyles = {
    color: colors.secondary.darkGray,
    fontSize: '0.9rem',
    margin: 0
};

export default Dashboard;