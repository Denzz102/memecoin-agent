function calculateScore(token) {
  let score = 0;

  /*
  |--------------------------------------------------------------------------
  | LIQUIDITY
  |--------------------------------------------------------------------------
  */

  if (token.liquidity >= 10000) score += 5;

  if (token.liquidity >= 50000) score += 5;

  if (token.liquidity >= 100000) score += 5;

  /*
  |--------------------------------------------------------------------------
  | VOLUME
  |--------------------------------------------------------------------------
  */

  if (token.volume >= 5000) score += 5;

  if (token.volume >= 25000) score += 5;

  if (token.volume >= 100000) score += 5;

  /*
  |--------------------------------------------------------------------------
  | MARKET CAP
  |--------------------------------------------------------------------------
  */

  if (token.mcap >= 25000 && token.mcap <= 250000) {
    score += 15;
  } else if (token.mcap <= 1000000) {
    score += 10;
  }

  /*
  |--------------------------------------------------------------------------
  | TOP HOLDER
  |--------------------------------------------------------------------------
  */

  if (token.topHolder <= 5) {
    score += 25;
  } else if (token.topHolder <= 10) {
    score += 20;
  } else if (token.topHolder <= 20) {
    score += 10;
  } else if (token.topHolder >= 40) {
    score -= 10;
  }

  /*
  |--------------------------------------------------------------------------
  | BUY PRESSURE
  |--------------------------------------------------------------------------
  */

  const buyRatio = token.buys / Math.max(token.sells, 1);

  if (buyRatio >= 3) {
    score += 20;
  } else if (buyRatio >= 2) {
    score += 15;
  } else if (buyRatio >= 1.2) {
    score += 10;
  }

  /*
  |--------------------------------------------------------------------------
  | SMART WALLET
  |--------------------------------------------------------------------------
  */

  if (token.smartWalletCount >= 5) {
    score += 20;
  } else if (token.smartWalletCount >= 3) {
    score += 15;
  } else if (token.smartWalletCount >= 1) {
    score += 10;
  }

  /*
  |--------------------------------------------------------------------------
  | WHALE ENTRY
  |--------------------------------------------------------------------------
  */

  if (token.whaleCount >= 3) {
    score += 15;
  } else if (token.whaleCount >= 2) {
    score += 10;
  } else if (token.whaleCount >= 1) {
    score += 5;
  }

  /*
  |--------------------------------------------------------------------------
  | RUGCHECK
  |--------------------------------------------------------------------------
  */

  if (token.rugStatus === "SAFE") {
    score += 10;
  }

  if (token.rugStatus === "RISK") {
    score -= 50;
  }

  /*
  |--------------------------------------------------------------------------
  | LIMIT SCORE
  |--------------------------------------------------------------------------
  */

  if (score > 100) {
    score = 100;
  }

  if (score < 0) {
    score = 0;
  }

  return score;
}

function getSignal(score) {
  if (score >= 70) {
    return "BUY";
  }

  if (score >= 60) {
    return "WATCH";
  }

  return "AVOID";
}

module.exports = {
  calculateScore,
  getSignal,
};
