async function loadLandingTokens() {
  try {
    const response = await fetch("/api/tokens");

    const tokens = await response.json();

    const latest = tokens.slice(0, 4);

    let html = "";

    latest.forEach((token) => {
      let color = "#ef4444";

      let signalClass = "sig-avoid";

      if (token.signal_type === "BUY") {
        color = "#10b981";
        signalClass = "sig-buy";
      }

      if (token.signal_type === "WATCH") {
        color = "#fbbf24";
        signalClass = "sig-watch";
      }

      html += `
            <div class="mini-row">

                <div>

                    <div class="mini-token">
                        ${token.symbol}
                    </div>

                    <div class="mini-addr">
                        ${token.address.substring(0, 10)}...
                    </div>

                </div>

                <div class="mini-score-wrap">

                    <div class="mini-bar">

                        <div
                            class="mini-fill"
                            style="
                                width:${token.score}%;
                                background:${color};
                            "
                        ></div>

                    </div>

                    <span
                        class="mini-num"
                        style="color:${color};"
                    >
                        ${token.score}
                    </span>

                </div>

                <span
                    class="mini-sig ${signalClass}"
                >
                    ${token.signal_type}
                </span>

            </div>
            `;
    });

    document.getElementById("landingTokens").innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

loadLandingTokens();

async function loadTopGainers() {
  try {
    const response = await fetch("/api/top-gainers");

    const gainers = await response.json();

    let html = "";

    gainers.slice(0, 5).forEach((token, index) => {
      html += `
            <div class="gainer-card">

                <div class="gainer-rank">
                    #${index + 1}
                </div>

                <div class="gainer-symbol">
                    ${token.symbol}
                </div>
                

                <div class="gainer-percent">
                    +${token.gain_percent}%
                </div>

            </div>
            `;
    });

    document.getElementById("topGainers").innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

loadTopGainers();
