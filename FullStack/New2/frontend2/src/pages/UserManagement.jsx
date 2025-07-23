import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { colors } from '../utils/colors';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnackbar } from 'notistack';
import { CheckCircle, Error } from '@mui/icons-material';


function AdminPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingRole, setUpdatingRole] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [userToUpdateRole, setUserToUpdateRole] = useState(null);
    const [newRoleToSet, setNewRoleToSet] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    // Add spinner animation if not already added
    useEffect(() => {
        if (!document.querySelector('#spinner-animation')) {
            const style = document.createElement('style');
            style.id = 'spinner-animation';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
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
            
            enqueueSnackbar('Role updated successfully!', { 
                variant: 'success',
                autoHideDuration: 3000,
                 anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                
                style: {
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    fontWeight: '500',
                },
                iconVariant: {
                    success: <CheckCircle style={{ marginRight: 8 }} />
                }
            });
        } catch (error) {
            enqueueSnackbar('Failed to update role', { 
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                style: {
                    backgroundColor: '#f44336',
                    color: '#fff',
                    fontWeight: '500',
                },
                iconVariant: {
                    error: <Error style={{ marginRight: 8 }} />
                }
            });
            console.error('Error updating role:', error);
        } finally {
            setUpdatingRole(null);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        setUpdatingStatus(userId);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/users/${userId}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            enqueueSnackbar('Status updated successfully!', { 
                variant: 'success',
                autoHideDuration: 3000,
                 anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                
                style: {
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    fontWeight: '500',
                },
                iconVariant: {
                    success: <CheckCircle style={{ marginRight: 8 }} />
                }
            })
            await fetchUsers();
        } catch (error) {
            enqueueSnackbar('Failed to update status', { 
                variant: 'error',
                autoHideDuration: 3000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                style: {
                    backgroundColor: '#f44336',
                    color: '#fff',
                    fontWeight: '500',
                },
                iconVariant: {
                    error: <Error style={{ marginRight: 8 }} />
                }
            });
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleStatusToggleRequest = (userItem) => {
        setUserToToggle(userItem);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setUserToToggle(null);
    };

    const handleConfirmStatusToggle = () => {
        if (userToToggle) {
            handleStatusToggle(userToToggle.id, userToToggle.is_active);
        }
        setDialogOpen(false);
        setUserToToggle(null);
    };

    const handleRoleUpdateRequest = (userItem, newRoleId) => {
        setUserToUpdateRole(userItem);
        setNewRoleToSet(newRoleId);
        setRoleDialogOpen(true);
    };

    const handleRoleDialogClose = () => {
        setRoleDialogOpen(false);
        setUserToUpdateRole(null);
        setNewRoleToSet(null);
    };

    const handleConfirmRoleUpdate = () => {
        if (userToUpdateRole && newRoleToSet) {
            handleRoleUpdate(userToUpdateRole.id, newRoleToSet);
        }
        setRoleDialogOpen(false);
        setUserToUpdateRole(null);
        setNewRoleToSet(null);
    };

    function EditUserModal({ open, userData, onClose }) {
        const [formData, setFormData] = useState({
            first_name: '',
            last_name: '',
            email: '',
            contact_number: '',
            address: ''
        });
        const [isLoading, setIsLoading] = useState(false);
        const [modalError, setModalError] = useState('');
        const [modalSuccess, setModalSuccess] = useState('');

        useEffect(() => {
            if (userData) {
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    contact_number: userData.contact_number || '',
                    address: userData.address || ''
                });
                setModalError('');
                setModalSuccess('');
            }
        }, [userData]);

        const handleChange = (e) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
            if (modalError) setModalError('');
            if (modalSuccess) setModalSuccess('');
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setModalError('');
            
            try {
                await axios.put(`/users/${userData.id}`, formData);
                setModalSuccess('User updated successfully!');
                
                // Update the users list
                await fetchUsers();
                
                setTimeout(() => {
                    onClose();
                    setModalSuccess('');
                }, 1500);
            } catch (error) {
                setModalError('Failed to update user');
                console.error('Error updating user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const handleCancel = () => {
            setFormData({
                first_name: userData?.first_name || '',
                last_name: userData?.last_name || '',
                email: userData?.email || '',
                contact_number: userData?.contact_number || '',
                address: userData?.address || ''
            });
            setModalError('');
            setModalSuccess('');
            onClose();
        };

        if (!open) return null;

        return (
            <div style={modalOverlayStyles}>
                <div style={modalContentStyles}>
                    <div style={modalHeaderStyles}>
                        <h2 style={modalTitleStyles}>Edit User Profile</h2>
                        <button style={modalCloseButtonStyles} onClick={handleCancel}>
                            ×
                        </button>
                    </div>

                    {modalError && (
                        <div style={modalErrorStyles}>
                            {modalError}
                        </div>
                    )}

                    {modalSuccess && (
                        <div style={modalSuccessStyles}>
                            {modalSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={modalFormStyles}>
                        <div style={modalFieldRowStyles}>
                            <div style={modalFieldGroupStyles}>
                                <label style={modalLabelStyles}>First Name</label>
                                <input
                                    style={modalInputStyles}
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={modalFieldGroupStyles}>
                                <label style={modalLabelStyles}>Last Name</label>
                                <input
                                    style={modalInputStyles}
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div style={modalFieldGroupStyles}>
                            <label style={modalLabelStyles}>Email</label>
                            <input
                                style={modalInputStyles}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled
                                title="Email cannot be changed"
                            />
                        </div>

                        <div style={modalFieldGroupStyles}>
                            <label style={modalLabelStyles}>Contact Number</label>
                            <input
                                style={modalInputStyles}
                                type="tel"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleChange}
                                placeholder="Enter contact number"
                            />
                        </div>

                        <div style={modalFieldGroupStyles}>
                            <label style={modalLabelStyles}>Address</label>
                            <textarea
                                style={{...modalInputStyles, height: '80px', resize: 'vertical'}}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                            />
                        </div>

                        <div style={modalButtonGroupStyles}>
                            <button 
                                type="submit" 
                                style={{...modalButtonStyles, ...modalSaveButtonStyles}}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                style={{...modalButtonStyles, ...modalCancelButtonStyles}}
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    const handleUserNameClick = (userItem) => {
        setSelectedUser(userItem);
        setShowEditModal(true);
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
                                        <span 
                                            style={userNameClickableStyles}
                                            onClick={() => handleUserNameClick(userItem)}
                                            title="Click to edit user profile"
                                        >
                                            {userItem.first_name} {userItem.last_name}
                                        </span>
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
                                                        handleStatusToggleRequest(userItem);
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
                                                onChange={(e) => handleRoleUpdateRequest(userItem, parseInt(e.target.value))}
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

            {/* Edit User Modal */}
            <EditUserModal
                open={showEditModal}
                userData={selectedUser}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
            />

            {/* Status Toggle Confirmation Dialog */}
            <Dialog
                sx={{
                    '& .MuiDialog-paper': {
                    borderRadius: '12px',
                    backgroundColor: colors.secondary.lightGreen,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    minWidth: '400px',
                    },
                }}

                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="status-confirmation-dialog-title"
                aria-describedby="status-confirmation-dialog-description"
            >
                <DialogTitle id="status-confirmation-dialog-title">
                    {userToToggle?.is_active ? "Deactivate User?" : "Activate User?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="status-confirmation-dialog-description">
                        {userToToggle?.is_active 
                            ? `Are you sure you want to deactivate ${userToToggle?.first_name} ${userToToggle?.last_name}? This user will no longer be able to access the system.`
                            : `Are you sure you want to activate ${userToToggle?.first_name} ${userToToggle?.last_name}? This user will be able to access the system again.`
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            marginRight: '8px',
                            backgroundColor: colors.secondary.mediumGreen,
                            color: colors.white,
                            '&:hover': {
                                backgroundColor: colors.secondary.darkGray,
                            },
                            borderRadius: '8px',
                        }}
                        onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                    sx={{ 
                        marginRight: '8px',
                        backgroundColor: colors.primary.brightGreen,
                        color: colors.white,
                        '&:hover': {
                            backgroundColor: colors.primary.darkGreen,
                        },
                        borderRadius: '8px',
                    }}
                    onClick={handleConfirmStatusToggle} color="primary" autoFocus>
                        {userToToggle?.is_active ? "Yes, Deactivate" : "Yes, Activate"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Role Update Confirmation Dialog */}
            <Dialog
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '12px',
                        backgroundColor: colors.secondary.lightGreen,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        minWidth: '400px',
                    },
                }}
                open={roleDialogOpen}
                onClose={handleRoleDialogClose}
                aria-labelledby="role-confirmation-dialog-title"
                aria-describedby="role-confirmation-dialog-description"
            >
                <DialogTitle id="role-confirmation-dialog-title">
                    Change User Role?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="role-confirmation-dialog-description">
                        {userToUpdateRole && newRoleToSet &&
                            `Are you sure you want to change ${userToUpdateRole?.first_name} ${userToUpdateRole?.last_name}'s role to ${newRoleToSet === 1 ? 'Admin' : 'User'}? This will ${newRoleToSet === 1 ? 'grant administrative privileges' : 'remove administrative privileges'} for this user.`
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            marginRight: '8px',
                            backgroundColor: colors.secondary.mediumGreen,
                            color: colors.white,
                            '&:hover': {
                                backgroundColor: colors.secondary.darkGray,
                            },
                            borderRadius: '8px',
                        }}
                        onClick={handleRoleDialogClose}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        sx={{
                            marginRight: '8px',
                            backgroundColor: colors.primary.brightGreen,
                            color: colors.white,
                            '&:hover': {
                                backgroundColor: colors.primary.darkGreen,
                            },
                            borderRadius: '8px',
                        }}
                        onClick={handleConfirmRoleUpdate}
                        color="primary"
                        autoFocus
                    >
                        Yes, Change Role
                    </Button>
                </DialogActions>
            </Dialog>
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
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    width: 'fit-content',
    whiteSpace: 'nowrap'
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

const userNameClickableStyles = {
    color: colors.primary.darkGreen,
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: '600',
    transition: 'color 0.2s ease',
    ':hover': {
        color: colors.primary.brightGreen
    }
};

const modalOverlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContentStyles = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: '0',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0, 63, 45, 0.3)'
};

const modalHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: `2px solid ${colors.secondary.lightGreen}`,
    backgroundColor: colors.secondary.lightGreen
};

