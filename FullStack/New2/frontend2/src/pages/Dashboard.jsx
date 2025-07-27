import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { colors } from '../utils/colors';
import { getImageUrl } from "../config/api";
import {
    pageContainer,
    pageHeader,
    pageTitle,
    pageSubtitle,
    loadingText,
    largeCard,
    card,
    clickableCard,
    sectionTitle,
    gridAuto,
    primaryButton,
    flexBetween,
    statNumber,
    actionIcon
} from '../utils/commonStyles';


function Dashboard() {
 
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0
    });
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const hasInitiallyFetched = useRef(false);

    useEffect(() => {
        // Reset image error when user changes
        setImageError(false);
    }, [user?.profile_pic]);

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

        if (!authLoading && user?.role?.name === 'admin' && !hasInitiallyFetched.current) {
            hasInitiallyFetched.current = true;
            fetchStats();
        }
    }, [authLoading, user?.role?.name]); // Only re-run when auth loading finishes or role changes

    if (!user) {
        return (
            <div style={pageContainer}>
                <div style={loadingText}>Loading...</div>
            </div>
        );
    }

    const isAdmin = user.role?.name === 'admin';

    return (
        <div style={pageContainer}>
            <div style={pageHeader}>
                <h1 style={pageTitle}>
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                </h1>
                <p style={pageSubtitle}>
                    Welcome back, {user.first_name} {user.last_name}!
                </p>
            </div>
            
            <div style={welcomeCardStyles}>
                <div style={userInfoStyles}>
                    <div style={avatarStyles}>
                        {user.profile_pic && !imageError ? (
                            <img 
                                src={getImageUrl(user.profile_pic)} 
                                alt="Profile" 
                                style={avatarImageStyles}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div style={profileInitialStyles}>
                                {user.first_name?.[0]?.toUpperCase() + user.last_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
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
                        style={primaryButton}
                        onClick={() => navigate('/profile')}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {isAdmin && (
                <div style={statsContainerStyles}>
                    <h2 style={sectionTitle}>System Overview</h2>
                    <div style={gridAuto('200px')}>
                        <div style={card}>
                            <h3 style={statTitleStyles}>Total Users</h3>
                            <p style={statNumber}>
                                {loading ? '...' : stats.totalUsers}
                            </p>
                        </div>
                        <div style={card}>
                            <h3 style={statTitleStyles}>Active Users</h3>
                            <p style={statNumber}>
                                {loading ? '...' : stats.activeUsers}
                            </p>
                        </div>
                        <div style={card}>
                            <h3 style={statTitleStyles}>Admin Users</h3>
                            <p style={statNumber}>
                                {loading ? '...' : stats.adminUsers}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div style={actionsContainerStyles}>
                <h2 style={sectionTitle}>Quick Actions</h2>
                <div style={gridAuto('250px')}>
                    <div style={clickableCard} onClick={() => navigate('/profile')}>
                        <div style={actionIcon}>👤</div>
                        <h3 style={actionTitleStyles}>My Profile</h3>
                        <p style={actionDescStyles}>View and edit your profile information</p>
                    </div>
                    
                    {isAdmin && (
                        <>
  
                            <div style={clickableCard} onClick={() => navigate('/users-management')}>
                                <div style={actionIcon}>👥</div>
                                <h3 style={actionTitleStyles}>Users Management</h3>
                                <p style={actionDescStyles}>View and manage all users</p>
                            </div>

                            <div style={clickableCard} onClick={() => navigate('/create-user')}>
                                <div style={actionIcon}>➕</div>
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

// Only unique styles specific to Dashboard remain
const welcomeCardStyles = {
    ...largeCard,
    ...flexBetween,
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem'
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
    fontSize: '2rem',
    overflow: 'hidden'
};

const avatarImageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
};

const profileInitialStyles = {
    width: '100%',
    height: '100%',
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

const statsContainerStyles = {
    marginBottom: '2rem'
};

const statTitleStyles = {
    color: colors.secondary.darkGray,
    fontSize: '1rem',
    margin: '0 0 0.5rem 0',
    letterSpacing: '0.5px',
    textAlign: 'center'
};

const actionsContainerStyles = {
    marginBottom: '2rem'
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