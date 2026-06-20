const TelegramBot = require("node-telegram-bot-api");
const db = require("./config/db");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// Helper kecil biar gain ada tanda + / - otomatis
const fmtPct = (val) => {
  const num = Number(val || 0);
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

const fmtUsd = (val) => `$${Number(val || 0).toLocaleString()}`;

bot.onText(/\/stats/, async (msg) => {
  try {
    const chatId = msg.chat.id;

    const [portfolio] = await db.promise().query(`
      SELECT
        *,
        ROUND(((current_mcap - entry_mcap) / entry_mcap) * 100, 2) AS gain_percent,
        ROUND(((ath_mcap - entry_mcap) / entry_mcap) * 100, 2) AS ath_gain
      FROM portfolio
      WHERE signal_type = 'BUY'
    `);

    const totalCalls = portfolio.length;
    const winners = portfolio.filter((t) => Number(t.ath_gain) >= 100).length;
    const winRate =
      totalCalls > 0 ? ((winners / totalCalls) * 100).toFixed(2) : "0.00";

    const bestCurrent = [...portfolio].sort(
      (a, b) => Number(b.gain_percent) - Number(a.gain_percent),
    )[0];

    const bestATH = [...portfolio].sort(
      (a, b) => Number(b.ath_gain) - Number(a.ath_gain),
    )[0];

    const message = `🏆 *DENZZ AI AGENT REPORT*
_Real-time Memecoin Intelligence_

┏━━━━━━━━━━━━━━┓
┃   📊 *PERFORMANCE*   ┃
┗━━━━━━━━━━━━━━┛

🚀 *Total Calls:* \`${totalCalls}\`
🏅 *Winners (ATH ≥ 100%):* \`${winners}\`
📈 *Win Rate:* \`${winRate}%\`

┏━━━━━━━━━━━━━━┓
┃   🔥 *TOP MOVERS*   ┃
┗━━━━━━━━━━━━━━┛

🥇 *Best Current Gain*
\`${bestCurrent?.symbol || "-"}\` → *${fmtPct(bestCurrent?.gain_percent)}*

👑 *Best ATH Gain*
\`${bestATH?.symbol || "-"}\` → *${fmtPct(bestATH?.ath_gain)}*

━━━━━━━━━━━━━━
🤖 *Denzz AI Agent*
_Powered by on-chain signal tracking_`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (err) {
    console.error(err);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Gagal memuat statistik. Coba lagi nanti.",
    );
  }
});

bot.onText(/\/top/, async (msg) => {
  try {
    const chatId = msg.chat.id;

    const [tokens] = await db.promise().query(`
      SELECT
        symbol,
        ROUND(((ath_mcap - entry_mcap) / entry_mcap) * 100, 2) AS ath_gain
      FROM portfolio
      WHERE signal_type = 'BUY'
      ORDER BY ath_gain DESC
      LIMIT 10
    `);

    if (!tokens.length) {
      return bot.sendMessage(chatId, "❌ Belum ada data yang tersedia.");
    }

    const medals = ["🥇", "🥈", "🥉"];

    let text = `🏆 *DENZZ HALL OF FAME*
_Top 10 Performing Calls_

━━━━━━━━━━━━━━
`;

    tokens.forEach((token, index) => {
      const rank = index < 3 ? medals[index] : `▫️ #${index + 1}`;
      text += `\n${rank}  *${token.symbol}*  →  *${fmtPct(token.ath_gain)}*`;
    });

    text += `

━━━━━━━━━━━━━━
🤖 *Denzz AI Agent*
_Real-time Memecoin Intelligence_`;

    await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  } catch (err) {
    console.error(err);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Gagal memuat leaderboard. Coba lagi nanti.",
    );
  }
});

bot.onText(/\/token (.+)/, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const keyword = match[1].trim();

    const [rows] = await db.promise().query(
      `
      SELECT
        *,
        ROUND(((current_mcap - entry_mcap) / entry_mcap) * 100, 2) AS gain_percent,
        ROUND(((ath_mcap - entry_mcap) / entry_mcap) * 100, 2) AS ath_gain
      FROM portfolio
      WHERE symbol = ? OR token_address = ?
      LIMIT 1
    `,
      [keyword, keyword],
    );

    if (!rows.length) {
      return bot.sendMessage(
        chatId,
        "❌ Token tidak ditemukan. Coba cek simbol atau contract address-nya lagi.",
      );
    }

    const token = rows[0];

    // Hitung umur sejak dipanggil
    const createdAt = new Date(token.created_at);
    const now = new Date();
    const diffMs = now - createdAt;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));

    let ageText = "";
    if (days > 0) {
      ageText = `${days} Day${days > 1 ? "s" : ""} Ago`;
    } else if (hours > 0) {
      ageText = `${hours} Hour${hours > 1 ? "s" : ""} Ago`;
    } else {
      ageText = "Just Now";
    }

    // Indikator arah gain
    const gainEmoji = Number(token.gain_percent) >= 0 ? "🟢" : "🔴";
    const athEmoji = Number(token.ath_gain) >= 100 ? "🌟" : "🏆";

    const text = `🚀 *${token.symbol}*
_Token Performance Report_

━━━━━━━━━━━━━━
📋 *Contract Address*
\`${token.token_address}\`

━━━━━━━━━━━━━━
🏦 *Entry MCAP*
${fmtUsd(token.entry_mcap)}

📈 *Current MCAP*
${fmtUsd(token.current_mcap)}

👑 *ATH MCAP*
${fmtUsd(token.ath_mcap)}

━━━━━━━━━━━━━━
${gainEmoji} *Current Gain*
*${fmtPct(token.gain_percent)}*

${athEmoji} *ATH Gain*
*${fmtPct(token.ath_gain)}*

━━━━━━━━━━━━━━
⏰ *Called*
${ageText}

━━━━━━━━━━━━━━
🤖 *Denzz AI Agent*
_Real-time Memecoin Intelligence_`;

    await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  } catch (err) {
    console.error(err);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Gagal memuat data token. Coba lagi nanti.",
    );
  }
});

console.log("🤖 Telegram Command Bot Running...");
