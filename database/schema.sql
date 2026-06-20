CREATE DATABASE IF NOT EXISTS memecoin_agent
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE memecoin_agent;

-- =====================================================
-- TOKENS
-- =====================================================

CREATE TABLE tokens (
    id INT NOT NULL AUTO_INCREMENT,

    address VARCHAR(100) NOT NULL,
    symbol VARCHAR(50) DEFAULT NULL,

    liquidity DECIMAL(20,2) DEFAULT NULL,
    volume DECIMAL(20,2) DEFAULT NULL,

    holders INT DEFAULT 0,

    mcap DECIMAL(20,2) DEFAULT NULL,

    top_holder DECIMAL(10,2) DEFAULT 0.00,

    smart_wallet_count INT DEFAULT 0,

    score INT DEFAULT 0,

    signal_type VARCHAR(20) DEFAULT NULL,

    ai_analysis TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    buys INT DEFAULT 0,
    sells INT DEFAULT 0,

    rug_score INT DEFAULT 0,
    rug_status VARCHAR(20) DEFAULT 'UNKNOWN',

    prev_holders INT DEFAULT 0,

    holder_growth DECIMAL(10,2) DEFAULT 0.00,

    whale_count INT DEFAULT 0,

    PRIMARY KEY (id),

    UNIQUE KEY uk_tokens_address (address),

    KEY idx_symbol (symbol),
    KEY idx_signal (signal_type),
    KEY idx_score (score),
    KEY idx_created (created_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SIGNALS
-- =====================================================

CREATE TABLE signals (
    id INT NOT NULL AUTO_INCREMENT,

    token_address VARCHAR(100) DEFAULT NULL,

    symbol VARCHAR(50) DEFAULT NULL,

    score INT DEFAULT NULL,

    signal_type VARCHAR(20) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_token (token_address),
    KEY idx_symbol (symbol),
    KEY idx_signal (signal_type),
    KEY idx_created (created_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SMART WALLETS
-- =====================================================

CREATE TABLE smart_wallets (
    id INT NOT NULL AUTO_INCREMENT,

    wallet_address VARCHAR(100) NOT NULL,

    wallet_name VARCHAR(100) DEFAULT NULL,

    profit_percentage DECIMAL(10,2) DEFAULT 0.00,

    total_trades INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_wallet_address (wallet_address),

    KEY idx_wallet_name (wallet_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TOKEN HISTORY
-- =====================================================

CREATE TABLE token_history (
    id INT NOT NULL AUTO_INCREMENT,

    token_address VARCHAR(100) DEFAULT NULL,

    symbol VARCHAR(50) DEFAULT NULL,

    liquidity DECIMAL(20,2) DEFAULT NULL,

    volume DECIMAL(20,2) DEFAULT NULL,

    mcap DECIMAL(20,2) DEFAULT NULL,

    score INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_token (token_address),
    KEY idx_symbol (symbol),
    KEY idx_created (created_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PORTFOLIO
-- =====================================================

CREATE TABLE portfolio (
    id INT NOT NULL AUTO_INCREMENT,

    token_address VARCHAR(100) NOT NULL,

    symbol VARCHAR(50) DEFAULT NULL,

    entry_mcap DECIMAL(20,2) DEFAULT NULL,

    current_mcap DECIMAL(20,2) DEFAULT NULL,

    gain_percent DECIMAL(10,2) DEFAULT 0.00,

    signal_type VARCHAR(20) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    ath_mcap DECIMAL(20,2) DEFAULT 0.00,

    milestone_sent INT DEFAULT 0,

    PRIMARY KEY (id),

    UNIQUE KEY uk_portfolio_token (token_address),

    KEY idx_symbol (symbol),
    KEY idx_signal (signal_type),
    KEY idx_created (created_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;