require("dotenv").config();

module.exports = {
  apiKey: process.env.HELIUS_API_KEY,
  baseUrl: "https://mainnet.helius-rpc.com"
};