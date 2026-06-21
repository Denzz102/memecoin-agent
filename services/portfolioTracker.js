const db = require("../config/db");
const { getPairData } = require("./pairLookup");
const { sendTelegram, formatNum } = require("./telegram");

function getMilestone(gain) {
  if (gain >= 1000) return 1000;
  if (gain >= 500) return 500;
  if (gain >= 200) return 200;
  if (gain >= 100) return 100;
  if (gain >= 50) return 50;

  return 0;
}

async function updatePortfolio() {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        token_address,
        symbol,
        entry_mcap,
        milestone_sent
      FROM portfolio
      WHERE signal_type IN ('BUY', 'WATCH')
      ORDER BY gain_percent DESC
      LIMIT 100
    `);

    let updatedCount = 0;

    for (const token of rows) {
      try {
        const pairs = await getPairData(token.token_address);

        if (!pairs.length) continue;

        const pair = pairs[0];

        const currentMcap = Number(pair.marketCap || 0);

        const gainPercent =
          token.entry_mcap > 0
            ? (
                ((currentMcap - token.entry_mcap) / token.entry_mcap) *
                100
              ).toFixed(2)
            : 0;

        const gain = Number(gainPercent);

        await db.promise().query(
          `
UPDATE portfolio
SET
    current_mcap = ?,

    gain_percent = ?,

    ath_mcap =
      CASE
        WHEN ath_mcap IS NULL
        OR ath_mcap < ?
        THEN ?
        ELSE ath_mcap
      END

WHERE token_address = ?
`,
          [
            currentMcap,
            gainPercent,
            currentMcap,
            currentMcap,
            token.token_address,
          ],
        );

        updatedCount++;

        await db.promise().query(
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
          [token.token_address, token.symbol, 0, 0, currentMcap, 0],
        );

        /*
        |--------------------------------------------------------------------------
        | TELEGRAM MILESTONE
        |--------------------------------------------------------------------------
        */

        const milestone = getMilestone(gain);

        if (milestone > 0 && milestone > (token.milestone_sent || 0)) {
          await sendTelegram(
            `🏆 PORTFOLIO MILESTONE

🪙 Token
${token.symbol}

📈 Gain
+${gain.toFixed(2)}%

🎯 Milestone
${milestone}%

🏦 First Call MCAP
$${formatNum(token.entry_mcap)}

🏦 Current MCAP
$${formatNum(currentMcap)}

🔗 DexScreener
https://dexscreener.com/solana/${pair.pairAddress}`,
          );

          await db.promise().query(
            `
UPDATE portfolio
SET milestone_sent = ?
WHERE token_address = ?
`,
            [milestone, token.token_address],
          );

          console.log(`🏆 ${token.symbol} | Milestone ${milestone}% Sent`);
        }

        // Anti rate limit DexScreener
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        console.log(`${token.symbol} ERROR`);
        console.log(err.message);
      }
    }

    console.log(`📈 Portfolio Updated : ${updatedCount}`);
  } catch (err) {
    console.error("PORTFOLIO ERROR:", err.message);
  }
}

module.exports = updatePortfolio;
