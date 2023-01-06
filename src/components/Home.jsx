import './Home.css';
import { useEffect, useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import LitJsSdk from "lit-js-sdk";
import { useNavigate } from 'react-router-dom';
import { useAppContext } from "../context";
import SaveCondition from "./SaveCondition";
import DemoNav from "./Nav";

function Home() {
  const {performWithAuthSig, authSig} = useAppContext()
  const [ loading, setLoading ] = useState(false);

  let navigate = useNavigate();

  useEffect(() => {
    connectToLit();
  }, [])

  const connectToLit = async () => {
    setLoading(true)
    let litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'jalapeno'
    });
    await litNodeClient.connect();
    window.litNodeClient = litNodeClient;
    setLoading(false);
  }

  const logInWithLit = async () => {
    setLoading(true);
    const loginRes = await performWithAuthSig({chain: "polygon"});
    setLoading(false);
  }

  return (
    <div className="Home">
      <DemoNav type={'routing'}/>
      <span className={'Home-header'}>
        {loading ? (
          <CircularProgress/>
        ) : (
          <div>
            {authSig ? (
              <span>
                <Typography variant={'h5'}>Wallet: {authSig.address}</Typography>
                <SaveCondition videoId={'vid-01gjfhjnbn2sna1ehtz2j4je0m'}/>
                <Button variant={'outlined'} onClick={() => navigate('/video')}>Go to Video</Button>
              </span>
            ) : (
              <div>
                {/*TODO: turn back on for lit auth*/}
                {/*<Button variant={'outlined'} onClick={() => logInWithLit()}>Log Into Routing Demo</Button>*/}
                <Typography variant={'h5'}>Routing demo is off for now, use the widget demo</Typography>
                <Button onClick={() => navigate('/widget')}>Go to Widget</Button>
              </div>
            )}
          </div>
        )}
      </span>
    </div>
  );
}

export default Home;
