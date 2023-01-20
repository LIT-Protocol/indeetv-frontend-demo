import React, { createContext, useContext, useState } from "react";
import LitJsSdk from "lit-js-sdk";

export const AppContext = createContext({
  sideBar: true,
});

export const AppContextProvider = (props) => {
  const {children} = props;

  const [ authSig, setAuthSig ] = useState(null);
  const [ globalError, setGlobalError ] = useState(null);

  const performWithAuthSig = async (
    {chain} = {chain: "ethereum"}
  ) => {
    let currentAuthSig = authSig;
    if (!currentAuthSig) {
      try {
        currentAuthSig = await LitJsSdk.checkAndSignAuthMessage({chain, switchChain: false});
        setAuthSig(currentAuthSig);
      } catch (e) {
        if (e?.errorCode === "no_wallet") {
          console.log('no wallet')
          return false;
        } else if (e?.errorCode === "wrong_network") {
          setGlobalError({
            title: e.message,
            details: "",
          });
          return false;
        } else {
          throw e;
        }
      }
    }

    return currentAuthSig;
  };

  const clearAuthSig = () => {
    setAuthSig(null);
  }

  return (
    <AppContext.Provider
      value={{
        performWithAuthSig,
        setGlobalError,
        globalError,
        authSig,
        clearAuthSig
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context;
};
