import { useAuth } from '../context/AuthContext';
import { useState, useRef } from 'react';
import axios from '../api/axios';
import { colors } from '../utils/colors';
import { getImageUrl } from '../config/api';
import { useSnackbar } from 'notistack';
import { showSuccess, showError } from '../utils/snackbar';
import { ConfirmationDialog } from '../utils/dialog';
import { useFormValidation } from '../utils/validation';
import FormField from '../components/FormField';
import {
    pageContainer
} from '../utils/commonStyles';

function Profile() {
    const { user, setUser } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const fileInputRef = useRef(null);
    
    // Use the custom validation hook for profile
    const {
        form: formData,
        errors,
        handleChange: handleInputChange,
        handleBlur,
        validateAllFields,
        updateForm
    } = useFormValidation({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        contact_number: user?.contact_number || '',
        address: user?.address || ''
    }, 'profile');

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError(enqueueSnackbar, 'Please select a valid image file (JPEG, PNG, etc.)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError(enqueueSnackbar, 'File size must be less than 5MB');
                return;
            }

            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicPreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            if (error) setError('');
        }
    };

    const handleProfilePicClick = () => {
        fileInputRef.current?.click();
    };

    const removeProfilePic = () => {
        setProfilePicFile(null);
        setProfilePicPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        try {
            // Validate form before submission
            if (!validateAllFields()) {
                showError(enqueueSnackbar, 'Please fix the errors');
                return;
            }
            
            setLoading(true);
            setError('');

            // Prepare form data including profile picture
            const updateData = { ...formData };
            
            // If a new profile picture is selected, convert to base64
            if (profilePicFile) {
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(profilePicFile);
                });
                updateData.profile_pic = base64Data;
            }

            // Update profile data (including profile picture if provided)
            const response = await axios.put('/users/Update_my_profile', updateData);

            // Update user context with response data
            setUser(prev => ({
                ...prev,
                first_name: updateData.first_name,
                last_name: updateData.last_name,
                contact_number: updateData.contact_number,
                address: updateData.address,
                ...(response.data.user.profile_pic && { profile_pic: response.data.user.profile_pic })
            }));

            showSuccess(enqueueSnackbar, 'Profile updated successfully!');
            
            setIsEditing(false);
            setProfilePicFile(null);
            setProfilePicPreview(null);
        } catch (error) {
            showError(enqueueSnackbar, 'Error updating profile. Please try again.');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    const handleConfirmSave = () => {
        setDialogOpen(false);
        handleSave();
    };

    const handleCancel = () => {
        updateForm({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            contact_number: user?.contact_number || '',
            address: user?.address || ''
        });
        setIsEditing(false);
        setError('');
        setProfilePicFile(null);
        setProfilePicPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!user) {
        return (
            <div style={pageContainer}>
                <div style={loadingStyles}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={pageContainer}>
            <div style={headerStyles}>
                <h1 style={titleStyles}>My Profile</h1>
                <p style={subtitleStyles}>Manage your personal information</p>
            </div>
            
            <div style={profileCardStyles}>
                <div style={profileHeaderStyles}>
                    <div style={userInfoHeaderStyles}>
                        <div style={avatarStyles}>
                            {user.profile_pic ? (
                                <img 
                                    src={getImageUrl(user.profile_pic)} 
                                    alt="Profile" 
                                    style={profileImageStyles}
                                />
                            ) : (
                                <span style={avatarInitialsStyles}>
                                    {user.first_name?.[0]?.toUpperCase() + user.last_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 style={userNameStyles}>{user.first_name} {user.last_name}</h2>
                            <p style={userRoleStyles}>{user.role?.name || 'User'}</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button style={editButtonStyles} onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                    
                </div>

                {error && (
                    <div style={errorStyles}>
                        {error}
                    </div>
                )}

                <div style={profileContentStyles}>
                    <div style={fieldRowStyles}>
                        <div style={fieldGroupStyles}>
                            <label style={labelStyles}>First Name</label>
                            {isEditing ? (
                                <FormField
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('first_name')}
                                    error={errors.first_name}
                                    style={{margin: 0}}
                                />
                            ) : (
                                <span style={valueStyles}>{user.first_name}</span>
                            )}
                        </div>

                        <div style={fieldGroupStyles}>
                            <label style={labelStyles}>Last Name</label>
                            {isEditing ? (
                                <FormField
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('last_name')}
                                    error={errors.last_name}
                                    style={{margin: 0}}
                                />
                            ) : (
                                <span style={valueStyles}>{user.last_name}</span>
                            )}
                        </div>
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Email Address</label>
                        <span style={{...valueStyles, color: colors.secondary.darkGray}}>
                            {user.email} (Cannot be changed)
                        </span>
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Contact Number</label>
                        {isEditing ? (
                            <FormField
                                name="contact_number"
                                type="tel"
                                value={formData.contact_number}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('contact_number')}
                                error={errors.contact_number}
                                placeholder="Enter 10-digit mobile number"
                                maxLength={10}
                                hint="10-digit mobile number (starts with 6-9)"
                                style={{margin: 0}}
                            />
                        ) : (
                            <span style={valueStyles}>{user.contact_number || 'Not provided'}</span>
                        )}
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Address</label>
                        {isEditing ? (
                            <FormField
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('address')}
                                error={errors.address}
                                placeholder="Enter your address"
                                isTextarea
                                style={{margin: 0}}
                            />
                        ) : (
                            <span style={valueStyles}>{user.address || 'Not provided'}</span>
                        )}
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Role</label>
                        <span style={{
                            ...roleTagStyles,
                            backgroundColor: user.role?.name === 'admin' 
                                ? colors.primary.brightGreen 
                                : colors.secondary.blueGray,
                            color: user.role?.name === 'admin'
                                ? colors.primary.darkGreen
                                : colors.white
                        }}>
                            {user.role?.name || 'User'}
                        </span>
                    </div>

                    {isEditing && (
                        <div style={fieldGroupStyles}>
                            <label style={labelStyles}>Profile Picture</label>
                            <div style={profilePicUploadSectionStyles}>
                                <div style={currentProfilePicStyles}>
                                    <div style={profilePicDisplayStyles}>
                                        {profilePicPreview ? (
                                            <img 
                                                src={profilePicPreview} 
                                                alt="Profile Preview" 
                                                style={previewImageStyles}
                                            />
                                        ) : user.profile_pic ? (
                                            <img 
                                                src={getImageUrl(user.profile_pic)} 
                                                alt="Profile" 
                                                style={previewImageStyles}
                                            />
                                        ) : (
                                            <div style={placeholderImageStyles}>
                                                <span style={placeholderTextStyles}>No Image</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={profilePicActionsStyles}>
                                        <button 
                                            type="button"
                                            style={uploadButtonStyles}
                                            onClick={handleProfilePicClick}
                                        >
                                            📷 Choose Image
                                        </button>
                                        {(profilePicFile || profilePicPreview) && (
                                            <button 
                                                type="button"
                                                style={removeButtonStyles}
                                                onClick={removeProfilePic}
                                            >
                                                ✕ Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={uploadHintStyles}>
                                    <small>Upload a new profile picture (max 5MB, JPG/PNG)</small>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePicChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div style={buttonGroupStyles}>
                            <button 
                                style={{
                                    ...saveButtonStyles,
                                    ...(loading ? disabledButtonStyles : {})
                                }}
                                onClick={handleClickOpen}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                style={cancelButtonStyles} 
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={dialogOpen}
                onClose={handleClose}
                onConfirm={handleConfirmSave}
                title="Confirm Save Changes?"
                message="Are you sure you want to save your profile changes? This action will update your personal information."
                confirmText="Yes, Save Changes"
            />
        </div>
    );
}

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

const profileCardStyles = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 63, 45, 0.1)',
    border: `1px solid ${colors.secondary.paleGray}`
};

const profileHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem',
    borderBottom: `1px solid ${colors.secondary.paleGray}`
};

const userInfoHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};

const avatarStyles = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    position: 'relative',
    overflow: 'hidden'
};

const userNameStyles = {
    color: colors.primary.darkGreen,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.25rem 0'
};

const userRoleStyles = {
    color: colors.secondary.darkGray,
    fontSize: '1rem',
    margin: 0,
    textTransform: 'capitalize'
};

const profileContentStyles = {
    padding: '2rem'
};

const fieldRowStyles = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
};

