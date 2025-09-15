import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

import HomePage from '../pages/Home';
import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import NotFoundPage from '../pages/NotFound';

import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import UserManagementPage from '../pages/Admin/UserManagementPage';
import StoreManagementPage from '../pages/Admin/StoreManagementPage';

import StoreListPage from '../pages/User/StoreListPage';
import MyRatingsPage from '../pages/User/MyRatingsPage';
import ProfilePage from '../pages/User/ProfilePage';

import OwnerDashboardPage from '../pages/StoreOwner/OwnerDashboardPage';

import GuestLayout from '../layouts/GuestLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  const getRedirectPath = () => {
    if (!isAuthenticated || !user) return '/';
    if (user.role === 'System Administrator') return '/admin/dashboard';
    if (user.role === 'Store Owner') return '/owner/dashboard';
    if (user.role === 'Normal User') return '/stores';
    return '/';
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<GuestLayout />}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <SignupPage />}
        />
      </Route>


      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['System Administrator']}><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="stores" element={<StoreManagementPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        element={
            <ProtectedRoute allowedRoles={['Normal User', 'Store Owner']}>
              <UserLayout />
            </ProtectedRoute>
          }
        >
        <Route path="owner">
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={<ProtectedRoute allowedRoles={['Store Owner']}><OwnerDashboardPage /></ProtectedRoute>}
          />
        </Route>

        <Route path="stores" element={<StoreListPage />} />

        <Route
          path="my-ratings"
          element={<ProtectedRoute allowedRoles={['Normal User']}><MyRatingsPage /></ProtectedRoute>}
        />

        <Route path="profile" element={<ProfilePage />} />
      </Route>


      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;