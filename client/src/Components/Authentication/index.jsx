import React, { useState, useContext, useEffect } from 'react';
import {
  createUserWithEmailAndPassword, updateProfile, onAuthStateChanged,
  signOut, signInWithEmailAndPassword, useAuth,
} from 'firebase/auth';
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { auth } from '../../firebase-config';
import UserContext from '../UserContext';
import 'regenerator-runtime/runtime';
import errorHandling from './errorHandling';

function index() {
  const navigate = useNavigate();
  const [exisitingUser, setUserStatus] = useState(true);
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [userName, setUserName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPW, setRegisterPW] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPW, setLoginPW] = useState('');
  const [error, setError] = useState('');
  const authState = useAuthState(auth);
  // console.log('registerEmail', registerEmail, typeof(registerEmail));
  // console.log('registerPW', registerPW);
  // console.log('loginEmail', loginEmail);
  // console.log('loginPW', loginPW);
  // console.log('currentUser in authentication', currentUser);
  // console.log('existing user', exisitingUser);
  // console.log(userName);
  // console.log('auth', auth);
  console.log(authState, 'in index')

  useEffect(() => {
    if (authState[0]) {
      setCurrentUser(auth.currentUser);
      // console.log('login Button is working');
      navigate('/');
    }
  }, [authState]);

  // onAuthStateChanged(auth, (User) => {
  //   // console.log('user changed in authentication', User);
  //   setCurrentUser(User);
  // });

  const register = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPW);
      // console.log('authCurrentUser', auth.currentUser);
      updateProfile(auth.currentUser, {
        displayName: userName,
      })
        .then(() => setCurrentUser(user))
        .catch((err) => console.log('profile can\'t be udpated', err));
    } catch (err) {
      errorHandling(err.code, setError);
    }
  };

  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, loginEmail, loginPW);
      setCurrentUser(user);
      // console.log('login Button is working');
      navigate('/');
    } catch (err) {
      errorHandling(err.code, setError);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      {exisitingUser && <SignIn error={error} login={login} setEmail={setLoginEmail} setPW={setLoginPW} setUserStatus={setUserStatus} />}
      {!exisitingUser && <SignUp error={error} setUserName={setUserName} register={register} setEmail={setRegisterEmail} setPW={setRegisterPW} setUserStatus={setUserStatus} />}

    </div>
  );
}
export default index;
