import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    address: ''
  });
  const [updateMsg, setUpdateMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await API.get('/users/profile');
      setProfileData(res.data);
      setFormData({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        email: res.data.email,
        contact_number: res.data.contact_number || '',
        address: res.data.address || ''
      });
    } catch (err) {
      setError('Failed to fetch profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg('');
    try {
      await API.put('/users/profile', formData);
      setUpdateMsg('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setUpdateMsg(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>My Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!isEditing ? (
        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Name:</strong> {profileData.first_name} {profileData.last_name}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Email:</strong> {profileData.email}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Role:</strong> {profileData.role}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Contact:</strong> {profileData.contact_number || 'Not provided'}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Address:</strong> {profileData.address || 'Not provided'}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Status:</strong> 
            <span style={{ color: profileData.is_active ? 'green' : 'red', marginLeft: '10px' }}>
              {profileData.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '5px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label>First Name:</label><br/>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Last Name:</label><br/>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label><br/>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Contact Number:</label><br/>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Address:</label><br/>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px', height: '60px' }}
            />
          </div>
          <button 
            type="submit"
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Update Profile
          </button>
          <button 
            type="button"
            onClick={() => setIsEditing(false)}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </form>
      )}
      
      {updateMsg && (
        <p style={{ 
          color: updateMsg.includes('successfully') ? 'green' : 'red',
          marginTop: '10px',
          fontWeight: 'bold'
        }}>
          {updateMsg}
        </p>
      )}
    </div>
  );
};

export default Profile;