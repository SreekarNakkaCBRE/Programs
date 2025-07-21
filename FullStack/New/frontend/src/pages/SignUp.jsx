import {useState} from 'react';
import {TextField, Button, Container, Paper, Box, Typography, Alert, Input} from '@mui/material';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';


export default function SignUp() {
    const [form, setForm] = useState({ 
        first_name: "", 
        last_name: "",
        email: "", 
        password: "", 
        contact_number: "", 
        address: "",
        profile_pic: null,
        role_id: 2 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, profile_pic: file });
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Create FormData for file upload
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (form[key] !== null) {
                    formData.append(key, form[key]);
                }
            });

            const res = await axios.post("/auth/signup", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log("User created successfully:", res.data);
            navigate("/login");
        } catch (error) {
            console.error("Signup failed:", error);
            setError(error.response?.data?.detail || 'Signup failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component={Paper} maxWidth="xs" sx={{ padding: 4, mt: 8 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Sign Up
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box component="form" noValidate onSubmit={handleSubmit}>
                <TextField
                    label="First Name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Last Name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Contact Number"
                    name="contact_number"
                    value={form.contact_number}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Address"
                    name="address"
                    multiline
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                
                <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                        Profile Picture
                    </Typography>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        fullWidth
                    />
                    {imagePreview && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    objectFit: 'cover', 
                                    borderRadius: '50%' 
                                }} 
                            />
                        </Box>
                    )}
                </Box>

                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </Box>

            <Typography variant="body2" align="center">
                Already have an account? <Link to="/login">Log in</Link>
            </Typography>
        </Container>
    );
}