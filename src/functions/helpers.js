export const getJwt = async (authSigHolder, videoKey, condition) => {
  // resourceIds are unique and used to identify the condition
  const resourceId = {
    baseUrl: "https://indee-tv-demo.herokuapp.com/",
    path: "/widget",
    orgId: "indeeTv",
    role: "",
    extraData: videoKey,
  };

  try {
    const jwt = await window.litNodeClient.getSignedToken({
      unifiedAccessControlConditions: condition,
      authSig: {
        ethereum: authSigHolder
      },
      resourceId: resourceId
    });

    return jwt;
  } catch (err) {
    return err;
  }
}