# Installation Guide

This guide will help you install and run Memecoin AI Agent on your local machine.

---

# Requirements

Before starting, make sure you have:

* Node.js 18+
* MySQL 8+ (or MariaDB)
* Git

Verify installation:

```bash
node -v
npm -v
mysql --version
git --version
```

---

# Required API Keys

The application requires the following services:

## Helius API

Used for:

* Holder Analysis
* Smart Wallet Tracking
* Whale Detection

Create an account at:

https://www.helius.dev

Generate an API Key and save it.

---

## Telegram Bot

Used for:

* BUY Alerts
* WATCH Alerts
* Portfolio Notifications

Create a bot:

1. Open Telegram
2. Search for **@BotFather**
3. Run:

```text
/newbot
```

4. Follow the instructions
5. Save your Bot Token

Example:

```text
123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Telegram Chat ID

Send a message to your bot.

Open:

```text
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```

Find:

```json
"chat": {
  "id": 123456789
}
```

Save the Chat ID.

---

## AI Provider

Choose one:

### OpenRouter

https://openrouter.ai

### Groq

https://console.groq.com

Generate an API Key.

---

# Clone Repository

```bash
git clone https://github.com/Denzz102/memecoin-agent.git

cd memecoin-agent
```

---

# Install Dependencies

```bash
npm install
```

---

# Database Setup

Create database:

```sql
CREATE DATABASE memecoin_agent;
```

Import schema:

```bash
mysql -u root -p memecoin_agent < database/schema.sql
```

Or import manually using HeidiSQL, phpMyAdmin, or MySQL Workbench.

After importing, the following tables should exist:

```text
tokens
signals
smart_wallets
token_history
portfolio
```

---

# Environment Configuration

Create a file named:

```text
.env
```

Copy the contents from:

```text
.env.example
```

Example:

```env
HELIUS_API_KEY=

OPENROUTER_API_KEY=
# OR
GROQ_API_KEY=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=memecoin_agent
```

Fill all values with your own credentials.

---

# Add Smart Wallets

Open the table:

```text
smart_wallets
```

Add wallet addresses manually.

Example:

| wallet_address | wallet_name | profit_percentage | total_trades |
| -------------- | ----------- | ----------------- | ------------ |
| WalletAddress  | Smart Whale | 80.50             | 120          |

These wallets will be used for smart money detection.

---

# Start Application

Run:

```bash
node server.js
```

or

```bash
npm start
```

If successful, you should see:

```text
Server running...
Database connected...
Scanner started...
```

---

# Access Dashboard

Open your browser:

```text
http://localhost:3000
```

Portfolio:

```text
http://localhost:3000/portfolio
```

Health Monitor:

```text
http://localhost:3000/health
```

---

# Verify Installation

Installation is successful if:

* Dashboard loads correctly
* Database connects successfully
* Scanner starts running
* Telegram bot sends alerts
* Portfolio page loads correctly

---

# Troubleshooting

## Database Connection Error

Verify:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

Make sure MySQL is running.

---

## Telegram Alerts Not Working

Verify:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Make sure you have sent at least one message to the bot.

---

## AI Analysis Not Working

Verify:

```env
OPENROUTER_API_KEY=
```

or

```env
GROQ_API_KEY=
```

Ensure the API key is valid.

---

## Helius Error

Verify:

```env
HELIUS_API_KEY=
```

Ensure your Helius account has available quota.

---

Your Memecoin AI Agent is now ready to use.
