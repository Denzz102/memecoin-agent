const axios = require("axios");

function formatNum(value) {
  const num = parseFloat(value);

  if (isNaN(num)) return value;

  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "B";

  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";

  if (num >= 1_000) return (num / 1_000).toFixed(2).replace(/\.?0+$/, "") + "K";

  return num.toFixed(2);
}

async function sendTelegram(message) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      },
    );

    console.log("Telegram Sent");
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

module.exports = {
  sendTelegram,
  formatNum,
};
