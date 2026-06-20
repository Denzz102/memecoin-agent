const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT

    SUM(
        CASE
            WHEN ath_gain < 0
            THEN 1
            ELSE 0
        END
    ) AS loss_count,

    SUM(
        CASE
            WHEN ath_gain >= 0
            AND ath_gain < 50
            THEN 1
            ELSE 0
        END
    ) AS gain_0_50,

    SUM(
        CASE
            WHEN ath_gain >= 50
            AND ath_gain < 100
            THEN 1
            ELSE 0
        END
    ) AS gain_50_100,

    SUM(
        CASE
            WHEN ath_gain >= 100
            AND ath_gain < 500
            THEN 1
            ELSE 0
        END
    ) AS gain_100_500,

    SUM(
        CASE
            WHEN ath_gain >= 500
            THEN 1
            ELSE 0
        END
    ) AS gain_500_plus

FROM portfolio
    `);

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
