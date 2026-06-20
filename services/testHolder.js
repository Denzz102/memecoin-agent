const {
    analyzeHolder
} = require("./holderAnalyzer");

async function run() {

    const result =
        await analyzeHolder(
            "2dJniDEAGCG7zWKseCkyrML3W23WLjDf1CGxpNv3pump"
        );

    console.log(result);
}

run();