const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
SELECT

    token_address,

    ANY_VALUE(symbol) AS symbol,

    CAST(
      SUBSTRING_INDEX(
        GROUP_CONCAT(
          mcap
          ORDER BY created_at ASC
        ),
        ',',
        1
      ) AS DECIMAL(20,2)
    ) AS first_mcap,

    CAST(
      SUBSTRING_INDEX(
        GROUP_CONCAT(
          mcap
          ORDER BY created_at DESC
        ),
        ',',
        1
      ) AS DECIMAL(20,2)
    ) AS last_mcap,

    ROUND(
      (
        (
          CAST(
            SUBSTRING_INDEX(
              GROUP_CONCAT(
                mcap
                ORDER BY created_at DESC
              ),
              ',',
              1
            ) AS DECIMAL(20,2)
          )
          -
          CAST(
            SUBSTRING_INDEX(
              GROUP_CONCAT(
                mcap
                ORDER BY created_at ASC
              ),
              ',',
              1
            ) AS DECIMAL(20,2)
          )
        )
        /
        CAST(
          SUBSTRING_INDEX(
            GROUP_CONCAT(
              mcap
              ORDER BY created_at ASC
            ),
            ',',
            1
          ) AS DECIMAL(20,2)
        )
      ) * 100,
      2
    ) AS gain_percent

FROM token_history

WHERE
    created_at >=
    NOW() - INTERVAL 24 HOUR

GROUP BY token_address

HAVING first_mcap > 0

ORDER BY gain_percent DESC

LIMIT 20
`);

    res.json(rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;