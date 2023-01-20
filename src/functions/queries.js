import axios from "axios";

const urlBase = !!process.env.REACT_APP_DEV ? 'http://localhost:3000' : 'https://indee-tv-demo-server.herokuapp.com';

export const validate = async (pin, litJwt) => {
  const body = {
    pin,
    litJwt
  };
  let tokenRes;
  try {
    tokenRes = await axios.post(`${urlBase}/validate`, body);
  } catch (err) {
    console.log('error getting token', err);
    return;
  }
  console.log('end of validate', tokenRes)
  return tokenRes.data
}

export const getContent = async (tokens, litJwt) => {
  console.log('getting content', tokens);
  const body = {
    indeeTvJwt: tokens.token,
    litJwt
  }
  let videoRes;
  try {
    videoRes = await axios.post(`${urlBase}/get-authorized-content`, body);
  } catch (err) {
    console.log('error getting video', err);
    return;
  }
  console.log('videoRes', videoRes.data);
  return videoRes.data;
}