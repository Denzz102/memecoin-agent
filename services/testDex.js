const { getPairs } =
    require("./dexscreener");

async function run() {

    const data =
        await getPairs();

    console.log(
        JSON.stringify(
            data[0],
            null,
            2
        )
    );
}

run();