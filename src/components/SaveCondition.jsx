import React, { useEffect, useState } from "react";
import { useAppContext } from "../context";
import './SaveCondition.css';

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

function SaveCondition({videoId}) {
  const {authSig} = useAppContext()
  const [ accTextArea, setAccTextArea ] = useState(JSON.stringify(condition));
  const [ unifiedAccessControlConditions, setUnifiedAccessControlConditions ] = useState(condition);

  useEffect(() => {
    if (unifiedAccessControlConditions) {
      const prettify = JSON.stringify(unifiedAccessControlConditions, undefined, 4);
      setAccTextArea(prettify);
    }
  }, [ unifiedAccessControlConditions ])

  useEffect(() => {
    updateUnifiedAccessControlConditions();
  }, [ accTextArea ])

  const updateUnifiedAccessControlConditions = () => {
    try {
      const parsed = JSON.parse(accTextArea);
      setUnifiedAccessControlConditions(parsed);
      console.log('conditions updated');
    } catch (err) {
      console.log("Error parsing JSON:", err);
    }
  }

  const createAndSave = async () => {
    const resourceId = {
      baseUrl: "https://localhost:3001",
      path: "/video/" + videoId,
      orgId: "",
      role: "",
      extraData: "",
    };

    const signedTokenObj = {
      unifiedAccessControlConditions: unifiedAccessControlConditions,
      authSig: {
        ethereum: authSig
      },
      resourceId,
    };

    console.log('signedTokenObj', signedTokenObj);

    const saveRes = await window.litNodeClient.saveSigningCondition({
      ...signedTokenObj,
    });

    console.log('saveRes', saveRes);
  }

  return (
    <div className={'lsm-dev-mode-container'}>
      <label className={'lsm-dev-mode-container-label'}>Raw Access Control Conditions</label>
      <textarea className={'lsm-dev-mode-textarea'} rows={35} value={accTextArea}
                onChange={(e) => setAccTextArea(e.target.value)}/>
      {/*<Button variant={'outlined'} onClick={createAndSave}>Save</Button>*/}
    </div>
  )
}

export default SaveCondition;