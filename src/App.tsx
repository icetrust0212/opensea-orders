import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import DataGridDemo from './components/Table';
import { useMoralis } from "react-moralis";
import { Button } from '@mui/material';
import { GridCellEditCommitParams, MuiBaseEvent, MuiEvent } from '@mui/x-data-grid';
import { BuyOrderInterface } from './interfaces/buyOrderInterface';
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

  const [orders, setOrders] = useState<any[]>([]);
  const [buyOrders, setBuyOrders] = useState<BuyOrderInterface[]>([]);
  const web3Account = useMemo(
		() => isAuthenticated && user?.get("accounts")[0],
		[user, isAuthenticated],
	);

  const getOrders = async () => {
    const res = await Moralis.Plugins.opensea.getOrders({
      network: "testnet"
    });
    let _orders = [];
    if (res) {
      let values = res.orders || [];
      _orders = values.map((value: any) => {
        return {
          ...value,
          ...value.asset,
          expirationTime: ''
        }
      });
    }
    return _orders;
	};

  useEffect(() => {
    (async () => {
      await Moralis.start({
        appId: process.env.REACT_APP_MORALIS_TESTNET_APP_ID,
        serverUrl: process.env.REACT_APP_MORALIS_TESTNET_SERVER_URL
      })
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (!isInitialized) {
        await Moralis.initPlugins();
      }
      let _orders = await getOrders();
      setOrders(_orders);
    })()
  }, []);

  useEffect(() => {
    (async () => await enableWeb3())();
		// eslint-disable-next-line
	}, [isAuthenticated]);

  const getPaymentToken = (tokenAddress: string): string => {
    if (tokenAddress == "0x0000000000000000000000000000000000000000") {
      return '0xc778417e063141139fce010982780140aa0cd5ab';
    } else {
      return tokenAddress;
    }
  }

  const onCellEditCommit = async (params: GridCellEditCommitParams, event: MuiEvent<MuiBaseEvent>) => {
    console.log('onCellCommit: ', params);
    let expirationTime;
    
    let hash = params.id;
    let orderNFT = orders.find(order => order.hash == hash);
    let buyOrder: BuyOrderInterface = {
        network: 'testnet',
        hash: orderNFT.hash,
        tokenAddress: orderNFT.asset.tokenAddress,
        tokenId: orderNFT.asset.tokenId,
        expirationTime: orderNFT.expirationTime,
        tokenType: orderNFT.asset.assetContract.schemaName,
        paymentTokenAddress: getPaymentToken(orderNFT.paymentToken),
        userAddress: web3Account,
        amount: orderNFT.amount
    };
    let updatedValue = params.value as number || 0;
    let index = orders.findIndex(order => order.hash == hash);

    let updatedOrder;

    if (params.field === 'amount') {
      buyOrder = {
        ...buyOrder,
        amount: updatedValue,
      }
      updatedOrder = {
        ...orderNFT,
        amount: updatedValue
      }
    } else if (params.field === 'expirationTime') {
      expirationTime = updatedValue;
      buyOrder = {
        ...buyOrder,
        expirationTime: expirationTime,
      }
      updatedOrder = {
        ...orderNFT,
        expirationTime
      }
    }

    let _orders: any[] = [...orders];
    _orders.splice(index, 1, updatedOrder);
    setOrders(_orders);
    console.log('_orders: ', _orders);
    let _buyOrders = buyOrders.filter(_order => _order.hash != buyOrder.hash) || [];
    if (params.field === 'expirationTime' || params.field === 'amount') {
      if (buyOrder.amount > 0) {
        setBuyOrders([
          ..._buyOrders,
          buyOrder
        ]); 
      } else {
        setBuyOrders(_buyOrders);
      }
    }
  }

  const onCellAllSet = (row: any, field: string) => {
    let value = row[field];
    if (!value) return;
    let _orders = orders.map(order => {
      let _order = {
        ...order,
      }
      _order[field] = value;
      return _order;
    }) || [];
    setOrders(_orders);
    let _buyOrders = _orders.map(_order => {
      let buyOrder: BuyOrderInterface = {
        network: 'testnet',
        hash: _order.hash,
        tokenAddress: _order.asset.tokenAddress,
        tokenId: _order.asset.tokenId,
        expirationTime: _order.expirationTime,
        tokenType: _order.asset.assetContract.schemaName,
        paymentTokenAddress: getPaymentToken(_order.paymentToken),
        userAddress: web3Account,
        amount: _order.amount
      };
      buyOrder[field as 'expirationTime' | 'amount'] = value;
      return buyOrder;
    });
    setBuyOrders(_buyOrders);
  }

  const handleSubmit = async (event: any) => {
    console.log('buyOrders: ', buyOrders);
    for (let buyOrder of buyOrders) {
      await Moralis.Plugins.opensea.createBuyOrder(buyOrder);
    }
    console.log("Create Buy Order Successful");
  }

  const handleCancel = () => {
    let _orders = orders.map(order => {
      return {
        ...order,
        expirationTime: '',
        amount: 0
      }
    });
    setOrders(_orders);
    setBuyOrders([]);
  }

  return (
    <div className="App">
      <div>
					{isAuthenticated ? (
						<div>
							<div>{web3Account}</div>
							<Button
								onClick={() => logout()}
							>
								Logout
							</Button>
						</div>
					) : (
						<Button onClick={() => authenticate()}>
							Connect to Metamask
						</Button>
					)}
				</div>
      <DataGridDemo rows={orders} onCellEditCommit={onCellEditCommit} onCellAllSet={onCellAllSet}/>
      <div className="btn-layout">
        <Button variant="text" className="btn">My Bids</Button>
        <Button variant="outlined" className="btn btn-cancel" onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" className="btn btn-submit" onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
}

export default App;
