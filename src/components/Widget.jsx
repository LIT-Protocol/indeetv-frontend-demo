import DemoNav from "./Nav";
import { Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useAppContext } from "../context";
import LitJsSdk, { verifyJwt } from "lit-js-sdk";
import './Widget.css';
import { getContent, getContentMkII, validate, validateMkII } from "../functions/queries";
import { getJwt } from "../functions/helpers";
import { throwError } from "lit-js-sdk/src/lib/utils";

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

const videoKey = 'vid-01gjfhjnbn2sna1ehtz2j4je0m'

function Widget() {
  const {performWithAuthSig, clearAuthSig} = useAppContext();

  const [ storedAuthSig, setStoredAuthSig ] = useState(null);
  const [ playerLoaded, setPlayerLoaded ] = useState(false);
  const [ allowed, setAllowed ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('not allowed');
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    reset();
    connectToLit();
  }, []);

  const connectToLit = async () => {
    let litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'jalapeno',
    });
    await litNodeClient.connect();
    window.litNodeClient = litNodeClient;
    setLoading(false);
  }

  const logInWithLit = async () => {
    setLoading(true);
    // TODO: turn back on for lit auth
    let authSigHolder = 'lit auth is off';
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

  const validateWithLit = async (authSigHolder) => {
    let tokens;
    let content;
    let jwt = 'lit auth is off';
    try {
      jwt = await getJwt(authSigHolder, videoKey, condition);
      console.log('check jwt', jwt);
      if (!!jwt['errorCode']) {
        setErrorMessage(jwt['errorCode']);
        setAllowed(false);
        setLoading(false);

      }
    } catch (err) {
      console.log('error getting jwt', err);
      setErrorMessage(JSON.stringify(err));
      setAllowed(false);
      setLoading(false);

    }
    if (jwt) {
      // setJwt(jwt);
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

    setTimeout(async () => {
      await initializePlayer(tokens, content[0].videos[0].key);
    }, 200)
  }

  const validateWithIndeeAndLogIn = async (jwt) => {
    try {
      // const tokens = await validate(process.env.REACT_APP_INDEE_TV_PIN, jwt);
      const tokens = await validateMkII(process.env.REACT_APP_INDEE_TV_PIN, jwt);
      console.log('tokens', tokens);
      if (!!tokens['detail'] || tokens === 'Unauthorized') {
        console.log('tokens', tokens['detail']);
        setErrorMessage('Unauthorized');
        setAllowed(false);
        setLoading(false);
        return;
      }

      // note: start of get content
      // const content = await getContent(tokens, jwt);
      const content = await getContentMkII(tokens, jwt);

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
    console.log('initializing player', tokens);
    console.log('initializing player videoId', videoId);
    window.initializeIndeePlayer('indee-player', tokens.token, videoId, {
      autoplay: false
    })
    return true;
  }

  const reset = () => {
    setStoredAuthSig(null);
    setLoading(true);
    localStorage.removeItem('lit-auth-signature');
    clearAuthSig();
  }

  return (
    <div className="Home">
      <DemoNav type={'widget'}/>
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
                    {loading ? (
                      <CircularProgress sx={{mt: 22}}/>
                    ) : (
                      <div>
                        <div>
                          <iframe className={'center-widget'} id="indee-player" width="800px" height="450px"
                                  allow="encrypted-media" allowFullScreen
                                  referrerPolicy="origin-when-cross-origin" frameBorder="0"></iframe>
                        </div>
                      </div>
                    )}
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
    </div>
  )
}

export default Widget;