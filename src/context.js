import React, { createContext, useContext, useState } from "react";
import LitJsSdk from "lit-js-sdk";

export const AppContext = createContext({
  sideBar: true,
});

export const AppContextProvider = (props) => {
  const {children} = props;

  const [ authSig, setAuthSig ] = useState(null);
  // const [ tokenList, setTokenList ] = useState(null);
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

  // useEffect(() => {
  //   if (!tokenList) {
  //     const go = async () => {
  //       try {
  //         const tokens = await LitJsSdk.getTokenList();
  //         setTokenList(tokens);
  //       } catch (err) {
  //         console.log("Error fetching token list:", err);
  //       }
  //     };
  //     go();
  //   }
  // }, []);

  const clearAuthSig = () => {
    setAuthSig(null);
  }

  return (
    <AppContext.Provider
      value={{
        performWithAuthSig,
        // tokenList,
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
