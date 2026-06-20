const db = require("../config/db");

const { getPairData } = require("./pairLookup");
const { analyzeHolder } = require("./holderAnalyzer");
const { countSmartWallet } = require("./smartWallet");
const { detectWhale } = require("./whale");
const { checkRug } = require("./rugcheck");
const { calculateScore, getSignal } = require("./scoring");

async function rescanToken(tokenAddress) {
  const [rows] = await db.promise().query(
    `
    SELECT *
    FROM portfolio
    WHERE token_address = ?
    LIMIT 1
    `,
    [tokenAddress],
  );

  if (!rows.length) {
    throw new Error("Token not found");
  }

  const oldSignal = rows[0].signal_type;

  const pairs = await getPairData(tokenAddress);

  if (!pairs.length) {
    throw new Error("Pair not found");
  }

  const pair = pairs[0];

  const holder = await analyzeHolder(pair.baseToken.address);

  const smartWalletCount = await countSmartWallet(holder.holderAddresses || []);

  const whaleCount = await detectWhale(pair);

  const rug = await checkRug(pair.baseToken.address);

  const token = {
    liquidity: Number(pair.liquidity?.usd || 0),

    volume: Number(pair.volume?.h24 || 0),

    mcap: Number(pair.marketCap || 0),

    buys: Number(pair.txns?.h24?.buys || 0),

    sells: Number(pair.txns?.h24?.sells || 0),

    topHolder: holder.topHolder || 100,

    smartWalletCount,

    whaleCount,

    rugStatus: rug.status || "UNKNOWN",
  };

  const score = calculateScore(token);

  const newSignal = getSignal(score);

  let finalSignal = oldSignal;

  // BUY tidak boleh turun

  if (oldSignal === "WATCH") {
    if (newSignal === "BUY") {
      finalSignal = "BUY";
    }
  }

  if (oldSignal === "AVOID") {
    finalSignal = newSignal;
  }

  await db.promise().query(
    `
    UPDATE portfolio
    SET
      signal_type = ?
    WHERE token_address = ?
    `,
    [finalSignal, tokenAddress],
  );

  return {
    oldSignal,
    newSignal: finalSignal,
    score,
  };
}

module.exports = {
  rescanToken,
};
