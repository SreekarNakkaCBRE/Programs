import { useAuth } from '../context/AuthContext';
import { useState, useRef } from 'react';
import axios from '../api/axios';
import { colors } from '../utils/colors';
import { saveImageToStatic, loadImageFromStatic } from '../utils/profilePicUtils';

function Profile() {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        contact_number: user?.contact_number || '',
        address: user?.address || ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicPreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            if (error) setError('');
            if (success) setSuccess('');
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
            setLoading(true);
            setError('');

            // Update profile data
            await axios.put('/users/Update_my_profile', formData);

            // Save profile picture to static folder if selected
            if (profilePicFile) {
                try {
                    const fileName = `profile_${user.id}_${Date.now()}.${profilePicFile.name.split('.').pop()}`;
                    const staticImageUrl = await saveImageToStatic(profilePicFile, fileName);
                    
                    // Update user context with static file path
                    setUser(prev => ({
                        ...prev,
                        profile_pic: staticImageUrl
                    }));
                } catch (picError) {
                    console.error('Profile picture save failed:', picError);
                    setError('Profile updated but profile picture save failed');
                }
            }

            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setProfilePicFile(null);
            setProfilePicPreview(null);
        } catch (error) {
            setError('Error updating profile. Please try again.');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            contact_number: user?.contact_number || '',
            address: user?.address || ''
        });
        setIsEditing(false);
        setError('');
        setSuccess('');
        setProfilePicFile(null);
        setProfilePicPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!user) {
        return (
            <div style={containerStyles}>
                <div style={loadingStyles}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={containerStyles}>
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
                                    src={loadImageFromStatic(user.profile_pic)} 
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

                {success && (
                    <div style={successStyles}>
                        {success}
                    </div>
                )}

                <div style={profileContentStyles}>
                    <div style={fieldRowStyles}>
                        <div style={fieldGroupStyles}>
                            <label style={labelStyles}>First Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    style={inputStyles}
                                />
                            ) : (
                                <span style={valueStyles}>{user.first_name}</span>
                            )}
                        </div>

                        <div style={fieldGroupStyles}>
                            <label style={labelStyles}>Last Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    style={inputStyles}
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
                            <input
                                type="tel"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleInputChange}
                                style={inputStyles}
                                placeholder="Enter your phone number"
                            />
                        ) : (
                            <span style={valueStyles}>{user.contact_number || 'Not provided'}</span>
                        )}
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Address</label>
                        {isEditing ? (
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                style={{...inputStyles, minHeight: '80px', resize: 'vertical'}}
                                placeholder="Enter your address"
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
                                                src={loadImageFromStatic(user.profile_pic)} 
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
                                onClick={handleSave}
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

const inputStyles = {
    padding: '0.75rem',
    border: `2px solid ${colors.secondary.paleGray}`,
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: colors.white,
    transition: 'border-color 0.3s ease'
};

const roleTagStyles = {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
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

const successStyles = {
    backgroundColor: '#efe',
    color: colors.success,
    padding: '1rem',
    borderRadius: '6px',
    margin: '0 2rem',
    fontSize: '0.9rem',
    border: `1px solid ${colors.success}`
};

const profilePicContainerStyles = {
    position: 'relative',
    display: 'inline-block'
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

const profilePicHintStyles = {
    fontSize: '0.8rem',
    color: colors.secondary.darkGray,
    fontStyle: 'italic',
    marginTop: '0.5rem'
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
