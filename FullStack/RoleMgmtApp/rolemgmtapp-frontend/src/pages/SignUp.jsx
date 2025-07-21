import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    contact_number: '',
    address: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await API.post('/auth/signup', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="First Name" onChange={handleChange} required /><br />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required /><br />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required /><br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br />
        <input name="contact_number" placeholder="Contact Number" onChange={handleChange} /><br />
        <input name="address" placeholder="Address" onChange={handleChange} /><br />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Signup;
