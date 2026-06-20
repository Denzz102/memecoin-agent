const axios = require("axios");
require("dotenv").config();

async function testHelius() {
  try {
    const url =
      `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

    const response = await axios.post(url, {
      jsonrpc: "2.0",
      id: 1,
      method: "getSlot"
    });

    console.log("✅ Helius Connected");
    console.log("Current Slot:", response.data.result);
  } catch (err) {
    console.error("❌ Helius Error");
    console.error(err.response?.data || err.message);
  }
}

testHelius();