const { scanToken } = require("./services/scanner");

const address = process.argv[2];

scanToken(address);