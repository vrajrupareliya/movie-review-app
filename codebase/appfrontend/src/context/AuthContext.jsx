import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Your centralized Axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // To check initial auth status

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token'); // Re-check token from storage
      if (storedToken && storedToken !== 'undefined') { // Ensure token is not the string "undefined"
        setToken(storedToken); 
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const response = await api.get('/users/me/profile'); 
          setUser(response.data.data);
        } catch (error) {
          console.error("Failed to verify token or fetch user", error.response?.data || error.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        }
      } else {
        // No token in storage or token is "undefined", ensure state is cleared
        if (storedToken === 'undefined') localStorage.removeItem('token'); // Clean up "undefined" string
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };
    verifyUser();
  }, []); 

  useEffect(() => {
    if (token && token !== 'undefined') {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);


  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      console.log("Backend login response:", response.data); // For debugging

      // *** THE FIX IS HERE ***
      // Assuming the token and user are nested within response.data.data
      // Adjust if your backend structure is different (e.g., response.data.token directly)
      const tokenFromData = response.data?.data?.accessToken; 
      const userDataFromData = response.data?.data?.user;

      console.log("Received token from backend:", tokenFromData); // For debugging

      if (!tokenFromData) {
        console.error("Token not found in backend response. Response structure:", response.data);
        throw new Error("Token not received from server.");
      }
      
      localStorage.setItem('token', tokenFromData);
      setToken(tokenFromData); 

      if (userDataFromData && userDataFromData._id) { 
          setUser(userDataFromData);
      } else {
          const profileResponse = await api.get('/users/me/profile');
          setUser(profileResponse.data.data);
      }
      return true; 
    } catch (error) {
      console.error("Login failed in AuthContext:", error.response?.data || error.message);
      throw error; 
    }
  };

  const register = async (username, email, password) => {
    try {
      await api.post('/users/register', { username, email, password });
      return true; 
    } catch (error) {
      console.error("Registration failed", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { 
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};