const modalTitleStyles = {
    color: colors.primary.darkGreen,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0
};

const modalCloseButtonStyles = {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: colors.primary.darkGreen,
    cursor: 'pointer',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const modalFormStyles = {
    padding: '1.5rem'
};

const modalFieldRowStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem'
};

const modalFieldGroupStyles = {
    marginBottom: '1rem'
};

const modalLabelStyles = {
    display: 'block',
    color: colors.primary.darkGreen,
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.5rem'
};

const modalInputStyles = {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${colors.secondary.paleGray}`,
    borderRadius: '8px',
    fontSize: '1rem',
    color: colors.secondary.darkGray,
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
};

const modalButtonGroupStyles = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem'
};

const modalButtonStyles = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

const modalSaveButtonStyles = {
    backgroundColor: colors.primary.darkGreen,
    color: colors.white
};

const modalCancelButtonStyles = {
    backgroundColor: colors.secondary.paleGray,
    color: colors.secondary.darkGray
};

const modalErrorStyles = {
    backgroundColor: '#fee',
    color: colors.danger,
    padding: '1rem',
    margin: '0 1.5rem',
    borderRadius: '8px',
    border: `1px solid ${colors.danger}`
};

const modalSuccessStyles = {
    backgroundColor: '#efe',
    color: colors.success,
    padding: '1rem',
    margin: '0 1.5rem',
    borderRadius: '8px',
    border: `1px solid ${colors.success}`
};

export default AdminPanel;
