import { useNavigate } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import { useAppContext } from "../context";

function NotAllowed() {
  const { clearAuthSig } = useAppContext();
  let navigate = useNavigate();

  const goHome = () => {
    localStorage.removeItem('lit-auth-signature');
    clearAuthSig();
    navigate('/')
  }

  return (
    <div className={'center center-column'}>
      <Typography sx={{ mb: 1 }} variant={'h5'}>not allowed</Typography>
      <Button variant={'outlined'} onClick={() => goHome()}>Try Again</Button>
    </div>
  );
}

export default NotAllowed;