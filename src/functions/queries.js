import axios from "axios";

const urlBase = !!process.env.REACT_APP_DEV ? 'http://localhost:8787' : 'https://indee-tv-gating-demo.litprotocol.workers.dev';

export const validate = async (pin, litJwt) => {
  console.log('validate- pin', pin);
  const stringifiedBody = JSON.stringify({
    pin,
    litJwt
  });
  let tokenRes;
  try {
    tokenRes = await axios.post(`${urlBase}/auth/validate`, stringifiedBody);
  } catch (err) {
    console.log('error getting token', err);
    return;
  }
  console.log('end of validate', tokenRes)
  return tokenRes.data
}

export const getContent = async (tokens, litJwt) => {
  console.log('getting content', tokens);
  const stringifiedBody = JSON.stringify({
    indeeTvJwt: tokens.token,
    litJwt
  })
  let videoRes;
  try {
    videoRes = await axios.post(`${urlBase}/meta/get-authorized-content`, stringifiedBody);
  } catch (err) {
    console.log('error getting video', err);
    return;
  }
  console.log('videoRes', videoRes.data);
  return videoRes.data;
}

// note: not stringified for regular server
export const validateMkII = async (pin, litJwt) => {
  console.log('validate- pin', pin);
  const body = {
    pin,
    litJwt
  };
  let tokenRes;
  try {
    // note: below for server
    // tokenRes = await axios.post('https://indee-tv-gating-demo.litprotocol.workers.dev/validate', body);
    // tokenRes = await axios.post('http://localhost:3000/validate', body);
  } catch (err) {
    console.log('error getting token', err);
    return;
  }
  console.log('end of validate', tokenRes)
  return tokenRes.data
}

export const getContentMkII = async (tokens, litJwt) => {
  console.log('getting content', tokens);
  const body = {
    indeeTvJwt: tokens.token,
    litJwt
  }
  let videoRes;
  try {
    // note: below for server
    // videoRes = await axios.post('https://indee-tv-gating-demo.litprotocol.workers.dev/get-authorized-content', body);
    // videoRes = await axios.post('http://localhost:3000/get-authorized-content', body);
  } catch (err) {
    console.log('error getting video', err);
    return;
  }
  console.log('videoRes', videoRes.data);
  return videoRes.data;
}