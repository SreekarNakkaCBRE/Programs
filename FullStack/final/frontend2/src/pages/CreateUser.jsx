import { useAuth } from '../context/AuthContext';
import { useState, useRef } from 'react';
import axios from '../api/axios';
import { colors } from '../utils/colors';
import { saveImageToStatic } from '../utils/profilePicUtils';
import { useSnackbar } from 'notistack';
import { CheckCircle } from '@mui/icons-material';

function CreateUser() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: 2 // Default to user role
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const profilePicRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        if (error) setError(''); // Clear error when user starts typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userData = { ...form };
            
            // Only try to save profile picture if a file is selected
            if (profilePicRef.current?.files?.[0]) {
                const profilePicUrl = await saveImageToStatic(profilePicRef.current.files[0]);
                if (profilePicUrl) {
                    userData.profile_pic = profilePicUrl;
                }
            }
            
            await axios.post('/users/create', userData);
            enqueueSnackbar('User created successfully!', {
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
            // Reset form
            setForm({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role_id: 2
            });
            if (profilePicRef.current) {
                profilePicRef.current.value = '';
            }
        } catch (error) {
            setError(error.response?.data?.detail || 'User creation failed. Please try again.');
            console.error('Error during user creation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={containerStyles}>
            <div style={cardStyles}>
                <div style={headerStyles}>
                    <h1 style={titleStyles}>Create User</h1>
                    <p style={subtitleStyles}>Fill in the details below</p>
                </div>
                
                <form onSubmit={handleSubmit} style={formStyles}>
                    {error && (
                        <div style={errorStyles}>
                            {error}
                        </div>
                    )}
                    
                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>First Name</label>
                        <input
                            name="first_name"
                            type="text"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                            style={inputStyles}
                        />
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Last Name</label>
                        <input
                            name="last_name"
                            type="text"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                            style={inputStyles}
                        />
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Email Address</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Enter user's email"
                            value={form.email}
                            onChange={handleChange}
                            style={inputStyles}
                            required
                        />
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={handleChange}
                            style={inputStyles}
                            required
                            minLength="6"
                        />
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Role</label>
                        <select
                            name="role_id"
                            value={form.role_id}
                            onChange={handleChange}
                            style={inputStyles}
                            required
                        >
                            <option value={2}>User</option>
                            <option value={1}>Admin</option>
                        </select>
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Profile Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={profilePicRef}
                            style={inputStyles}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{
                            ...buttonStyles,
                            backgroundColor: isLoading ? colors.secondary.lightGray : colors.primary.darkGreen,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Creating User...' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateUser;

const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: colors.background
};
const cardStyles = {
    backgroundColor: colors.white,
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '400px',
    maxWidth: '90%'
};
const headerStyles = {
    textAlign: 'center',
    marginBottom: '20px'
};
const titleStyles = {
    fontSize: '24px',
    color: colors.primary.darkGreen,
    margin: 0
};
const subtitleStyles = {
    color: colors.secondary.darkGray,
    fontSize: '14px',
    margin: 0
};
const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};
const fieldGroupStyles = {
    display: 'flex',
    flexDirection: 'column'
};
const labelStyles = {
    marginBottom: '5px',
    color: colors.primary.darkGreen,
    fontWeight: '500'
};
const inputStyles = {
    padding: '10px',
    borderRadius: '4px',
    border: `1px solid ${colors.secondary.mediumGreen}`,
    fontSize: '14px',
    color: colors.primary.darkGreen
};
const errorStyles = {
    color: colors.danger,
    marginBottom: '15px',
    textAlign: 'center'
};
const buttonStyles = {
    padding: '12px 20px',
    backgroundColor: colors.primary.darkGreen,
    color: colors.white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.3s ease'
};
