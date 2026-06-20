require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");



const apiRoutes = require("./routes/api");
const scan = require("./services/scanner");
const topGainersRoute = require("./routes/topGainers");
const updatePortfolio = require("./services/portfolioTracker");

require("./config/db");
require("./telegramBot");
const app = express();

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(express.json());

app.use(express.static("public"));

app.use("/api/top-gainers", topGainersRoute);





/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api", apiRoutes);

/*
|--------------------------------------------------------------------------
| LANDING PAGE
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/landing.html");
});

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.sendFile(__dirname + "/public/health.html");
});

/*
|--------------------------------------------------------------------------
| PORTFOLIO
|--------------------------------------------------------------------------
*/

app.get("/portfolio", (req, res) => {
  res.sendFile(__dirname + "/public/portfolio.html");
});

/*
|--------------------------------------------------------------------------
| COUNTDOWN
|--------------------------------------------------------------------------
*/

let countdownTimer = null;

function startCountdown(minutes = 5) {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  let seconds = minutes * 60;

  countdownTimer = setInterval(() => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");

    const ss = String(seconds % 60).padStart(2, "0");

    process.stdout.write(`\r⏳ Next Scan In : ${mm}:${ss} `);

    seconds--;

    if (seconds < 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;

      process.stdout.write("\n");
    }
  }, 1000);
}

/*
|--------------------------------------------------------------------------
| INITIAL SCAN
|--------------------------------------------------------------------------
*/

(async () => {
  try {
    console.log("");
    console.log("================================");
    console.log("INITIAL SCAN START");
    console.log(new Date());
    console.log("================================");

    const startTime = Date.now();

    await scan();

    await updatePortfolio();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("");
    console.log("================================");
    console.log("INITIAL SCAN FINISHED");
    console.log(`Duration : ${duration}s`);
    console.log("================================");
    console.log("");

    startCountdown(5);
  } catch (err) {
    console.error("INITIAL SCAN ERROR:", err.message);
  }
})();

/*
|--------------------------------------------------------------------------
| CRON SCAN EVERY 5 MINUTES
|--------------------------------------------------------------------------
*/

cron.schedule("*/5 * * * *", async () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  try {
    console.log("");
    console.log("================================");
    console.log("MEMECOIN SCAN START");
    console.log(new Date());
    console.log("================================");

    const startTime = Date.now();

    await scan();

    await updatePortfolio();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("");
    console.log("================================");
    console.log("SCAN FINISHED");
    console.log(`Duration : ${duration}s`);
    console.log("================================");
    console.log("");

    startCountdown(5);
  } catch (err) {
    console.error("SCAN ERROR:", err.message);
  }
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("");
  console.log("================================");
  console.log("🚀 AI Memecoin Agent Running");
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📊 Dashboard : http://localhost:${PORT}/dashboard`);
  console.log(`📈 Portfolio : http://localhost:${PORT}/portfolio`);
  console.log(`❤️ Health : http://localhost:${PORT}/health`);
  console.log("================================");
  console.log("");
});
