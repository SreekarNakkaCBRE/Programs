import {useEffect, useState} from 'react';
import { useAuth } from '../auth/AuthContext';
import { Typography, Box, Drawer, Toolbar, Divider, List, ListItem, ListItemText, Container, Paper } from '@mui/material';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Dashboard = () => {
  const {user} = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/users/my_profile`);
        setProfile(response.data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }

    fetchProfile();
  }, [user]);

  const adminLinks =[
    {text: "View Profile", path: "/users/my_profile"},
    {text: "Update Profile", path: "/users/update_profile"},
    {text: "User List", path: "/users/list"},
    {text: "Update Role", path: "/users/update_role"},
  ]

  const userLinks = [
    {text: "Update Profile", path: "/users/update_profile"},
    {text: "View Profile", path: "/users/my_profile"},
  ];

  return (
    <Container maxWidth="lg" className="page-container">
      <Box sx={{ display: 'flex', mt: 4 }}>
        
        <Drawer 
          variant='permanent' 
          sx={{ 
            width: drawerWidth, 
            ['& .MuiDrawer-paper']: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              position: 'relative',
              height: 'fit-content'
            } 
          }}
        >
          <Divider />
          <List>
            {
              (user?.role_id === 1 ? adminLinks : userLinks).map((link) => (
                <ListItem button key={link.text} onClick={() => navigate(link.path)}>
                  <ListItemText primary={link.text} />
                </ListItem>
              ))}          
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: 2 }}>
          <Paper className="dashboard-container">
            <Typography variant="h4" gutterBottom>
              Welcome to the Dashboard
            </Typography>
            
            {profile && (
              <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Profile Information
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {profile.first_name} {profile.last_name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {profile.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Contact:</strong> {profile.contact_number}
                </Typography>
                <Typography variant="body1">
                  <strong>Role ID:</strong> {user?.role_id === 1 ? 'Administrator' : 'User'}
                </Typography>
              </Box>
            )}
            
            <Typography variant="body1" sx={{mt:2}}>
              You are logged in as {user?.email} with role ID: {user?.role_id}.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default Dashboard;