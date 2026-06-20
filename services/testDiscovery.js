const {
    getNewTokens
} = require("./discovery");

async function run() {

    const tokens =
        await getNewTokens();

    console.log(
        "Total Solana Token:",
        tokens.length
    );

    console.log(tokens[0]);
}

run();