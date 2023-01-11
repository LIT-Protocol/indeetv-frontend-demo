import { verifyJwt } from "lit-js-sdk";

export const getJwt = async (authSigHolder, videoKey, condition) => {
  const resourceId = {
    baseUrl: "https://indee-tv-demo.herokuapp.com/",
    path: "/widget",
    orgId: "indeeTv",
    role: "",
    extraData: videoKey,
  };

  console.log('immediately before getJwt', authSigHolder);
  try {
    const jwt = await window.litNodeClient.getSignedToken({
      unifiedAccessControlConditions: condition,
      authSig: {
        ethereum: authSigHolder
      },
      resourceId: resourceId
    });
    console.log('after jwt', jwt);
    const verifiedRes = verifyJwt({jwt});
    console.log('verifiedRes', verifiedRes);

    return jwt;
  } catch (err) {
    return err;
  }
}