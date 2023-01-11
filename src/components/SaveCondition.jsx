import React, { useEffect, useState } from "react";
import { useAppContext } from "../context";
import './SaveCondition.css';
import { Button } from "@mui/material";

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
      baseUrl: "https://indee-tv-demo.herokuapp.com/",
      path: "/widget",
      orgId: "indeeTv",
      role: "",
      extraData: videoId,
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