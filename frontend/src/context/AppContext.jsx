import React, { createContext, useEffect, useState, useCallback } from "react";
import Cookies from 'js-cookie';
import axios from 'axios';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // Corrected for Vite: use import.meta.env
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // This state now specifically tracks the INITIAL loading of the app.
  const [loading, setLoading] = useState(true);

  // A single, reusable function to clear all authentication-related state.
  const clearAuthState = () => {
    Cookies.remove('token');
    setIsLoggedIn(false);
    setUserData(null);
  };

  // This single function now handles fetching user data and setting state.
  // It's wrapped in useCallback for optimization, preventing re-creation on every render.
  const verifyUserAndFetchData = useCallback(async () => {
    const token = Cookies.get('token');
    console.log('[AppContext] Cookie token:', token);

    // If there's no token, clear any lingering state and exit.
    if (!token) {
      clearAuthState();
      setLoading(false); // We're done loading, there's no user.
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[AppContext] /api/user/data response:', response.data);

      if (response.data.success) {
        // If the token is valid, set the user data.
        setUserData(response.data.userData);
        setIsLoggedIn(true);
        console.log('[AppContext] User data loaded:', response.data.userData);
      } else {
        // If the API says the token is invalid, clear auth state.
        console.log('[AppContext] Token validation failed:', response.data.message);
        clearAuthState();
      }
    } catch (error) {
      // If there's a network error, clear auth state.
      console.error('[AppContext] Error verifying user:', error);
      clearAuthState();
    } finally {
      // This ALWAYS runs, ensuring the initial loading spinner is hidden.
      setLoading(false);
    }
  }, [backendUrl]); // The function depends on backendUrl.

  // This useEffect now has one job: run the verification function ONCE when the app loads.
  useEffect(() => {
    verifyUserAndFetchData();
  }, [verifyUserAndFetchData]);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    loading,
    // You can still export this if you need to manually refresh data later
    getUserData: verifyUserAndFetchData, 
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

