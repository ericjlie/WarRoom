import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../firebase-config.js';
import { useAuthState } from "react-firebase-hooks/auth";
// const useAuth = () => auth.currentUser !== null
// // console.log('protected route is being called')
// // return false;
// ;

function ProtectedRoute() {
  const authState = useAuthState(auth);
  // console.log(auth, 'auth in route')
  // const isAuth = useAuth();
  return authState[0] ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