const fieldGroupStyles = {
    marginBottom: '1.5rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
};

const labelStyles = {
    fontWeight: '600',
    color: colors.primary.darkGreen,
    fontSize: '0.9rem'
};

const valueStyles = {
    color: colors.secondary.darkGray,
    fontSize: '1rem',
    padding: '0.75rem 0'
};


const roleTagStyles = {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    
    letterSpacing: '0.5px',
    width: 'fit-content',
    whiteSpace: 'nowrap'
};

const editButtonStyles = {
    
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
};

const buttonGroupStyles = {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${colors.secondary.paleGray}`
};

const saveButtonStyles = {
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
};

const cancelButtonStyles = {
    backgroundColor: colors.secondary.darkGray,
    color: colors.white,
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
};

const disabledButtonStyles = {
    backgroundColor: colors.secondary.paleGray,
    color: colors.secondary.darkGray,
    cursor: 'not-allowed'
};

const errorStyles = {
    backgroundColor: '#fee',
    color: colors.danger,
    padding: '1rem',
    borderRadius: '6px',
    margin: '0 2rem',
    fontSize: '0.9rem',
    border: `1px solid ${colors.danger}`
};


const profileImageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%'
};

const avatarInitialsStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    fontSize: '2rem',
    fontWeight: 'bold'
};

const profilePicUploadSectionStyles = {
    border: `2px dashed ${colors.secondary.paleGray}`,
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: colors.secondary.lightGray
};

const currentProfilePicStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem'
};

const profilePicDisplayStyles = {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `2px solid ${colors.secondary.paleGray}`
};

const previewImageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
};

const placeholderImageStyles = {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary.paleGray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const placeholderTextStyles = {
    fontSize: '0.8rem',
    color: colors.secondary.darkGray
};

const profilePicActionsStyles = {
    display: 'flex',
    gap: '0.5rem',
    flexDirection: 'column'
};

const uploadButtonStyles = {
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600'
};

const removeButtonStyles = {
    backgroundColor: colors.danger,
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600'
};

const uploadHintStyles = {
    color: colors.secondary.darkGray,
    fontSize: '0.85rem',
    textAlign: 'center'
};

export default Profile;
