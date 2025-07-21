import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../auth/AuthContext';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAdmins: 0,
    activeAdmins: 0
  });

  // New Admin Form
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    contact_number: '',
    address: '',
  });
  const [createMsg, setCreateMsg] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/superadmin/all-users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/superadmin/all-admins');
      setAdmins(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/users/superadmin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdmins();
    fetchStats();
  }, []);

  const handleCreateChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateMsg('');
    setCreateLoading(true);
    
    try {
      await API.post('/users/superadmin/create-admin', newAdmin);
      setCreateMsg('Admin created successfully!');
      setNewAdmin({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        contact_number: '',
        address: '',
      });
      fetchAdmins();
      fetchStats();
    } catch (err) {
      setCreateMsg(err.response?.data?.detail || 'Failed to create admin');
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus, userType) => {
    try {
      await API.patch(`/users/superadmin/${userId}/toggle-status`, { 
        is_active: !currentStatus 
      });
      if (userType === 'admin') {
        fetchAdmins();
      } else {
        fetchUsers();
      }
      fetchStats();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const deleteUser = async (userId, userType) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/users/superadmin/${userId}`);
        if (userType === 'admin') {
          fetchAdmins();
        } else {
          fetchUsers();
        }
        fetchStats();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const promoteToAdmin = async (userId) => {
    if (window.confirm('Are you sure you want to promote this user to admin?')) {
      try {
        await API.patch(`/users/superadmin/${userId}/promote-to-admin`);
        fetchUsers();
        fetchAdmins();
        fetchStats();
      } catch (err) {
        setError('Failed to promote user');
      }
    }
  };

  const demoteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to demote this admin to user?')) {
      try {
        await API.patch(`/users/superadmin/${adminId}/demote-to-user`);
        fetchUsers();
        fetchAdmins();
        fetchStats();
      } catch (err) {
        setError('Failed to demote admin');
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Super Admin Dashboard</h2>
      <p>Welcome, {user?.first_name} {user?.last_name}</p>
      
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      
      {/* Statistics Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '5px', 
          flex: 1, 
          textAlign: 'center' 
        }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
          <p style={{ color: 'green' }}>Active: {stats.activeUsers}</p>
        </div>
        <div style={{ 
          backgroundColor: '#f3e5f5', 
          padding: '20px', 
          borderRadius: '5px', 
          flex: 1, 
          textAlign: 'center' 
        }}>
          <h3>Total Admins</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalAdmins}</p>
          <p style={{ color: 'green' }}>Active: {stats.activeAdmins}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{
            backgroundColor: activeTab === 'users' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'users' ? 'white' : 'black',
            padding: '10px 20px',
            border: 'none',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Users Management
        </button>
        <button 
          onClick={() => setActiveTab('admins')}
          style={{
            backgroundColor: activeTab === 'admins' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'admins' ? 'white' : 'black',
            padding: '10px 20px',
            border: 'none',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Admins Management
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          style={{
            backgroundColor: activeTab === 'create' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'create' ? 'white' : 'black',
            padding: '10px 20px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Create Admin
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h3>Users Management</h3>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f2f2f2' }}>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td>{u.contact_number || 'N/A'}</td>
                    <td>
                      <span style={{ 
                        color: u.is_active ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{u.role}</td>
                    <td>
                      <button 
                        onClick={() => toggleUserStatus(u.id, u.is_active, 'user')}
                        style={{ 
                          backgroundColor: u.is_active ? '#f44336' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => promoteToAdmin(u.id)}
                        style={{ 
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        Promote to Admin
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id, 'user')}
                        style={{ 
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <div>
          <h3>Admins Management</h3>
          {loading ? (
            <p>Loading admins...</p>
          ) : (
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f2f2f2' }}>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.email}</td>
                    <td>{admin.first_name} {admin.last_name}</td>
                    <td>{admin.contact_number || 'N/A'}</td>
                    <td>
                      <span style={{ 
                        color: admin.is_active ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{admin.role}</td>
                    <td>
                      <button 
                        onClick={() => toggleUserStatus(admin.id, admin.is_active, 'admin')}
                        style={{ 
                          backgroundColor: admin.is_active ? '#f44336' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        {admin.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => demoteAdmin(admin.id)}
                        style={{ 
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        Demote to User
                      </button>
                      <button 
                        onClick={() => deleteUser(admin.id, 'admin')}
                        style={{ 
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Admin Tab */}
      {activeTab === 'create' && (
        <div>
          <h3>Create New Admin</h3>
          <form onSubmit={handleCreateAdmin} style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '5px',
            maxWidth: '500px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <label>First Name:</label><br/>
              <input 
                name="first_name" 
                placeholder="First Name" 
                value={newAdmin.first_name} 
                onChange={handleCreateChange} 
                required 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Last Name:</label><br/>
              <input 
                name="last_name" 
                placeholder="Last Name" 
                value={newAdmin.last_name} 
                onChange={handleCreateChange} 
                required 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Email:</label><br/>
              <input 
                name="email" 
                type="email" 
                placeholder="Email" 
                value={newAdmin.email} 
                onChange={handleCreateChange} 
                required 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Password:</label><br/>
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                value={newAdmin.password} 
                onChange={handleCreateChange} 
                required 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Contact Number:</label><br/>
              <input 
                name="contact_number" 
                placeholder="Contact Number" 
                value={newAdmin.contact_number} 
                onChange={handleCreateChange} 
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Address:</label><br/>
              <textarea 
                name="address" 
                placeholder="Address" 
                value={newAdmin.address} 
                onChange={handleCreateChange} 
                style={{ width: '100%', padding: '8px', marginTop: '5px', height: '60px' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={createLoading}
              style={{ 
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                cursor: createLoading ? 'not-allowed' : 'pointer',
                borderRadius: '3px'
              }}
            >
              {createLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
          {createMsg && (
            <p style={{ 
              color: createMsg.includes('successfully') ? 'green' : 'red',
              marginTop: '10px',
              fontWeight: 'bold'
            }}>
              {createMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;