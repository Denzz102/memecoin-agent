require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function analyzeToken(token) {

    try {

        const prompt = `
Anda adalah analis memecoin Solana profesional gunakan bahasa inggris.

Rules Analisis:

- Liquidity > 20,000 USD = Positif
- Volume > 10,000 USD = Positif
- Holders > 100 = Positif
- Top Holder < 3% = Sangat Sehat
- Top Holder 3% - 10% = Cukup Sehat
- Top Holder > 20% = Risiko Tinggi

Data Token:

Symbol: ${token.symbol}
Liquidity: ${token.liquidity}
Volume: ${token.volume}
MCAP: ${token.mcap}
Holders: ${token.holders}
Top Holder: ${token.top_holder}%
Score: ${token.score}

Tugas:

1. Analisis kekuatan token.
2. Jelaskan risiko utama.
3. Tentukan Risk Level (LOW/MEDIUM/HIGH).

Format output WAJIB:

Kesimpulan:
...

Risk:
LOW/MEDIUM/HIGH

Maksimal 50 kata.
`;

        const completion =
            await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content:
                            "Anda adalah analis memecoin Solana yang fokus pada liquidity, volume, holder distribution, dan market cap."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 50
            });

        return completion.choices[0].message.content;

    } catch (err) {

        console.error(
            "AI Error:",
            err.response?.data || err.message
        );

        return null;
    }
}

module.exports = {
    analyzeToken
};