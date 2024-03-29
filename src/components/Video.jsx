import { CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppContext } from "../context";
import { useNavigate } from "react-router-dom";
import DemoNav from "./Nav";
import { getContent, validate } from "../functions/queries";
import { getJwt } from "../functions/helpers";

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

const videoKey = 'vid-01gjfhjnbn2sna1ehtz2j4je0m';

function Video() {
  const {authSig} = useAppContext();
  const [ loading, setLoading ] = useState(true);
  const [ playerLoaded, setPlayerLoaded ] = useState(false);
  const [ litLoggedIn, setLitLoggedIn ] = useState(false);
  const [ allowed, setAllowed ] = useState(true);
  const [ errorMessage, setErrorMessage ] = useState('not allowed');

  let navigate = useNavigate();

  useEffect(() => {
    validateWithLit()
  }, [])

  const validateWithLit = async () => {
    let tokens;
    let content;
    let jwt = 'lit auth is off';
    // TODO: turn back on for lit auth
    try {
      jwt = await getJwt(authSig, videoKey, condition);
      if (!!jwt['errorCode']) {
        navigate('/not-allowed');
        return;
      }
    } catch (err) {
      console.log('error getting jwt', err);
      setErrorMessage(JSON.stringify(err));
      setAllowed(false);
      return;
    }

    if (jwt) {
      const indeeRes = await validateWithIndeeAndLogIn(jwt);
      if (!indeeRes) {
        return;
      }
      tokens = indeeRes.tokens;
      content = indeeRes.content;
      setLitLoggedIn(true);
    } else {
      navigate('/not-allowed');
      return;
    }

    console.log('check content', content);

    setTimeout(async () => {
      await initializePlayer(tokens, content[0].videos[0].key);
    }, 200)
  }

  const validateWithIndeeAndLogIn = async (jwt) => {
    try {
      // note: start of validate
      const tokens = await validate(process.env.REACT_APP_INDEE_TV_PIN, jwt);

      if (!!tokens['detail'] || tokens === 'Unauthorized') {
        console.log('tokens', tokens['detail']);
        setErrorMessage('Unauthorized');
        navigate('/not-allowed');
        setLoading(false);
        return;
      }

      // note: start of get content
      const content = await getContent(tokens, jwt);

      setAllowed(true);
      setLoading(false);
      return {
        tokens,
        content
      };

    } catch (err) {
      setErrorMessage(JSON.stringify(err));
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

  const startPlayer = () => {
    window.listenIndeePlayerState("play", (args1, args2) => {
      console.log('play', args1, args2);
    });
  }

  const pausePlayer = () => {
    window.listenIndeePlayerState("pause", (args1, args2) => {
      console.log('pausePlayer', args1, args2);
    });
  }

  return (
    <div className="App">
      <DemoNav type={'routing'}/>
      <header className="App-header">
        {!litLoggedIn ? (
          <CircularProgress/>
        ) : (
          <div>
            <Typography sx={{mb: 1}} variant={'h5'}>You qualify for a video. This is a big day</Typography>
            {/*<Button variant={'outlined'} onClick={() => makeApiCall()}>Test Call</Button>*/}
            <iframe id="indee-player" width="800px" height="450px"
                    allow="encrypted-media" allowFullScreen
                    referrerPolicy="origin-when-cross-origin" frameBorder="0"></iframe>
          </div>
        )}
      </header>
    </div>
  );
}

export default Video;
