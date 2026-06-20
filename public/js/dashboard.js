async function loadData() {
  const response = await fetch("/api/tokens");
  const tokens = await response.json();

  const buyTokens = tokens.filter((token) => token.signal_type === "BUY");

  buyTokens.sort((a, b) => b.score - a.score);

  if (buyTokens.length) {
    document.getElementById("topBuy").innerText = buyTokens[0].symbol;

    document.getElementById("topBuyScore").innerText =
      `Score: ${buyTokens[0].score}`;
  }

  const watchTokens = tokens.filter((token) => token.signal_type === "WATCH");

  watchTokens.sort((a, b) => b.score - a.score);

  if (watchTokens.length) {
    document.getElementById("topWatch").innerText = watchTokens[0].symbol;

    document.getElementById("topWatchScore").innerText =
      `Score: ${watchTokens[0].score}`;
  }

  const highestScore = [...tokens].sort((a, b) => b.score - a.score)[0];

  if (highestScore) {
    document.getElementById("highestScoreToken").innerText =
      highestScore.symbol;

    document.getElementById("highestScore").innerText =
      `Score: ${highestScore.score}`;
  }

  let buy = 0;
  let watch = 0;
  let avoid = 0;

  const tbody = document.getElementById("tokenTable");

  tbody.innerHTML = "";

  tokens.forEach((token) => {
    const signal = token.signal_type;

    if (signal === "BUY") buy++;
    if (signal === "WATCH") watch++;
    if (signal === "AVOID") avoid++;

    const sigClass =
      signal === "BUY" ? "buy" : signal === "WATCH" ? "watch" : "avoid";

    const sigLabel =
      signal === "BUY" ? "Buy" : signal === "WATCH" ? "Watch" : "Avoid";

    const score = token.score ?? 0;

    const sc = score >= 70 ? "#10b981" : score >= 45 ? "#fbbf24" : "#ef4444";

    const addrShort = token.address
      ? token.address.slice(0, 6) + "..." + token.address.slice(-4)
      : "";

    tbody.innerHTML += `
      <tr>

        <td>
          <div class="mcs-token-name">
            ${token.symbol}
          </div>

          <div
            class="mcs-token-addr copy-ca"
            data-address="${token.address}"
            title="Click to copy contract address"
          >
            ${addrShort} 📋
          </div>
        </td>

        <td class="mcs-val">
          ${formatNum(token.liquidity)}
        </td>

        <td class="mcs-val">
          ${formatNum(token.volume)}
        </td>

        <td class="mcs-val">
          ${formatNum(token.mcap)}
        </td>

        <td>
          <div class="mcs-score">

            <div class="mcs-score-bar">
              <div
                class="mcs-score-fill"
                style="
                  width:${score}%;
                  background:${sc};
                "
              >
              </div>
            </div>

            <span
              class="mcs-score-num"
              style="color:${sc};"
            >
              ${score}
            </span>

          </div>
        </td>

        <td>
          <span class="mcs-signal sig-${sigClass}">
            ${sigLabel}
          </span>
        </td>

        <td>
          <button
            class="mcs-ai-btn"
            onclick='showAI(${JSON.stringify(token)})'
          >
            ⚡ Analyze
          </button>
        </td>

      </tr>
    `;
  });

  document.getElementById("buyCount").textContent = buy;

  document.getElementById("watchCount").textContent = watch;

  document.getElementById("avoidCount").textContent = avoid;
}

function showAI(token) {
  const text =
    typeof token === "string"
      ? token
      : token.ai_analysis || "Belum ada analisis.";

  document.getElementById("modalToken").textContent =
    typeof token === "object" ? `${token.symbol} — AI Analysis` : "AI Analysis";

  document.getElementById("modalSub").textContent =
    typeof token === "object"
      ? `score: ${token.score ?? "-"}/100 · signal: ${token.signal_type}`
      : "";

  const body = document.getElementById("aiContent");

  body.textContent = "";

  body.classList.add("typing");

  document.getElementById("aiModal").classList.add("open");

  let i = 0;

  const iv = setInterval(() => {
    body.textContent += text[i] || "";

    i++;

    if (i >= text.length) {
      clearInterval(iv);

      body.classList.remove("typing");
    }
  }, 16);
}

// COPY CONTRACT ADDRESS
document.addEventListener("click", async (e) => {
  const target = e.target.closest(".copy-ca");

  if (!target) return;

  const address = target.dataset.address;

  try {
    await navigator.clipboard.writeText(address);

    const original = target.innerHTML;

    target.innerHTML = "Copied ✅";

    setTimeout(() => {
      target.innerHTML = original;
    }, 1500);
  } catch (err) {
    console.error("Copy failed:", err);
  }
});

// Close modal
document.getElementById("modalClose").addEventListener("click", () => {
  document.getElementById("aiModal").classList.remove("open");
});

document.getElementById("aiModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove("open");
  }
});

loadData();

setInterval(loadData, 10000);
