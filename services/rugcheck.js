const axios = require("axios");

async function checkRug(tokenAddress) {
  try {
    const response = await axios.get(
      `https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`,
    );

    const data = response.data;

    return {
      score: data.score || 0,

      status: data.risks && data.risks.length > 0 ? "RISK" : "SAFE",
    };
  } catch (err) {
    console.error(
      "RugCheck Error:",
      err.response?.status,
      err.response?.data || err.message,
    );

    return {
      score: 0,
      status: "UNKNOWN",
    };
  }
}

module.exports = {
  checkRug,
};
