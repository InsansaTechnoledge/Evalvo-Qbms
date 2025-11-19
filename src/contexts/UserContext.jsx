import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isUserLoggedOut, setIsUserLoggedOut] = useState(true);
  useEffect(() => {
    if (user) {
      setIsUserLoggedOut(false)
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, isUserLoggedOut, setIsUserLoggedOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};