import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getUserData =async()=>{
    try{
      const {data}=await axios.get(`${backendUrl}/api/user/data`)
      data.success?setUserData(data.userData) : toast.error(data.message)
    }catch(error){
      toast.error('Error fetching user data:',error)
    }
  }

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
