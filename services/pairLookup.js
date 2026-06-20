const axios = require("axios");

async function getPairData(tokenAddress) {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        timeout: 10000
      }
    );

    return response.data.pairs || [];
  } catch (error) {
    console.log("PAIR LOOKUP ERROR");

    console.log({
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });

    return [];
  }
}

module.exports = {
  getPairData,
};
