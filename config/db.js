const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "memecoin_agent"
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database Error:", err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

module.exports = db;
