const axios = require("axios");

async function getPairs() {
    try {

        const response = await axios.get(
            "https://api.dexscreener.com/token-profiles/latest/v1"
        );

        return response.data || [];

    } catch (error) {

        console.error(
            "Dex Error:",
            error.message
        );

        return [];
    }
}

module.exports = {
    getPairs
};