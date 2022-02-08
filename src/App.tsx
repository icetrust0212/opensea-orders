import React, { useEffect } from 'react';
import './App.css';
import DataGridDemo from './components/Table';
import { useMoralis } from "react-moralis";

function App() {

  const {
		Moralis,
		user,
		logout,
		authenticate,
		enableWeb3,
		isInitialized,
		isAuthenticated,
		isWeb3Enabled,
	} = useMoralis();

  const values = {
    tokenAddress: '0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656',
    tokenId: '50731390999993387109547746172970775993694781989215334924436750830434017869825'
  }

  const getAsset = async () => {
		const res = await Moralis.Plugins.opensea.getAsset({
			network: "testnet",
			tokenAddress: values.tokenAddress,
			tokenId: values.tokenId,
		});
    // const res = await Moralis.Plugins.opensea.getOrders({
    //   network: "testnet",
    // });
		console.log('result: ', res);
    return res;
	};

  useEffect(() => {
    (async () => {
      let res = await getAsset();
    })()
  }, []);

  return (
    <div className="App">
      <DataGridDemo />
    </div>
  );
}

export default App;
