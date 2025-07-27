import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';
import { useSnackbar } from 'notistack';
import { showSuccess, showError } from '../utils/snackbar';
import { useFormValidation } from '../utils/validation';
import FormField from '../components/FormField';


function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // Use the custom validation hook
    const {
        form,
        errors,
        handleChange,
        handleBlur
    } = useFormValidation({
        email: '',
        password: ''
    }, 'login');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            await login(form.email, form.password);
            showSuccess(enqueueSnackbar, 'Login successful! Welcome back.');
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
            showError(enqueueSnackbar, errorMessage);
            console.error('Error during login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={containerStyles}>
            <div style={cardStyles}>
                <div style={headerStyles}>
                    <h1 style={titleStyles}>Welcome Back</h1>
                    <p style={subtitleStyles}>Sign in to your account</p>
                </div>
                
                <form onSubmit={handleSubmit} style={formStyles}>
                    
                    <FormField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        error={errors.email}
                        placeholder="Enter your email"
                        required
                    />
                    
                    <FormField
                        label="Password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        error={errors.password}
                        placeholder="Enter your password"
                        required
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        style={{
                            ...buttonStyles,
                            ...(isLoading ? disabledButtonStyles : {})
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div style={footerStyles}>
                    <p style={linkTextStyles}>
                        Don't have an account?{' '}
                        <button 
                            type="button" 
                            onClick={() => navigate('/signup')}
                            style={linkButtonStyles}
                        >
                            Create Account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

const containerStyles = {
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
    
};

const cardStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 63, 45, 0.15)',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    border: `1px solid ${colors.secondary.mediumGreen}`
};

const headerStyles = {
    textAlign: 'center',
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
    fontSize: '1rem',
    margin: 0
};

const formStyles = {
    marginBottom: '1.5rem'
};

const buttonStyles = {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: colors.primary.brightGreen,
    color: colors.primary.darkGreen,
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
};

const disabledButtonStyles = {
    backgroundColor: colors.secondary.paleGray,
    color: colors.secondary.darkGray,
    cursor: 'not-allowed'
};

const footerStyles = {
    textAlign: 'center',
    paddingTop: '1rem',
    borderTop: `1px solid ${colors.secondary.paleGray}`
};

const linkTextStyles = {
    color: colors.secondary.darkGray,
    fontSize: '0.9rem',
    margin: 0
};

const linkButtonStyles = {
    background: 'none',
    border: 'none',
    color: colors.primary.gray,
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
};

export default Login;
