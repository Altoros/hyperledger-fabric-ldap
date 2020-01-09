import React, { useState } from 'react';
import jwt from 'jsonwebtoken';
import PropTypes from 'prop-types';

import { post } from '../utils/api';

const AuthContext = React.createContext();

const initialState = window.__STATE__; // eslint-disable-line no-underscore-dangle
delete window.__STATE__; // eslint-disable-line no-underscore-dangle

const getUser = () => initialState.user;

const AuthProvider = ({ children }) => {
  const user = getUser();

  const [state, setState] = useState({
    isAuth: !!user,
    org: initialState.org,
    user
  });

  const login = async ({ username, password }) => {
    const res = await post('/login', { username, password });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    setState({ isAuth: true, user: jwt.decode(data.jwt), org: initialState.org });
  };

  const logout = async () => {
    await post('/logout');
    setState({ isAuth: false, user: null, org: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuth: state.isAuth,
        org: state.org,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.element
};

export { AuthProvider, AuthContext };
