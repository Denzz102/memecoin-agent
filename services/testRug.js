// services/testRug.js

const {
  checkRug
} = require("./rugcheck");

(async () => {

  const result =
    await checkRug(
      "2dJniDEAGCG7zWKseCkyrML3W23WLjDf1CGxpNv3pump"
    );

  console.log(result);

})();