import {useState} from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { CheckCircle } from '@mui/icons-material';



function SignUp(){

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        contact_number: '',
        address: '',
    });
    const [profile_pic, setProfilePic] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleChange = (e) => {
        setForm({
            ...form, [e.target.name]: e.target.value
        });
        if (error) setError('');
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (JPG, PNG, etc.)');
                e.target.value = ''; // Clear the input
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                e.target.value = ''; // Clear the input
                return;
            }
            
            setProfilePic(file);
            if (error) setError(''); // Clear any previous errors
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Create signup data as JSON (not FormData) to match backend expectations
        const signupData = {
            ...form,
            profile_pic: profile_pic ? profile_pic.name : null // Backend expects filename as string
        };
        
        try {
            // Send as JSON, not FormData, since backend expects JSON
            await axios.post('/auth/signup', signupData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            enqueueSnackbar('Sign up successful! Please log in.', { 
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
            //alert('Sign up successful! Please log in.');
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.detail || 'Sign up failed. Please try again.');
            console.error('Error during sign up:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#C0D4CB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                width: '100%',
                maxWidth: '500px'
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
                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            color: 'red',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
                        <div style={{marginBottom: '1.5rem', flex: 1}}>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#003F2D', fontWeight: '500', fontSize: '0.9rem'}}>
                                First Name
                            </label>
                            <input
                                name="first_name"
                                type="text"
                                placeholder="Enter first name"
                                value={form.first_name}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #CBCDCB',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    backgroundColor: 'white',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                        <div style={{marginBottom: '1.5rem', flex: 1}}>
                            <label style={{display: 'block', marginBottom: '0.5rem', color: '#003F2D', fontWeight: '500', fontSize: '0.9rem'}}>
                                Last Name
                            </label>
                            <input
                                name="last_name"
                                type="text"
                                placeholder="Enter last name"
                                value={form.last_name}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #CBCDCB',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    backgroundColor: 'white',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                    </div>
                    
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', color: '#003F2D', fontWeight: '500', fontSize: '0.9rem'}}>
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #CBCDCB',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                    
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', color: '#003F2D', fontWeight: '500', fontSize: '0.9rem'}}>
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #CBCDCB',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                    
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', color: '#003F2D', fontWeight: '500', fontSize: '0.9rem'}}>
                            Contact Number
                        </label>
                        <input
                            name="contact_number"
                            type="tel"
                            maxLength={10}
                            minLength={10}
                            placeholder="Enter your phone number"
                            value={form.contact_number}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #CBCDCB',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={{display: 'block', marginBottom: '0.5rem', color: '#003F2D', fontWeight: '500', fontSize: '0.9rem'}}>
                            Address
                        </label>
                        <textarea
                            name="address"
                            placeholder="Enter your address"
                            value={form.address}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #CBCDCB',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                backgroundColor: 'white',
                                minHeight: '80px',
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    
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
                        {profile_pic && (
                            <p style={{
                                color: '#003F2D',
                                fontSize: '0.8rem',
                                marginTop: '0.25rem',
                                marginBottom: 0
                            }}>
                                Selected: {profile_pic.name}
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
                                color: '#17E88F',
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