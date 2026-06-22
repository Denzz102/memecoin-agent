let portfolioData = [];
let activeFilter = "ALL";
let activeDayFilter = "ALL";

async function loadPortfolio() {
  const res = await fetch("/api/portfolio");

  portfolioData = await res.json();

  let filtered = filterByDays(portfolioData);

  updateFilterCounts(filtered);

  if (activeFilter !== "ALL") {
    filtered = filtered.filter((row) => row.signal_type === activeFilter);
  }

  renderPortfolio(filtered);
  updateStats(filtered);
}

async function loadHallOfFame() {
  const res = await fetch("/api/hall-of-fame");
  const data = await res.json();
  const container = document.getElementById("hallOfFame");
  container.innerHTML = "";

  const medals = ["🥇", "🥈", "🥉"];
  const rankLabels = ["#1", "#2", "#3", "#4", "#5"];
  const glowClass = ["hof-glow-1", "hof-glow-2", "hof-glow-3", "", ""];

  data.forEach((token, index) => {
    const rankClass = index < 3 ? `rank-${index + 1}` : "";
    const medal =
      index < 3
        ? `<span class="hof-medal">${medals[index]}</span>`
        : `<span class="hof-medal" style="font-size:20px;color:#3a4a80">${rankLabels[index]}</span>`;

    container.innerHTML += `
      <div class="hof-card ${rankClass} ${glowClass[index] || ""}">
        ${medal}
        <div class="hof-rank">${index >= 3 ? `#${index + 1}` : ["GOLD", "SILVER", "BRONZE"][index]}</div>
        <div class="hof-symbol">${token.symbol}</div>
        <div class="hof-gain">${Number(token.ath_gain).toFixed(2)}%</div>
        <div class="hof-gain-label">ATH Gain</div>
      </div>
    `;
  });
}

function filterByDays(data) {
  if (activeDayFilter === "ALL") return data;

  const now = new Date();

  return data.filter((row) => {
    const created = new Date(row.created_at);

    const diffDays = (now - created) / (1000 * 60 * 60 * 24);

    return diffDays <= activeDayFilter;
  });
}

function filterDays(days, btn) {
  activeDayFilter = days;

  document.querySelectorAll(".day-filter").forEach((b) => {
    b.classList.remove("active");
  });

  btn.classList.add("active");

  let dayFiltered = filterByDays(portfolioData);

  // update count berdasarkan filter hari
  updateFilterCounts(dayFiltered);

  let filtered = dayFiltered;

  if (activeFilter !== "ALL") {
    filtered = filtered.filter((row) => row.signal_type === activeFilter);
  }

  renderPortfolio(filtered);
  updateStats(filtered);
}

function updateFilterCounts(data) {
  document.getElementById("count-all").textContent = data.length;
  document.getElementById("count-buy").textContent = data.filter(
    (d) => d.signal_type === "BUY",
  ).length;
  document.getElementById("count-watch").textContent = data.filter(
    (d) => d.signal_type === "WATCH",
  ).length;
}

function formatMCAP(value) {
  const num = Number(value || 0);

  if (num >= 1_000_000_000) return "$" + (num / 1_000_000_000).toFixed(1) + "B";

  if (num >= 1_000_000) return "$" + (num / 1_000_000).toFixed(1) + "M";

  if (num >= 1_000) return "$" + (num / 1_000).toFixed(1) + "K";

  return "$" + num.toFixed(0);
}

function formatCallAge(dateString) {
  const createdAt = new Date(dateString);
  const now = new Date();

  const diffMs = now - createdAt;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (days > 0) {
    return `Called ${days} Day${days > 1 ? "s" : ""} Ago`;
  }

  if (hours > 0) {
    return `Called ${hours} Hour${hours > 1 ? "s" : ""} Ago`;
  }

  return `⏱ Called ${minutes} Min Ago`;
}

function renderPortfolio(data) {
  const table = document.getElementById("portfolioTable");
  table.innerHTML = "";

  data.forEach((row, index) => {
    const gain = Number(row.gain_percent || 0);
    const athGain = Number(row.ath_gain || 0);

    let badgeClass = "bg-success";
    if (row.signal_type === "WATCH") badgeClass = "bg-warning text-dark";
    if (row.signal_type === "AVOID") badgeClass = "bg-danger";

    let rank;

    if (index === 0) {
      rank = "🥇";
    } else if (index === 1) {
      rank = "🥈";
    } else if (index === 2) {
      rank = "🥉";
    } else {
      rank = `#${index + 1}`;
    }

    table.innerHTML += `
      <tr>
        <td class="text-center fw-bold">
          ${rank}
        </td>

        <td>
          <strong>${row.symbol}</strong><br>

          <a
            href="https://dexscreener.com/solana/${row.token_address}"
            target="_blank"
            class="text-info text-decoration-none"
          >
            ${row.token_address.slice(0, 6)}...${row.token_address.slice(-4)}
          </a>

          <button
            class="btn btn-sm btn-outline-light ms-2"
            onclick="navigator.clipboard.writeText('${row.token_address}')"
            title="Copy Contract Address"
          >
            📋
          </button>

          <button
            class="btn btn-sm btn-outline-warning ms-1"
            onclick="rescanToken('${row.token_address}')"
            title="Rescan Token"
          >
            🔄
          </button>

          <button
  class="btn btn-sm btn-outline-success ms-1"
  onclick="openPNLModal('${row.token_address}')"
>
  📸
</button>
        </td>

        <td>
          <span class="badge ${badgeClass}">
            ${row.signal_type}
          </span>
        </td>

        <td>${formatMCAP(row.entry_mcap)}</td>
<td>${formatMCAP(row.current_mcap)}</td>
<td>${formatMCAP(row.ath_mcap)}</td>

        <td class="${gain >= 0 ? "profit" : "loss"}">
          ${gain.toFixed(2)}%
        </td>

        <td class="${athGain >= 0 ? "profit" : "loss"}">
          ${athGain.toFixed(2)}%
        </td>
      </tr>
    `;
  });
}

