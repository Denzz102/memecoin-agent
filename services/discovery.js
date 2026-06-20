const axios = require("axios");

async function getNewTokens() {

    try {

        const response =
            await axios.get(
                "https://api.dexscreener.com/token-profiles/latest/v1"
            );

        return response.data
            .filter(
                token =>
                token.chainId === "solana"
            );

    } catch (error) {

        console.error(error.message);

        return [];
    }
}

module.exports = {
    getNewTokens
};