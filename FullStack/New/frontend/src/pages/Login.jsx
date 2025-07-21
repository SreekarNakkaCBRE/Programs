import { useState } from "react";
import { TextField, Button, Container, Typography, Box, Paper, Alert } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post("/auth/login", form);
            login(res.data.access_token);
            navigate("/dashboard");
        }
        catch (error) {
            setError(error.response?.data?.detail || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component={Paper} maxWidth="xs" sx={{ padding: 4, mt: 8 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Login
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box component="form" noValidate onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    name="email"
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
                <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </Box>
            
            <Typography variant="body2" align="center">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </Typography>
        </Container>
    );
}