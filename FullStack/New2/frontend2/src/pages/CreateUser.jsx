import { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import { colors } from '../utils/colors';
import { useSnackbar } from 'notistack';
import { showSuccess, showError } from '../utils/snackbar';
import { formInput, flexColumn } from '../utils/commonStyles';
import { getPasswordStrength, useFormValidation } from '../utils/validation';
import FormField from '../components/FormField';

// Constants
const DEFAULT_USER_ROLE = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const INITIAL_PASSWORD_STRENGTH = { strength: 0, text: '', color: '#ccc' };
const INITIAL_FORM_STATE = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    contact_number: '',
    address: '',
    role_id: DEFAULT_USER_ROLE
};

function CreateUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(INITIAL_PASSWORD_STRENGTH);
    const [emailChecking, setEmailChecking] = useState(false);
    const profilePicRef = useRef(null);
    const { enqueueSnackbar } = useSnackbar();

    // Use the custom validation hook
    const {
        form,
        errors,
        handleChange,
        handleBlur,
        validateAllFields,
        setForm,
        setFieldError,
        clearFieldError
    } = useFormValidation(INITIAL_FORM_STATE, 'createUser');

    // Cleanup effect to clear email check timeout
    useEffect(() => {
        return () => {
            if (window.createUserEmailTimeout) {
                clearTimeout(window.createUserEmailTimeout);
            }
        };
    }, []);

    // Custom password change handler to manage password strength
    const handlePasswordChange = (e) => {
        handleChange(e);
        if (e.target.name === 'password') {
            setPasswordStrength(getPasswordStrength(e.target.value));
        }
    };

    // Helper function to convert file to base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Helper function to validate profile picture
    const validateProfilePicture = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            setFieldError('profile_pic', 'Profile picture must be less than 5MB');
            return false;
        }

        if (!file.type.startsWith('image/')) {
            setFieldError('profile_pic', 'Please select a valid image file');
            return false;
        }

        clearFieldError('profile_pic');
        return true;
    };

    // Helper function to reset form
    const resetForm = () => {
        setForm(INITIAL_FORM_STATE);
        setPasswordStrength(INITIAL_PASSWORD_STRENGTH);
        if (profilePicRef.current) {
            profilePicRef.current.value = '';
        }
        clearFieldError('profile_pic');
    };

    // Check email availability
    const checkEmailAvailability = async (email) => {
        if (!email || !email.includes('@')) return;
        
        setEmailChecking(true);
        clearFieldError('email');
        
        try {
            const response = await axios.get(`/users/check-email?email=${encodeURIComponent(email)}`);
            if (!response.data.available) {
                setFieldError('email', 'Email is already registered');
            }
        } catch (error) {
            console.error('Error checking email:', error);
            setFieldError('email', 'Error checking email availability');
        } finally {
            setEmailChecking(false);
        }
    };

    // Enhanced email change handler with debounced availability check
    const handleEmailChange = (e) => {
        handleChange(e);
        clearFieldError('email');
        
        const email = e.target.value;
        // Only check availability if email seems valid and complete
        if (email && email.includes('@') && email.includes('.') && email.length > 5) {
            // Clear any existing timeout
            if (window.createUserEmailTimeout) {
                clearTimeout(window.createUserEmailTimeout);
            }
            
            // Set new timeout for email check
            window.createUserEmailTimeout = setTimeout(() => {
                // Only check if field doesn't have validation errors
                if (!errors.email) {
                    checkEmailAvailability(email);
                }
            }, 1000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear any existing email check timeout
        if (window.createUserEmailTimeout) {
            clearTimeout(window.createUserEmailTimeout);
        }
        
        setIsLoading(true);

        // Validate form before submission
        if (!validateAllFields()) {
            setIsLoading(false);
            
            // Get all error messages for display
            const errorMessages = Object.values(errors).filter(error => error && error.trim() !== '');
            
            if (errorMessages.length > 0) {
                showError(enqueueSnackbar, 'Please fix the errors in the form');
            } else {
                showError(enqueueSnackbar, 'Please fill in all required fields correctly');
            }
            return;
        }

        try {
            const userData = { 
                ...form,
                // Clean contact number (remove formatting)
                contact_number: form.contact_number ? form.contact_number.replace(/\D/g, '') : ''
            };
            
            // Convert profile picture to base64 if a file is selected
            if (profilePicRef.current?.files?.[0]) {
                const file = profilePicRef.current.files[0];
                
                if (!validateProfilePicture(file)) {
                    setIsLoading(false);
                    return;
                }

                userData.profile_pic = await convertFileToBase64(file);
            }
            
            await axios.post('/users/create', userData);
            showSuccess(enqueueSnackbar, 'User created successfully!');
            resetForm();
        } catch (error) {
            console.error('Error during user creation:', error);
            
            // Handle specific error messages from backend
            if (error.response?.data?.detail) {
                if (error.response.data.detail.includes('email')) {
                    setFieldError('email', 'Email is already registered');
                    showError(enqueueSnackbar, 'Email address is already in use');
                } else {
                    showError(enqueueSnackbar, error.response.data.detail);
                }
            } else {
                showError(enqueueSnackbar, 'User creation failed. Please try again.');
            }
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
                    <FormField
                        label="First Name"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        onBlur={() => handleBlur('first_name')}
                        error={errors.first_name}
                        placeholder="Enter first name"
                        required
                    />

                    <FormField
                        label="Last Name"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        onBlur={() => handleBlur('last_name')}
                        error={errors.last_name}
                        placeholder="Enter last name"
                        required
                    />

                    <FormField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleEmailChange}
                        onBlur={() => handleBlur('email')}
                        error={errors.email}
                        placeholder="Enter user's email"
                        required
                    >
                        {emailChecking && (
                            <div style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '4px'
                            }}>
                                Checking email availability...
                            </div>
                        )}
                    </FormField>

                    <FormField
                        label="Password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handlePasswordChange}
                        onBlur={() => handleBlur('password')}
                        error={errors.password}
                        placeholder="Enter password"
                        required
                        minLength="8"
                    >
                        {form.password && (
                            <div style={passwordStrengthContainerStyles}>
                                <div style={passwordStrengthBarStyles}>
                                    <div 
                                        style={{
                                            ...passwordStrengthFillStyles,
                                            width: `${(passwordStrength.strength / 4) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    />
                                </div>
                                <span style={{...passwordStrengthTextStyles, color: passwordStrength.color}}>
                                    {passwordStrength.text}
                                </span>
                            </div>
                        )}
                    </FormField>

                    <FormField
                        label="Contact Number"
                        name="contact_number"
                        type="tel"
                        value={form.contact_number}
                        onChange={handleChange}
                        onBlur={() => handleBlur('contact_number')}
                        error={errors.contact_number}
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        hint="10-digit Indian mobile number (starts with 6-9)"
                    />

                    <FormField
                        label="Address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        onBlur={() => handleBlur('address')}
                        error={errors.address}
                        placeholder="Enter address"
                        isTextarea
                    />

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Role *</label>
                        <select
                            name="role_id"
                            value={form.role_id}
                            onChange={handleChange}
                            onBlur={() => handleBlur('role_id')}
                            style={{
                                ...inputStyles,
                                borderColor: errors.role_id ? colors.danger : inputStyles.borderColor
                            }}
                            required
                        >
                            <option value={2}>User</option>
                            <option value={1}>Admin</option>
                        </select>
                        {errors.role_id && (
                            <div style={fieldErrorStyles}>{errors.role_id}</div>
                        )}
                    </div>

                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Profile Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={profilePicRef}
                            style={{
                                ...inputStyles,
                                borderColor: errors.profile_pic ? colors.danger : inputStyles.borderColor
                            }}
                        />
                        <div style={fileHintStyles}>
                            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                        </div>
                        {errors.profile_pic && (
                            <div style={fieldErrorStyles}>{errors.profile_pic}</div>
                        )}
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

const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '70vh',
    backgroundColor: colors.background,
    padding: '5px',
    boxSizing: 'border-box'
};
const cardStyles = {
    backgroundColor: colors.white,
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    boxSizing: 'border-box'
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
    ...flexColumn,
    gap: '15px'
};
const fieldGroupStyles = flexColumn;
const labelStyles = {
    marginBottom: '5px',
    color: colors.primary.darkGreen,
    fontWeight: '500'
};
const inputStyles = formInput;
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
    transition: 'background-color 0.3s ease',
    width: '100%',
    boxSizing: 'border-box'
};

const fieldErrorStyles = {
    color: colors.danger,
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '400'
};

const passwordStrengthContainerStyles = {
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const passwordStrengthBarStyles = {
    flex: 1,
    height: '4px',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden'
};

const passwordStrengthFillStyles = {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
    borderRadius: '2px'
};

const passwordStrengthTextStyles = {
    fontSize: '12px',
    fontWeight: '500',
    minWidth: '80px'
};

const fileHintStyles = {
    fontSize: '11px',
    color: colors.secondary.darkGray,
    marginTop: '4px',
    fontStyle: 'italic'
};

export default CreateUser;
