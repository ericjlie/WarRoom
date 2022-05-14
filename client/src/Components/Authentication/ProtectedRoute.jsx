import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../firebase-config';
import { useAuthState } from "react-firebase-hooks/auth"

// const useAuth = () => auth.currentUser !== null

function ProtectedRoute() {
  const authState = useAuthState(auth);
  return authState[0] ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
