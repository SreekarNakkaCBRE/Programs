import { Route, Routes } from 'react-router-dom';
import React from 'react';
import './App.css';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/UserManagement';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import CreateUser from './pages/CreateUser';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <Profile />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute requireAdmin={true}>
          <Layout>
            <AdminPanel />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/users-list" element={
        <PrivateRoute requireAdmin={true}>
          <Layout>
            <AdminPanel />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/create-user" element={
        <PrivateRoute requireAdmin={true}>
          <Layout>
            <CreateUser />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
