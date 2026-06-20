const axios = require("axios");

async function detectWhale(pair) {

    try {

        const buys =
            Number(
                pair.txns?.h24?.buys || 0
            );

        const volume =
            Number(
                pair.volume?.h24 || 0
            );

        let whaleCount = 0;

        if (
            volume > 500000 &&
            buys > 500
        ) {
            whaleCount = 1;
        }

        if (
            volume > 1000000 &&
            buys > 1000
        ) {
            whaleCount = 2;
        }

        if (
            volume > 3000000 &&
            buys > 3000
        ) {
            whaleCount = 3;
        }

        return whaleCount;

    } catch (err) {

        console.error(err);

        return 0;
    }
}

module.exports = {
    detectWhale
};