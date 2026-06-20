async function loadHealth() {
  const response = await fetch("/api/health");

  const data = await response.json();

  document.getElementById("scanner").innerText = data.scanner;

  document.getElementById("database").innerText = data.database;

  document.getElementById("telegram").innerText = data.telegram;

  document.getElementById("ai").innerText = data.ai;

  document.getElementById("totalTokens").innerText = data.totalTokens;

  document.getElementById("buy").innerText = data.buy;

  document.getElementById("watch").innerText = data.watch;

  document.getElementById("avoid").innerText = data.avoid;

  document.getElementById("lastScan").innerText = new Date(
    data.lastScan,
  ).toLocaleString();
}

loadHealth();

setInterval(loadHealth, 10000);
