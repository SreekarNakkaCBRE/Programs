import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users/admin/standard-users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [newUser, setNewUser] = useState({
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  contact_number: '',
  address: '',
});
const [createMsg, setCreateMsg] = useState('');

const handleCreateChange = (e) => {
  setNewUser({ ...newUser, [e.target.name]: e.target.value });
};

const handleCreateUser = async (e) => {
  e.preventDefault();
  setCreateMsg('');
  try {
    await API.post('/users/admin/create-user', newUser);
    setCreateMsg('User created successfully!');
    setNewUser({
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      contact_number: '',
      address: '',
    });
    fetchUsers(); // refresh list
  } catch (err) {
    setCreateMsg(err.response?.data?.detail || 'Failed to create user');
  }
};


  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Status</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td>{u.is_active ? 'Active' : 'Inactive'}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

    <h3>Create New User</h3>
<form onSubmit={handleCreateUser}>
  <input name="first_name" placeholder="First Name" value={newUser.first_name} onChange={handleCreateChange} required />
  <input name="last_name" placeholder="Last Name" value={newUser.last_name} onChange={handleCreateChange} required />
  <input name="email" type="email" placeholder="Email" value={newUser.email} onChange={handleCreateChange} required />
  <input name="password" type="password" placeholder="Password" value={newUser.password} onChange={handleCreateChange} required />
  <input name="contact_number" placeholder="Contact Number" value={newUser.contact_number} onChange={handleCreateChange} />
  <input name="address" placeholder="Address" value={newUser.address} onChange={handleCreateChange} />
  <button type="submit">Create User</button>
</form>
{createMsg && <p>{createMsg}</p>}



    </div>
  );
};

export default AdminDashboard;
