const {
    getPairData
} = require("./pairLookup");

async function run() {

    const token =
        "E5h55uQ4eBEJMsAGZ7KwXLiawjpVhrin62VaER8Spump";

    const pairs =
        await getPairData(token);

    console.log(
        JSON.stringify(
            pairs[0],
            null,
            2
        )
    );
}

run();