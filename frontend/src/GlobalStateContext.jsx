// import React, { createContext, useState } from "react";

// export const GlobalStateContext = createContext();

// export const GlobalStateProvider = ({ children }) => {
//   const [notification, setNotification] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("")

//   return (
//     <GlobalStateContext.Provider value={{notification, setNotification, searchTerm, setSearchTerm }}>
//       {children}
//     </GlobalStateContext.Provider>
//   );
// };


import React, { createContext, useEffect, useState } from "react";
import { getItem, storeItem } from "./utils/encode";

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [notification, setNotification] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState(
    getItem("globalSearch") || ""
  );
  const [inputValue, setInputValue] = useState(searchTerm || "");

  useEffect(() => {
    storeItem("globalSearch", searchTerm);
  }, [searchTerm]);

  return (
    <GlobalStateContext.Provider
      value={{
        notification,
        setNotification,
        notificationUnreadCount,
        setNotificationUnreadCount,
        announcementUnreadCount,
        setAnnouncementUnreadCount,
        searchTerm,
        setSearchTerm,
        inputValue, 
        setInputValue
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};