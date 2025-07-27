import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { showSuccess, showError } from '../utils/snackbar';
import { useFormValidation, getPasswordStrength } from '../utils/validation';
import FormField from '../components/FormField';
import { colors } from '../utils/colors';



function SignUp() {
    const [profilePic, setProfilePic] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ strength: 0, text: '', color: '#ccc' });
    const [emailChecking, setEmailChecking] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    
    // Use the new validation hook with only required fields for signup
    const {
        form,
        errors,
        handleChange,
        handleBlur,
        validateAllFields,
        setFieldError,
        clearFieldError
    } = useFormValidation({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        contact_number: '',
        address: '',
        role_id: 2  // Default to regular user role (not shown in UI for signup)
    }, 'signup');

    // Custom password change handler
    const handlePasswordChange = (e) => {
        handleChange(e);
        setPasswordStrength(getPasswordStrength(e.target.value));
    };

    // Check email availability with improved error handling
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
            if (window.signupEmailTimeout) {
                clearTimeout(window.signupEmailTimeout);
            }
            
            // Set new timeout for email check
            window.signupEmailTimeout = setTimeout(() => {
                // Only check if field doesn't have validation errors
                if (!errors.email) {
                    checkEmailAvailability(email);
                }
            }, 1000);
        }
    };

    // Enhanced file change handler with better validation
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError(enqueueSnackbar, 'Please select a valid image file (JPEG, PNG, etc.)');
                e.target.value = ''; // Clear the input
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError(enqueueSnackbar, 'File size must be less than 5MB');
                e.target.value = ''; // Clear the input
                return;
            }
            
            setProfilePic(file);
        }
    };

    // Enhanced form submission with better error handling
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear any existing email check timeout
        if (window.signupEmailTimeout) {
            clearTimeout(window.signupEmailTimeout);
        }
        
        // Validate all fields before submission
        const isValid = validateAllFields();
        
        if (!isValid) {
            // Get all error messages for display
            const errorMessages = Object.values(errors).filter(error => error && error.trim() !== '');
            
            if (errorMessages.length > 0) {
                showError(enqueueSnackbar, 'Please fix the errors in the form');
            } else {
                showError(enqueueSnackbar, 'Please fill in all required fields correctly');
            }
            return;
        }
        
        setIsLoading(true);
        
        try {
            let profilePicBase64 = null;
            
            // Convert profile picture to base64 if selected
            if (profilePic) {
                profilePicBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(profilePic);
                });
            }
            
            // Create signup data - role_id is automatically set to 2 for signup
            const signupData = {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
                contact_number: form.contact_number || null,
                address: form.address || null,
                role_id: 2, // Always set to user role for signup
                profile_pic: profilePicBase64
            };
            
            // Send signup request
            await axios.post('/auth/signup', signupData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            showSuccess(enqueueSnackbar, 'Account created successfully! Please log in.');
            navigate('/login');
            
        } catch (error) {
            console.error('Error during sign up:', error);
            
            // Handle specific error messages from backend
            if (error.response?.data?.detail) {
                if (error.response.data.detail.includes('email')) {
                    setFieldError('email', 'Email is already registered');
                    showError(enqueueSnackbar, 'Email is already registered');
                } else {
                    showError(enqueueSnackbar, error.response.data.detail);
                }
            } else if (error.response?.status === 400) {
                showError(enqueueSnackbar, 'Invalid data provided. Please check your inputs.');
            } else if (error.response?.status === 500) {
                showError(enqueueSnackbar, 'Server error. Please try again later.');
            } else {
                showError(enqueueSnackbar, 'Sign up failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#C0D4CB', // Fallback color
            backgroundImage: 'url("/bg1.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)', // More transparent
                borderRadius: '12px',
                padding: '2rem',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)', // Stronger shadow
                backdropFilter: 'blur(15px)', // More blur
                border: '2px solid rgba(255, 255, 255, 0.3)' // More visible border
            }}>
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <h1 style={{color: '#003F2D', fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>
                        Create Account
                    </h1>
                    <p style={{color: '#7F8480', fontSize: '1rem', margin: 0}}>
                        Join us today
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{flex: 1}}>
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
                        </div>
                        <div style={{flex: 1}}>
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
                        </div>
                    </div>
                    
                    <FormField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleEmailChange}
                        onBlur={() => handleBlur('email')}
                        error={errors.email}
                        placeholder="Enter your email"
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
                        placeholder="Enter your password"
                        required
                    >
                        {form.password && (
                            <div style={{
                                marginTop: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    flex: 1,
                                    height: '4px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(passwordStrength.strength / 4) * 100}%`,
                                        backgroundColor: passwordStrength.color,
                                        transition: 'width 0.3s ease, background-color 0.3s ease',
                                        borderRadius: '2px'
                                    }} />
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: passwordStrength.color,
                                    minWidth: '80px'
                                }}>
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
                        placeholder="Enter your address"
                        isTextarea
                    />
                    
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', color: '#003F2D', fontWeight: '500', fontSize: '0.9rem'}}>
                            Profile Picture (Optional)
                        </label>
                        <input 
                            type="file" 
                            accept='image/*' 
                            onChange={handleFileChange}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '2px solid #CBCDCB',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                backgroundColor: 'white',
                                boxSizing: 'border-box'
                            }}
                        />
                        {profilePic && (
                            <p style={{
                                color: '#003F2D',
                                fontSize: '0.8rem',
                                marginTop: '0.25rem',
                                marginBottom: 0
                            }}>
                                Selected: {profilePic.name}
                            </p>
                        )}
                        <p style={{
                            color: '#7F8480',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem',
                            marginBottom: 0
                        }}>
                            Max size: 5MB. Supported formats: JPG, PNG, GIF
                        </p>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            backgroundColor: isLoading ? '#CBCDCB' : '#17E88F',
                            color: isLoading ? '#7F8480' : '#003F2D',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                
                <div style={{textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #CBCDCB'}}>
                    <p style={{color: '#7F8480', fontSize: '0.9rem', margin: 0}}>
                        Already have an account?{' '}
                        <button 
                            type="button" 
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: colors.primary.gray,
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;

