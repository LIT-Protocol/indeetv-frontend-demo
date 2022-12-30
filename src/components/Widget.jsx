import DemoNav from "./Nav";
import { Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useAppContext } from "../context";
import LitJsSdk, { verifyJwt } from "lit-js-sdk";
import './Widget.css';
import { getContent, getContentMkII, validate, validateMkII } from "../functions/queries";
import { getJwt } from "../functions/helpers";

const condition = [
  {
    "conditionType": "evmBasic",
    "contractAddress": "0xA3D109E28589D2AbC15991B57Ce5ca461Ad8e026",
    "standardContractType": "ERC721",
    "chain": "polygon",
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
  const [ loading, setLoading ] = useState(true);
  const [ playerLoaded, setPlayerLoaded ] = useState(false);
  const [ allowed, setAllowed ] = useState(true);
  const [ error, setError ] = useState('not allowed');

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
  }

  const logInWithLit = async () => {
    let authSigHolder;
    try {
      authSigHolder = await performWithAuthSig();
      setStoredAuthSig(authSigHolder);
      await validateWithLit(authSigHolder);
    } catch (err) {
      setError(JSON.stringify(err));
      setAllowed(false);

    }
  }

  const validateWithLit = async (authSigHolder) => {
    let tokens;
    let content;
    let jwt;
    try {
      // jwt = await getJwt(authSigHolder);
      jwt = await getJwt(authSigHolder, videoKey, condition);
      console.log('jwt', jwt)
      if (!!jwt['errorCode']) {
        setError(jwt['errorCode']);
        setAllowed(false);
        return;
      }
    } catch (err) {
      console.log('error getting jwt', err);
      setError(JSON.stringify(err));
      setAllowed(false);
      return;
    }
    if (jwt) {
      // setJwt(jwt);
      const indeeRes = await validateWithIndeeAndLogIn(jwt);
      tokens = indeeRes.tokens;
      content = indeeRes.content;
    } else {
      setAllowed(false);
      setLoading(false);
      return;
    }

    setTimeout(async () => {
      await initializePlayer(tokens, content[0].videos[0].key);
    }, 200)
  }

  const validateWithIndeeAndLogIn = async (jwt) => {
    try {
      // const tokens = await validate(process.env.REACT_APP_INDEE_TV_PIN, jwt);
      const tokens = await validateMkII(process.env.REACT_APP_INDEE_TV_PIN, jwt);

      const playerInitialized = await initializePlayer(tokens);
      setPlayerLoaded(playerInitialized);

      // note: start of get content
      // const content = await getContent(tokens, jwt);
      const content = await getContentMkII(tokens, jwt);

      // const content = true

      setAllowed(true);
      setLoading(false);
      return {
        tokens,
        content
      };

    } catch (err) {
      setError(JSON.stringify(err));
      setAllowed(false);
      console.log('Error:', err);
    }
  }

  const initializePlayer = async (tokens, videoId = '') => {
    console.log('initializing player', tokens);
    window.initializeIndeePlayer('indee-player', tokens.token, videoId, {
      autoplay: false
    })
    console.log('player loaded', playerLoaded);
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
                <Typography sx={{mt: 20, mb: 1}} variant={'h6'}>{error}</Typography>
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