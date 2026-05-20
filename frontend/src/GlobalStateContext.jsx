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

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [notification, setNotification] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("globalSearch") || ""
  );
  const [inputValue, setInputValue] = useState(searchTerm || "");

  useEffect(() => {
    localStorage.setItem("globalSearch", searchTerm);
  }, [searchTerm]);

  return (
    <GlobalStateContext.Provider
      value={{
        notification,
        setNotification,
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