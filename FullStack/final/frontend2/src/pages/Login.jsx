import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';
import { useSnackbar } from 'notistack';
import { CheckCircle, Error } from '@mui/icons-material';


function Login() {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { enqueueSnackbar } = useSnackbar();


    const handleChange = (e) => {
        setForm({
            ...form, 
            [e.target.name]: e.target.value
        });
        if (error) setError(''); // Clear error when user starts typin
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            // Send plain password - backend handles hashing and verification
            await login(form.email, form.password);
            
            // Show success message with Material-UI styling
            enqueueSnackbar('Login successful! Welcome back.', { 
                variant: 'success',
                autoHideDuration: 3000,
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
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

            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
            // Show error message in snackbar with Material-UI styling
            enqueueSnackbar(errorMessage, { 
                variant: 'error',
                autoHideDuration: 5000,
                anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
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
                    {error && (
                        <div style={errorStyles}>
                            {error}
                        </div>
                    )}
                    
                    <div style={fieldGroupStyles}>
                        <label style={labelStyles}>Email Address</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            style={inputStyles}
                            required
                        />
                    </div>
                    
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
    minHeight: '95vh',
    backgroundColor: colors.secondary.lightGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
};

const cardStyles = {
    backgroundColor: colors.white,
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

const fieldGroupStyles = {
    marginBottom: '1.5rem'
};

const labelStyles = {
    display: 'block',
    marginBottom: '0.5rem',
    color: colors.primary.darkGreen,
    fontWeight: '500',
    fontSize: '0.9rem'
};

const inputStyles = {
    width: '100%',
    padding: '0.75rem',
    border: `2px solid ${colors.secondary.paleGray}`,
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: colors.white,
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
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

const errorStyles = {
    backgroundColor: '#fee',
    color: colors.danger,
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: `1px solid ${colors.danger}`
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
    color: colors.primary.brightGreen,
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
};

export default Login;
