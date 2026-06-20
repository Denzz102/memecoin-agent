const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("/tokens", (req, res) => {
  db.query(
    `
        SELECT *
        FROM tokens
        ORDER BY id DESC
        `,
    (err, rows) => {
      if (err) return res.status(500).json(err);

      res.json(rows);
    },
  );
});

router.get("/health", async (req, res) => {
  try {
    const db = require("../config/db");

    const [tokens] = await db.promise().query(
      `
          SELECT COUNT(*) total
          FROM tokens
          `,
    );

    const [buy] = await db.promise().query(
      `
          SELECT COUNT(*) total
          FROM tokens
          WHERE signal_type='BUY'
          `,
    );

    const [watch] = await db.promise().query(
      `
          SELECT COUNT(*) total
          FROM tokens
          WHERE signal_type='WATCH'
          `,
    );

    const [avoid] = await db.promise().query(
      `
          SELECT COUNT(*) total
          FROM tokens
          WHERE signal_type='AVOID'
          `,
    );

    res.json({
      scanner: "ONLINE",
      database: "CONNECTED",
      telegram: "CONNECTED",
      ai: "CONNECTED",

      totalTokens: tokens[0].total,

      buy: buy[0].total,

      watch: watch[0].total,

      avoid: avoid[0].total,

      lastScan: new Date(),
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/portfolio", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
          SELECT
              *,
              ROUND(
                (
                  (ath_mcap - entry_mcap)
                  /
                  entry_mcap
                ) * 100,
                2
              ) AS ath_gain
          FROM portfolio
          ORDER BY gain_percent DESC
        `);

    res.json(rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/hall-of-fame", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        symbol,
        token_address,

        ROUND(
          (
            (ath_mcap - entry_mcap)
            /
            entry_mcap
          ) * 100,
          2
        ) AS ath_gain

      FROM portfolio

      WHERE entry_mcap > 0

      ORDER BY ath_gain DESC

      LIMIT 5
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

const { rescanToken } = require("../services/rescan");

router.post("/rescan/:address", async (req, res) => {
  try {
    const result = await rescanToken(req.params.address);

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
