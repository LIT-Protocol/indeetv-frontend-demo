import { verifyJwt } from "lit-js-sdk";

export const getJwt = async (authSigHolder, videoKey, condition) => {
  const resourceId = {
    baseUrl: "https://localhost:3001",
    path: "/video/" + videoKey,
    orgId: "",
    role: "",
    extraData: "",
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