function updateStats(data) {
  let winners = 0;
  let bestGain = 0;
  let bestAthGain = 0;

  data.forEach((row) => {
    const gain = Number(row.gain_percent || 0);
    const athGain = Number(row.ath_gain || 0);
    if (athGain >= 100) winners++;
    if (gain > bestGain) bestGain = gain;
    if (athGain > bestAthGain) bestAthGain = athGain;
  });

  const winRate =
    data.length > 0 ? ((winners / data.length) * 100).toFixed(2) : "0.00";

  document.getElementById("totalToken").innerText = data.length;
  document.getElementById("winnerCount").innerText = winners;
  document.getElementById("winRate").innerText = winRate + "%";
  document.getElementById("bestGain").innerText = bestGain.toFixed(2) + "%";
  document.getElementById("bestAthGain").innerText =
    bestAthGain.toFixed(2) + "%";
}

function filterPortfolio(type) {
  activeFilter = type;

  let filtered = filterByDays(portfolioData);

  updateFilterCounts(filtered);

  if (type !== "ALL") {
    filtered = filtered.filter((row) => row.signal_type === type);
  }

  renderPortfolio(filtered);
  updateStats(filtered);
}

function setActive(el, type) {
  document.querySelectorAll(".f-btn").forEach((b) => (b.className = "f-btn"));
  el.classList.add("active-" + type.toLowerCase());
}

async function rescanToken(address) {
  const confirmScan = confirm("Rescan token ini?");

  if (!confirmScan) return;

  try {
    const res = await fetch(`/api/rescan/${address}`, {
      method: "POST",
    });

    const data = await res.json();

    document.getElementById("oldSignal").innerText = data.oldSignal;

    document.getElementById("newSignal").innerText = data.newSignal;

    document.getElementById("rescanScore").innerText = data.score;

    let msg = "No Signal Change";

    if (data.oldSignal === "WATCH" && data.newSignal === "BUY") {
      msg = "🚀 Promoted to BUY";
    }

    if (data.oldSignal === "AVOID" && data.newSignal === "WATCH") {
      msg = "👀 Promoted to WATCH";
    }

    if (data.oldSignal === "AVOID" && data.newSignal === "BUY") {
      msg = "🔥 Promoted directly to BUY";
    }

    if (data.oldSignal === data.newSignal) {
      msg = "📊 Signal unchanged";
    }

    document.getElementById("rescanMessage").innerText = msg;

    const modal = new bootstrap.Modal(document.getElementById("rescanModal"));

    modal.show();

    loadPortfolio();
  } catch (err) {
    console.error(err);

    alert("Rescan gagal");
  }
}

function openPNLModal(address) {
  const token = portfolioData.find((t) => t.token_address === address);

  if (!token) return;

  document.getElementById("pnlSymbol").innerText = `$ ${token.symbol}`;

  document.getElementById("pnlCallAge").innerText = formatCallAge(
    token.created_at,
  );

  document.getElementById("pnlEntry").innerText = formatMCAP(token.entry_mcap);

  document.getElementById("pnlCurrent").innerText = formatMCAP(
    token.current_mcap,
  );

  document.getElementById("pnlAth").innerText = formatMCAP(token.ath_mcap);

  // ==========================
  // CURRENT GAIN
  // ==========================

  const gain = Number(token.gain_percent || 0);

  const pnlGainEl = document.getElementById("pnlGain");

  pnlGainEl.innerText = gain.toFixed(2) + "%";

  pnlGainEl.classList.remove("pnl-profit", "pnl-loss");

  if (gain >= 0) {
    pnlGainEl.classList.add("pnl-profit");
  } else {
    pnlGainEl.classList.add("pnl-loss");
  }

  // ==========================
  // ATH GAIN
  // ==========================

  const athGain = Number(token.ath_gain || 0);

  const athGainEl = document.getElementById("pnlAthGain");

  athGainEl.innerText = athGain.toFixed(2) + "%";

  athGainEl.classList.remove("pnl-profit", "pnl-loss");

  if (athGain >= 0) {
    athGainEl.classList.add("pnl-profit");
  } else {
    athGainEl.classList.add("pnl-loss");
  }

  // ==========================
  // MODAL
  // ==========================

  const modal = new bootstrap.Modal(document.getElementById("pnlModal"));

  modal.show();
}

async function downloadPNL() {
  const card = document.getElementById("pnlCard");

  const canvas = await html2canvas(card, {
    scale: 2,
    backgroundColor: null,
  });

  const link = document.createElement("a");

  link.download = `denzz-pnl-${Date.now()}.png`;

  link.href = canvas.toDataURL("image/png");

  link.click();
}

loadPortfolio();

loadHallOfFame();

setInterval(() => {
  loadPortfolio();

  loadHallOfFame();
}, 30000);
