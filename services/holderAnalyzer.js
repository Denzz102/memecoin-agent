const axios = require("axios");
require("dotenv").config();

async function analyzeHolder(tokenAddress) {
  try {
    const url = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

    /*
    |--------------------------------------------------------------------------
    | TOKEN SUPPLY
    |--------------------------------------------------------------------------
    */

    const supplyResponse = await axios.post(url, {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenSupply",
      params: [tokenAddress],
    });

    const totalSupply = Number(
      supplyResponse.data.result?.value?.uiAmount || 0,
    );

    /*
    |--------------------------------------------------------------------------
    | LARGEST ACCOUNTS
    |--------------------------------------------------------------------------
    */

    const largestResponse = await axios.post(url, {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenLargestAccounts",
      params: [tokenAddress],
    });

    const accounts = largestResponse.data.result?.value || [];

    if (!accounts.length || totalSupply <= 0) {
      return {
        holders: 0,
        topHolder: 100,
        holderAddresses: [],
      };
    }

    /*
    |--------------------------------------------------------------------------
    | HOLDER ADDRESSES
    |--------------------------------------------------------------------------
    */

    const holderAddresses = accounts.map((account) => account.address);

    /*
    |--------------------------------------------------------------------------
    | TOP HOLDER %
    |--------------------------------------------------------------------------
    */

    const largestHolderAmount = Number(accounts[0]?.uiAmount || 0);

    const topHolderPercent = (largestHolderAmount / totalSupply) * 100;

    return {
      holders: accounts.length,

      topHolder: Number(topHolderPercent.toFixed(2)),

      holderAddresses,
    };
  } catch (err) {
    console.error("Holder Analysis Error:", err.response?.data || err.message);

    return {
      holders: 0,
      topHolder: 100,
      holderAddresses: [],
    };
  }
}

module.exports = {
  analyzeHolder,
};
