const db = require("../config/db");

async function alreadySent(tokenAddress) {

    const [rows] =
        await db.promise().query(
            `
            SELECT id
            FROM signals
            WHERE token_address = ?
            AND created_at >
            DATE_SUB(
                NOW(),
                INTERVAL 6 HOUR
            )
            `,
            [tokenAddress]
        );

    return rows.length > 0;
}

async function saveSignal(
    tokenAddress,
    symbol,
    score,
    signalType
) {

    await db.promise().query(
        `
        INSERT INTO signals
        (
            token_address,
            symbol,
            score,
            signal_type
        )
        VALUES
        (
            ?, ?, ?, ?
        )
        `,
        [
            tokenAddress,
            symbol,
            score,
            signalType
        ]
    );
}

module.exports = {
    alreadySent,
    saveSignal
};