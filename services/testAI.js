const { analyzeToken } =
require("./ai");

async function run() {

    const result =
        await analyzeToken({

            symbol: "TURTLE",

            liquidity: 23987,

            volume: 857915,

            mcap: 102184,

            holders: 20,

            top_holder: 33.66,

            score: 70
        });

    console.log(result);
}

run();