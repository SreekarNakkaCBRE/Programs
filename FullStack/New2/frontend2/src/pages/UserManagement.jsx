import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { colors } from '../utils/colors';

function AdminPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingRole, setUpdatingRole] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    // Add CSS animation for spinner
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

    // Redirect if not admin
    useEffect(() => {
        if (user && user.role?.name !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch users function
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/users/list');
            setUsers(response.data.users || []);
            setError(''); // Clear any previous errors
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch users list
    useEffect(() => {
        if (user?.role?.name === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const handleRoleUpdate = async (userId, newRoleId) => {
        setUpdatingRole(userId);
        try {
            await axios.put(`/users/${userId}/role`, { role_id: newRoleId });
            
            // Update local state
            setUsers(users.map(u => 
                u.id === userId 
                    ? { ...u, role: { ...u.role, id: newRoleId, name: newRoleId === 1 ? 'admin' : 'user' } }
                    : u
            ));
            
            alert('Role updated successfully!');
        } catch (error) {
            alert('Failed to update role');
            console.error('Error updating role:', error);
        } finally {
            setUpdatingRole(null);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        setUpdatingStatus(userId);
        try {
            // Call the backend API to toggle user status
            const token = localStorage.getItem('token');
            await axios.put(`/users/${userId}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refetch users to get the updated status from the backend
            await fetchUsers();
            
            alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        } catch (error) {
            alert('Failed to update status');
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (!user || user.role?.name !== 'admin') {
        return (
            <div style={containerStyles}>
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={containerStyles}>
                <div style={loadingStyles}>Loading users...</div>
            </div>
        );
    }

    return (
        <div style={containerStyles}>
            <div style={headerStyles}>
                <h1 style={titleStyles}>Admin Panel</h1>
                <p style={subtitleStyles}>Manage users and system settings</p>
            </div>

            {error && (
                <div style={errorStyles}>
                    {error}
                </div>
            )}

            <div style={statsContainerStyles}>
                <div style={statCardStyles}>
                    <h3 style={statTitleStyles}>Total Users</h3>
                    <p style={statNumberStyles}>{users.length}</p>
                </div>
                <div style={statCardStyles}>
                    <h3 style={statTitleStyles}>Admin Users</h3>
                    <p style={statNumberStyles}>
                        {users.filter(u => u.role?.name === 'admin').length}
                    </p>
                </div>
                <div style={statCardStyles}>
                    <h3 style={statTitleStyles}>Standard Users</h3>
                    <p style={statNumberStyles}>
                        {users.filter(u => u.role?.name === 'user').length}
                    </p>
                </div>
                <div style={statCardStyles}>
                    <h3 style={statTitleStyles}>Active Users</h3>
                    <p style={statNumberStyles}>
                        {users.filter(u => u.is_active).length}
                    </p>
                </div>
            </div>

            <div style={usersTableContainerStyles}>
                <h2 style={sectionTitleStyles}>Users Management</h2>
                
                <div style={tableContainerStyles}>
                    <table style={tableStyles}>
                        <thead>
                            <tr style={tableHeaderRowStyles}>
                                <th style={tableHeaderStyles}>Name</th>
                                <th style={tableHeaderStyles}>Email</th>
                                <th style={tableHeaderStyles}>Contact</th>
                                <th style={tableHeaderStyles}>Role</th>
                                <th style={tableHeaderStyles}>Status</th>
                                <th style={tableHeaderStyles}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((userItem) => (
                                <tr key={userItem.id} style={tableRowStyles}>
                                    <td style={tableCellStyles}>
                                        {userItem.first_name} {userItem.last_name}
                                    </td>
                                    <td style={tableCellStyles}>{userItem.email}</td>
                                    <td style={tableCellStyles}>
                                        {userItem.contact_number || 'N/A'}
                                    </td>
                                    <td style={tableCellStyles}>
                                        <span style={{
                                            ...roleTagStyles,
                                            backgroundColor: userItem.role?.name === 'admin' 
                                                ? colors.primary.brightGreen 
                                                : colors.secondary.blueGray,
                                            color: userItem.role?.name === 'admin'
                                                ? colors.primary.darkGreen
                                                : colors.white
                                        }}>
                                            {userItem.role?.name || 'user'}
                                        </span>
                                    </td>
                                    <td style={tableCellStyles}>
                                        <div style={statusCellStyles}>
                                            <span style={{
                                                ...statusTagStyles,
                                                backgroundColor: userItem.is_active 
                                                    ? colors.success 
                                                    : colors.danger
                                            }}>
                                                {userItem.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <div
                                                onClick={() => {
                                                    if (!(updatingStatus === userItem.id || userItem.id === user.id)) {
                                                        handleStatusToggle(userItem.id, userItem.is_active);
                                                    }
                                                }}
                                                style={{
                                                    ...toggleSwitchStyles,
                                                    backgroundColor: userItem.is_active 
                                                        ? colors.success 
                                                        : colors.secondary.paleGray,
                                                    cursor: updatingStatus === userItem.id || userItem.id === user.id 
                                                        ? 'not-allowed' 
                                                        : 'pointer',
                                                    opacity: updatingStatus === userItem.id || userItem.id === user.id 
                                                        ? 0.6 
                                                        : 1
                                                }}
                                                title={userItem.is_active ? 'Click to deactivate user' : 'Click to activate user'}
                                            >
                                                <div
                                                    style={{
                                                        ...toggleKnobStyles,
                                                        transform: userItem.is_active 
                                                            ? 'translateX(20px)' 
                                                            : 'translateX(2px)'
                                                    }}
                                                >
                                                    {updatingStatus === userItem.id && (
                                                        <div style={loadingSpinnerStyles}></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tableCellStyles}>
                                        <div style={actionButtonsStyles}>
                                            <select
                                                value={userItem.role?.id || 2}
                                                onChange={(e) => handleRoleUpdate(userItem.id, parseInt(e.target.value))}
                                                disabled={updatingRole === userItem.id || userItem.id === user.id}
                                                style={selectStyles}
                                            >
                                                <option value={2}>User</option>
                                                <option value={1}>Admin</option>
                                            </select>
                                            {updatingRole === userItem.id && (
                                                <span style={loadingTextStyles}>Updating...</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

const errorStyles = {
    backgroundColor: '#fee',
    color: colors.danger,
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: `1px solid ${colors.danger}`
};

const loadingStyles = {
    textAlign: 'center',
    padding: '2rem',
    color: colors.secondary.darkGray,
    fontSize: '1.1rem'
};

const statsContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
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

const usersTableContainerStyles = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 63, 45, 0.1)',
    border: `1px solid ${colors.secondary.paleGray}`
};

const sectionTitleStyles = {
    color: colors.primary.darkGreen,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
};

const tableContainerStyles = {
    overflowX: 'auto'
};

const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse'
};

const tableHeaderRowStyles = {
    backgroundColor: colors.secondary.lightGreen
};

const tableHeaderStyles = {
    padding: '1rem',
    textAlign: 'left',
    color: colors.primary.darkGreen,
    fontWeight: '600',
    borderBottom: `2px solid ${colors.secondary.mediumGreen}`
};

const tableRowStyles = {
    borderBottom: `1px solid ${colors.secondary.paleGray}`,
    transition: 'background-color 0.2s ease'
};

const tableCellStyles = {
    padding: '1rem',
    color: colors.secondary.darkGray
};

const roleTagStyles = {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const statusTagStyles = {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: colors.white
};

const actionButtonsStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
};

const selectStyles = {
    padding: '0.5rem',
    border: `1px solid ${colors.secondary.paleGray}`,
    borderRadius: '6px',
    backgroundColor: colors.white,
    color: colors.primary.darkGreen,
    fontSize: '0.9rem'
};

const loadingTextStyles = {
    fontSize: '0.8rem',
    color: colors.secondary.darkGray,
    fontStyle: 'italic'
};

const statusCellStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
};

const toggleButtonStyles = {
    padding: '0.4rem 0.6rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: colors.white,
    transition: 'all 0.3s ease',
    minWidth: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const toggleSwitchStyles = {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    border: `2px solid ${colors.secondary.paleGray}`
};

const toggleKnobStyles = {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: colors.white,
    position: 'absolute',
    top: '1px',
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const loadingSpinnerStyles = {
    width: '10px',
    height: '10px',
    border: `2px solid ${colors.secondary.paleGray}`,
    borderTop: `2px solid ${colors.primary.darkGreen}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
};

export default AdminPanel;
