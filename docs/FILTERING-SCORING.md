# Token Filtering & Scoring

## Overview

The AI Memecoin Agent continuously scans Solana tokens and evaluates them using a multi-factor scoring system.

The objective is to identify tokens with:

* Strong liquidity
* Healthy trading activity
* Fair holder distribution
* Smart money participation
* Lower security risks

Each token receives a numerical score which is then converted into a BUY, WATCH, or AVOID signal.

---

## Initial Filtering

Before a token is analyzed, it must pass the following minimum requirements:

| Metric    | Requirement |
| --------- | ----------- |
| Liquidity | ≥ $20,000   |
| Volume    | ≥ $10,000   |
| Chain     | Solana      |

Tokens failing these requirements are ignored.

---

## Scoring Factors

### Liquidity

Higher liquidity generally indicates stronger market depth and reduced slippage risk.

| Liquidity  | Points |
| ---------- | ------ |
| ≥ $10,000  | +5     |
| ≥ $50,000  | +5     |
| ≥ $100,000 | +5     |

Maximum: **15 Points**

---

### Trading Volume

Volume measures trader activity and market interest.

| Volume     | Points |
| ---------- | ------ |
| ≥ $5,000   | +5     |
| ≥ $25,000  | +5     |
| ≥ $100,000 | +5     |

Maximum: **15 Points**

---

### Market Capitalization

The scanner prioritizes early-stage opportunities while avoiding extremely overvalued assets.

| Market Cap         | Points |
| ------------------ | ------ |
| $25,000 - $250,000 | +15    |
| ≤ $1,000,000       | +10    |

Maximum: **15 Points**

---

### Holder Distribution

A lower concentration among top holders generally reduces dump risk.

| Largest Holder | Points |
| -------------- | ------ |
| ≤ 5%           | +25    |
| ≤ 10%          | +15    |
| ≤ 20%          | +5     |

Maximum: **25 Points**

---

### Smart Wallet Activity

The scanner tracks predefined smart wallets and rewards tokens that attract experienced traders.

| Smart Wallet Buys | Points |
| ----------------- | ------ |
| ≥ 1 Wallet        | +10    |

Maximum: **10 Points**

---

### RugCheck Verification

The scanner performs a security verification using RugCheck.

Tokens classified as safe receive a bonus, while risky tokens receive a significant penalty.

| RugCheck Status | Points |
| --------------- | ------ |
| SAFE            | +10    |
| RISK            | -50    |

The large penalty is intentionally designed to prevent high-risk tokens from receiving BUY signals, even if other metrics appear strong.

Security checks may include:

* Contract risks
* Mint authority status
* Freeze authority status
* Ownership configuration
* Liquidity status
* Known security warnings


---

## Signal Classification

| Final Score | Signal |
| ----------- | ------ |
| ≥ 70        | BUY    |
| 60 - 69     | WATCH  |
| < 60        | AVOID  |

---

### Example: BUY Signal

| Metric | Points |
|---------|---------|
| Liquidity ($120K) | +15 |
| Volume ($180K) | +15 |
| Market Cap ($180K) | +15 |
| Top Holder (4.2%) | +25 |
| Smart Wallets (2) | +10 |
| RugCheck (SAFE) | +10 |

**Final Score: 90**

**Signal: BUY**

---

### Example: WATCH Signal

| Metric | Points |
|---------|---------|
| Liquidity ($55K) | +10 |
| Volume ($30K) | +10 |
| Market Cap ($600K) | +10 |
| Top Holder (8.5%) | +15 |
| Smart Wallets (1) | +10 |
| RugCheck (SAFE) | +10 |

**Final Score: 65**

**Signal: WATCH**

---

### Example: AVOID Signal

| Metric | Points |
|---------|---------|
| Liquidity ($120K) | +15 |
| Volume ($180K) | +15 |
| Market Cap ($180K) | +15 |
| Top Holder (4.2%) | +25 |
| Smart Wallets (2) | +10 |
| RugCheck (RISK) | -50 |

**Final Score: 30**

**Signal: AVOID**

---

## AI Analysis

After the scoring process is completed, an AI model generates a concise summary highlighting:

* Strengths
* Weaknesses
* Potential risks

The AI analysis is informational and does not directly affect the score.

---

## Customizing Filters & Scoring

### Modify Token Filters

To change the minimum requirements used before a token is analyzed, edit:

```bash
services/scanner.js
```

Example:

```js
if (pair.liquidity.usd < 20000) continue;
if (pair.volume.h24 < 10000) continue;
```

---

### Modify Scoring Rules

To change how points are calculated, edit:

```bash
services/scoring.js
```

Example:

```js
if (token.liquidity >= 10000) score += 5;
if (token.liquidity >= 50000) score += 5;
if (token.liquidity >= 100000) score += 5;
```

You can customize:

* Liquidity scoring
* Volume scoring
* Market Cap scoring
* Holder Distribution scoring
* Smart Wallet scoring
* RugCheck scoring

---

### Modify Signal Thresholds

To change BUY, WATCH, and AVOID thresholds, edit:

```bash
services/scoring.js
```

Example:

```js
function getSignal(score) {
    if (score >= 70) return "BUY";
    if (score >= 60) return "WATCH";
    return "AVOID";
}
```

Default configuration:

| Score | Signal |
| ----- | ------ |
| ≥ 70  | BUY    |
| ≥ 60  | WATCH  |
| < 60  | AVOID  |

---

### Modify Smart Wallet Tracking

To add or remove tracked wallets, update the database table:

```sql
smart_wallets
```

---

### Modify AI Provider

To switch between OpenRouter, Groq, Gemini, Claude, DeepSeek, or other providers, edit:

```bash
services/ai.js
```

Update the API configuration and model name according to your preferred provider.

---

### Important ⚠️

Lowering filters or scoring thresholds may generate more BUY signals, but it can also significantly increase risk.

Always test changes before using them in production.

---

## Disclaimer ⚠️

This project is intended for educational and research purposes only.

Cryptocurrency investments involve significant risk. Always conduct your own research (DYOR) before making any investment decisions.

The generated signals are probabilistic assessments and should not be considered financial advice.

---
