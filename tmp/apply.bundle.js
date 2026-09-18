(() => {
  // js/apply.js
  var getTournamentIdFromUrl = () => new URLSearchParams(window.location.search).get("id");
  var getApplicationApiUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes("/pages/");
    return isInPagesFolder ? "../api/applications" : "./api/applications";
  };
  var showMessage = (message, isError = false) => {
    const element = document.getElementById("form-message");
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? "#b42318" : "#1d9d6c";
  };
  var setSelectedTournament = () => {
    const selectedTournament = document.getElementById("selected-tournament");
    if (!selectedTournament) return;
    const tournamentId = getTournamentIdFromUrl();
    if (!tournamentId) {
      selectedTournament.textContent = "\u5927\u4F1AID\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u4E00\u89A7\u304B\u3089\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
      return;
    }
    selectedTournament.textContent = `\u5BFE\u8C61\u5927\u4F1AID: ${tournamentId}`;
  };
  var validateField = (value, fieldName) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return `${fieldName}\u306F\u5FC5\u9808\u3067\u3059\u3002`;
    }
    if (fieldName === "Discord ID" && trimmed.length < 3) {
      return "Discord ID\u306F3\u6587\u5B57\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
    }
    return "";
  };
  var redirectToDetailPage = (tournamentId) => {
    if (!tournamentId) return;
    const detailUrl = `./detail.html?id=${encodeURIComponent(tournamentId)}`;
    window.location.assign(detailUrl);
  };
  var initApplicationForm = () => {
    const form = document.getElementById("application-form");
    if (!form) {
      return;
    }
    setSelectedTournament();
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const tournamentId = getTournamentIdFromUrl();
      const playerName = form.querySelector("#player-name").value;
      const discordId = form.querySelector("#discord-id").value;
      const gameUid = form.querySelector("#game-uid").value;
      const errors = [
        validateField(playerName, "\u73FE\u5728\u306E\u30B2\u30FC\u30E0\u540D"),
        validateField(discordId, "Discord ID"),
        validateField(gameUid, "\u30B2\u30FC\u30E0UID")
      ].filter(Boolean);
      if (errors.length > 0) {
        showMessage(errors[0], true);
        return;
      }
      if (!tournamentId) {
        showMessage("\u5927\u4F1AID\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u4E00\u89A7\u304B\u3089\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002", true);
        return;
      }
      const button = form.querySelector("#submit-button");
      button.disabled = true;
      button.textContent = "\u9001\u4FE1\u4E2D...";
      try {
        const response = await fetch(getApplicationApiUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            tournament_id: tournamentId,
            player_name: playerName,
            discord_id: discordId,
            game_uid: gameUid
          })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || "\u7533\u8ACB\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002");
        }
        redirectToDetailPage(tournamentId);
      } catch (error) {
        console.error(error);
        button.disabled = false;
        button.textContent = "\u7533\u8ACB\u3059\u308B";
        showMessage(error.message || "\u7533\u8ACB\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", true);
      }
    });
  };
  window.addEventListener("DOMContentLoaded", initApplicationForm);
})();
