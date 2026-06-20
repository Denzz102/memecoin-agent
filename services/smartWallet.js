const db = require("../config/db");

async function countSmartWallet(holderAddresses)
{
    return new Promise((resolve) => {

        db.query(
            `
            SELECT wallet_address
            FROM smart_wallets
            `,
            (err, rows) => {

                if(err)
                {
                    resolve(0);
                    return;
                }

                const smartWallets =
                    rows.map(
                        r => r.wallet_address
                    );

                const count =
                    holderAddresses.filter(
                        address =>
                            smartWallets.includes(
                                address
                            )
                    ).length;

                resolve(count);
            }
        );

    });
}

module.exports = {
    countSmartWallet
};