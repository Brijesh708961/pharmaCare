import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth state from local storage on mount
    const savedToken = localStorage.getItem('auth_token');
    const savedUserStr = localStorage.getItem('auth_user');
    
    if (savedToken && savedUserStr) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const updateRole = (role, wallet_address) => {
    if (!user) return;
    const updatedUser = { ...user, role, wallet_address };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
