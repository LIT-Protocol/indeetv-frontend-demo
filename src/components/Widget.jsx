import DemoNav from "./Nav";
import { Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useAppContext } from "../context";
import LitJsSdk from "lit-js-sdk";
import './Widget.css';
import { getContent, validate } from "../functions/queries";
import { getJwt } from "../functions/helpers";

// condition for the IndeeTV NFT
const condition = [
  {
    "conditionType": "evmBasic",
    "contractAddress": "0xcb191aB460A3f204C97CE2681a7D6721c582c60a",
    "standardContractType": "ERC721",
    "chain": "goerli",
    "method": "balanceOf",
    "parameters": [
      ":userAddress"
    ],
    "returnValueTest": {
      "comparator": ">=",
      "value": "1"
    }
  }
]

// video key for placeholder IndeeTV video.  it's ok to have here, it's not a secret.
// this is also returned in the getContent call, but we use it in the resourceId to source
// the condition on the Lit nodes
const videoKey = 'vid-01gjfhjnbn2sna1ehtz2j4je0m'

function Widget() {
  const {performWithAuthSig, clearAuthSig} = useAppContext();

  const [ storedAuthSig, setStoredAuthSig ] = useState(null);
  const [ allowed, setAllowed ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('not allowed');
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    reset();
    connectToLit();
  }, []);

  // connect to lit network before doing anything else
  const connectToLit = async () => {
    let litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'jalapeno',
    });
    await litNodeClient.connect();
    window.litNodeClient = litNodeClient;
    setLoading(false);
  }

  // logs in current wallet and gets authSig
  const logInWithLit = async () => {
    setLoading(true);
    let authSigHolder;
    try {
      authSigHolder = await performWithAuthSig();
      setStoredAuthSig(authSigHolder);
      await validateWithLit(authSigHolder);
    } catch (err) {
      setErrorMessage(JSON.stringify(err));
      setAllowed(false);

    }
    setLoading(false);
  }

  // validates whether user is allowed to view content
  const validateWithLit = async (authSigHolder) => {
    let tokens;
    let content;
    let jwt;
    try {
      // if the user does not qualify, there will be no jwt returned
      jwt = await getJwt(authSigHolder, videoKey, condition);
      if (!!jwt['errorCode']) {
        setErrorMessage(jwt['errorCode']);
        setAllowed(false);
        setLoading(false);

      }
    } catch (err) {
      // reject if user is not qualified
      console.log('error getting jwt', err);
      setErrorMessage(JSON.stringify(err));
      setAllowed(false);
      setLoading(false);

    }

    // though the user should be rejected in the condition above if they don't qualify,
    // check again just to be safe
    if (jwt) {
      const indeeRes = await validateWithIndeeAndLogIn(jwt);
      if (!indeeRes) {
        setLoading(false);
        return;
      }
      tokens = indeeRes.tokens;
      content = indeeRes.content;
    } else {
      setAllowed(false);
      setLoading(false);
      setErrorMessage('no jwt');
      return;
    }

    setLoading(false);

    // setTimeout is used to let the IndeeTV player mount before initialization. probably not necessary
    setTimeout(async () => {
      await initializePlayer(tokens, content[0].videos[0].key);
    }, 200)
  }

  const validateWithIndeeAndLogIn = async (jwt) => {
    try {
      // start of validate
      const tokens = await validate(process.env.REACT_APP_INDEE_TV_PIN, jwt);
      if (!!tokens['detail'] || tokens === 'Unauthorized') {
        setErrorMessage('Unauthorized');
        setAllowed(false);
        setLoading(false);
        return;
      }

      // start of get content
      const content = await getContent(tokens, jwt);

      setAllowed(true);
      return {
        tokens,
        content
      };

    } catch (err) {
      console.log('Error:', err);
      setErrorMessage(JSON.stringify(err));
      setLoading(false);
      setAllowed(false);
    }
  }

  const initializePlayer = async (tokens, videoId = '') => {
    window.initializeIndeePlayer('indee-player', tokens.token, videoId, {
      autoplay: false
    })
    return true;
  }

  const reset = () => {
    setLoading(false);
    setAllowed(true);
    setStoredAuthSig(null);
    localStorage.removeItem('lit-auth-signature');
    clearAuthSig();
  }

  return (
    <div className="Home">
      <DemoNav type={'widget'}/>
      {loading ? (
        <div className={'loader-widget'}>
          <CircularProgress sx={{mt: 22}}/>
        </div>
      ) : (
        <span className={'Home-header'}>
        {!storedAuthSig ? (
          <Button variant={'outlined'} onClick={() => logInWithLit()}>Log Into Widget Demo</Button>
        ) : (
          <Fragment>
            {allowed ? (
              <div>
                <Card sx={{p: 2, width: '850px', height: "550px", backgroundColor: '#eceff1'}}>
                  <Typography sx={{my: 0.5}} variant={'h5'}>You qualify for a video in a widget. Neato</Typography>
                  <CardContent>
                    <div>
                      <div>
                        <iframe className={'center-widget'} id="indee-player" width="800px" height="450px"
                                allow="encrypted-media" allowFullScreen
                                referrerPolicy="origin-when-cross-origin" frameBorder="0"></iframe>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Typography variant={'body2'} sx={{mt: 2}}>note: there may be a conflict between the player and Material
                  UI.
                  if video doesn't display in component but audio is still present, try toggling
                  fullscreen </Typography>
              </div>
            ) : (
              <div>
                <Typography sx={{mt: 20, mb: 1}} variant={'h6'}>error getting video - {errorMessage}</Typography>
                <Button variant={'outlined'} onClick={() => reset()}>Reset Auth</Button>
              </div>
            )}
          </Fragment>
        )}
      </span>
      )}
    </div>
  )
}

export default Widget;