console.log("TEST SCORE RUNNING...");

const {
    calculateScore,
    getSignal
} = require("./scoring");

// dst...

const token = {
    liquidity: 25303,
    volume: 839007,
    mcap: 114297,
    topHolder: 33.86,
    buys: 10555,
    sells: 8126
};

const score = calculateScore(token);

console.log("Score:", score);
console.log("Signal:", getSignal(score));