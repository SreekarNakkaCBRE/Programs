import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/users/me');
        setProfile(res.data);
      } catch (err) {
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/users/me/profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>Welcome, {profile.first_name}!</h2>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
      <p>Status: {profile.is_active ? 'Active' : 'Inactive'}</p>
      {profile.profile_pic && (
        <img src={`http://localhost:8000${profile.profile_pic}`} alt="Profile" width="100" />
      )}
      <br />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Profile Picture</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Dashboard;
