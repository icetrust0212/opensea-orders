export default {
    network: process.env.REACT_APP_MODE === 'test' ? 'testnet' : 'mainnet',
    serverUrl: process.env.REACT_APP_MORALIS_SERVER_URL || '',
    appId: process.env.REACT_APP_MORALIS_APP_ID || '',
}