const db = require("../config/db");

const { getNewTokens } = require("./discovery");
const { getPairData } = require("./pairLookup");
const { analyzeHolder } = require("./holderAnalyzer");
const { calculateScore, getSignal } = require("./scoring");
const { analyzeToken } = require("./ai");
const { sendTelegram, formatNum } = require("./telegram");
const { countSmartWallet } = require("./smartWallet");
const { checkRug } = require("./rugcheck");
const { detectWhale } = require("./whale");
const { alreadySent, saveSignal } = require("./signalTracker");

async function scan() {
  const tokens = await getNewTokens();
  let processed = 0;
  let buyCount = 0;
  let watchCount = 0;
  let avoidCount = 0;

  console.log(`Token ditemukan: ${tokens.length}`);

  for (const token of tokens) {
    try {
      const pairs = await getPairData(token.tokenAddress);

      if (!pairs.length) continue;

      const pair = pairs[0];

      const liquidity = Number(pair.liquidity?.usd || 0);

      const volume = Number(pair.volume?.h24 || 0);

      const mcap = Number(pair.marketCap || 0);

      const buys = Number(pair.txns?.h24?.buys || 0);

      const sells = Number(pair.txns?.h24?.sells || 0);

      const buyRatio = buys / Math.max(sells, 1);

      /*
            |--------------------------------------------------------------------------
            | FILTER
            |--------------------------------------------------------------------------
            */

      if (liquidity < 5000) {
        continue;
      }

      /*
            |--------------------------------------------------------------------------
            | HOLDER ANALYSIS
            |--------------------------------------------------------------------------
            */

      const holderData = await analyzeHolder(pair.baseToken.address);

      const topHolder = holderData?.topHolder || 100;

      /*
            |--------------------------------------------------------------------------
            | SMART WALLET
            |--------------------------------------------------------------------------
            */

      const smartWalletCount = await countSmartWallet(
        holderData?.holderAddresses || [],
      );

      /*
            |--------------------------------------------------------------------------
            | WHALE DETECTION
            |--------------------------------------------------------------------------
            */

      const whaleCount = await detectWhale(pair);

      /*
            |--------------------------------------------------------------------------
            | RUGCHECK
            |--------------------------------------------------------------------------
            */

      const rugData = await checkRug(pair.baseToken.address);

      const rugScore = rugData?.score || 0;

      const rugStatus = rugData?.status || "UNKNOWN";

      /*
            |--------------------------------------------------------------------------
            | SCORE
            |--------------------------------------------------------------------------
            */

      const score = calculateScore({
        liquidity,

        volume,

        mcap,

        topHolder,

        buys,

        sells,

        smartWalletCount,

        whaleCount,

        rugStatus,
      });

      const signal = getSignal(score);
      processed++;

      if (signal === "BUY") {
        buyCount++;
      }

      if (signal === "WATCH") {
        watchCount++;
      }

      if (signal === "AVOID") {
        avoidCount++;
      }
      /*
|--------------------------------------------------------------------------
| PORTFOLIO UPDATE
|--------------------------------------------------------------------------
*/
      let portfolioSignal = signal;

      const [currentPortfolio] = await db.promise().query(
        `
SELECT signal_type
FROM portfolio
WHERE token_address = ?
`,
        [pair.baseToken.address],
      );

      if (currentPortfolio.length) {
        if (currentPortfolio[0].signal_type === "BUY" || signal === "BUY") {
          portfolioSignal = "BUY";
        }
      }
      await db.promise().query(
        `
        
UPDATE portfolio
SET
    current_mcap = ?,

    signal_type =
    CASE
        WHEN signal_type = 'BUY'
        THEN 'BUY'
        ELSE ?
    END,

    gain_percent =
    CASE
        WHEN entry_mcap > 0
        THEN ROUND(
            ((? - entry_mcap) / entry_mcap) * 100,
            2
        )
        ELSE 0
    END,

    ath_mcap =
    CASE
        WHEN ath_mcap IS NULL
        OR ath_mcap < ?
        THEN ?
        ELSE ath_mcap
    END

WHERE token_address = ?
`,
        [mcap, signal, mcap, mcap, mcap, pair.baseToken.address],
      );
      /*
            |--------------------------------------------------------------------------
            | AI
            |--------------------------------------------------------------------------
            */

      const aiAnalysis = await analyzeToken({
        symbol: pair.baseToken.symbol,

        liquidity,

        volume,

        mcap,

        top_holder: topHolder,

        score,
      });

      console.log("");
      console.log("================================");
      console.log(pair.baseToken.symbol);
      console.log("================================");
      console.log(`Liquidity      : ${liquidity}`);
      console.log(`Volume         : ${volume}`);
      console.log(`MCAP           : ${mcap}`);
      console.log(`Top Holder     : ${topHolder}%`);
      console.log(`Score          : ${score}`);
      console.log(`Signal         : ${signal}`);
      console.log(`Smart Wallet   : ${smartWalletCount}`);
      console.log(`Whale Entry    : ${whaleCount}`);
      console.log(`Rug Score      : ${rugScore}`);
      console.log(`Rug Status     : ${rugStatus}`);
      console.log("================================");

      /*
|--------------------------------------------------------------------------
| TELEGRAM
|--------------------------------------------------------------------------
*/

      if (signal === "BUY" || (signal === "WATCH" && score >= 60)) {
        const sent = await alreadySent(pair.baseToken.address);

        if (!sent) {
          await sendTelegram(
            `${signal === "BUY" ? "🚀 BUY SIGNAL" : "👀 WATCH SIGNAL"}

🪙 Token
<b>${pair.baseToken.symbol}</b>

📋 Contract Address
<code>${pair.baseToken.address}</code>

📊 Score
<b>${score}</b>

💧 Liquidity
<b>$${formatNum(liquidity)}</b>

📈 Volume
<b>$${formatNum(volume)}</b>

🏦 MCAP
<b>$${formatNum(mcap)}</b>

🐋 Whale Entry
<b>${whaleCount}</b>

🧠 Smart Wallet
<b>${smartWalletCount}</b>

🛡 Rug Status
<b>${rugStatus}</b>

🔗 DexScreener
https://dexscreener.com/solana/${pair.pairAddress}

🤖 AI Analysis

${aiAnalysis}`,
          );

          await saveSignal(
            pair.baseToken.address,
            pair.baseToken.symbol,
            score,
            signal,
          );

          db.query(
            `
INSERT IGNORE INTO portfolio
(
    token_address,
    symbol,
    entry_mcap,
    current_mcap,
    ath_mcap,
    gain_percent,
    signal_type
)
VALUES
(
    ?, ?, ?, ?, ?, 0, ?
)
`,
            [
              pair.baseToken.address,
              pair.baseToken.symbol,
              mcap,
              mcap,
              mcap,
              signal,
            ],
          );

          console.log("Telegram Sent");
        } else {
          console.log(`${pair.baseToken.symbol} sudah pernah dikirim`);
        }
      }

      /*
            |--------------------------------------------------------------------------
            | SAVE TOKEN
            |--------------------------------------------------------------------------
            */

      db.query(
        `
INSERT INTO tokens
(
    address,
    symbol,
    liquidity,
    volume,
    mcap,
    top_holder,
    smart_wallet_count,
    whale_count,
    rug_score,
    rug_status,
    score,
    signal_type,
    ai_analysis
)
VALUES
(
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)

ON DUPLICATE KEY UPDATE

    liquidity = VALUES(liquidity),
    volume = VALUES(volume),
    mcap = VALUES(mcap),
    top_holder = VALUES(top_holder),
    smart_wallet_count = VALUES(smart_wallet_count),
    whale_count = VALUES(whale_count),
    rug_score = VALUES(rug_score),
    rug_status = VALUES(rug_status),
    score = VALUES(score),
    signal_type = VALUES(signal_type),
    ai_analysis = VALUES(ai_analysis)
`,
        [
          pair.baseToken.address,
          pair.baseToken.symbol,
          liquidity,
          volume,
          mcap,
          topHolder,
          smartWalletCount,
          whaleCount,
          rugScore,
          rugStatus,
          score,
          signal,
          aiAnalysis,
        ],
      );

      /*
            |--------------------------------------------------------------------------
            | SAVE HISTORY
            |--------------------------------------------------------------------------
            */

      db.query(
        `
INSERT INTO token_history
(
    token_address,
    symbol,
    liquidity,
    volume,
    mcap,
    score
)
VALUES
(
    ?, ?, ?, ?, ?, ?
)
`,
        [
          pair.baseToken.address,
          pair.baseToken.symbol,
          liquidity,
          volume,
          mcap,
          score,
        ],
      );
    } catch (err) {
      console.error("");
      console.error("================================");
      console.error("SCAN ERROR");
      console.error(err);
      console.error("================================");
    }
  }
  console.log("");
  console.log("================================");
  console.log("SCAN SUMMARY");
  console.log("================================");
  console.log(`Processed : ${processed}`);
  console.log(`BUY       : ${buyCount}`);
  console.log(`WATCH     : ${watchCount}`);
  console.log(`AVOID     : ${avoidCount}`);
  console.log("================================");
}

module.exports = scan;
