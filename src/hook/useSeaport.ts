import { Network, OpenSeaPort } from "opensea-js";
import { useEffect, useState } from "react";
import config from "../config/config";
import useProvider from "./useProvider";
import Web3 from "web3";

const useSeaport = () => {
  const provider = new Web3.providers.HttpProvider(`https://mainnet.infura.io/${config.infura_key}`);
  const seaport = new OpenSeaPort(provider, {
    networkName: Network.Main,
    apiKey: config.openseaAPIKey,
  });

  return seaport;
};

export default useSeaport;
