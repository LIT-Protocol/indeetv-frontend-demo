import { Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './Nav.css'
import LitLogo from './assets/litlogo.svg';

function DemoNav({type}) {
  let navigate = useNavigate();

  const goToRouting = () => {
    navigate("/");
  }

  const goToWidget = () => {
    navigate("/widget");
  }

  return (
    <span className={'nav-container'}>
      <span className={'nav-left'}>
        <img src={LitLogo} className={'nav-logo'}/>
        <Typography variant={'h6'} sx={{my: 1}}>Lit Protocol Token Gating</Typography>

      </span>
      <ButtonGroup sx={{my: 1}} aria-label="outlined primary button group">
        {/*<Button variant={type === 'routing' ? 'contained' : 'outlined'} onClick={() => goToRouting()}>Routing Demo</Button>*/}
        {/*<Button variant={type === 'widget' ? 'contained' : 'outlined'} onClick={() => goToWidget()}>Widget Demo</Button>*/}
        <Button variant={'contained'} sx={type === 'routing' ? { backgroundColor: '#1565c0', color: '#eee'} : {}} onClick={() => goToRouting()}>Routing Demo</Button>
        <Button variant={'contained'} sx={type === 'widget' ? { backgroundColor: '#1565c0', color: '#eee'} : {}} onClick={() => goToWidget()}>Widget Demo</Button>
      </ButtonGroup>
    </span>
    // <ButtonGroup sx={{my: 1}} variant="outlined" aria-label="outlined primary button group">
  )
}

export default DemoNav;