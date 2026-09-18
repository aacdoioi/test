(() => {
  // js/admin.js
  var getApiUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes("/pages/");
    return isInPagesFolder ? "../api/tournaments" : "./api/tournaments";
  };
  var getApplicationsApiUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes("/pages/");
    return isInPagesFolder ? "../api/applications" : "./api/applications";
  };
  var showAdminMessage = (message, isError = false) => {
    const element = document.getElementById("admin-message");
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? "#b42318" : "#1d9d6c";
  };
  var serializeForm = (form) => {
    const formData = new FormData(form);
    const payload = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }
    const startAt = payload.start_at ? new Date(payload.start_at).toISOString() : "";
    const deadline = payload.deadline ? new Date(payload.deadline).toISOString() : "";
    return {
      ...payload,
      id: `${String(payload.title || "tournament").trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      start_at: startAt,
      deadline,
      entry_fee: payload.entry_fee || "\u7121\u6599",
      capacity: Number(payload.capacity || 0),
      status: payload.status || "\u52DF\u96C6\u4E2D",
      thumbnail: payload.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
    };
  };
  var renderAdminList = (items) => {
    const container = document.getElementById("admin-tournament-list");
    if (!container) return;
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = "<p>\u767B\u9332\u6E08\u307F\u306E\u5927\u4F1A\u306F\u3042\u308A\u307E\u305B\u3093\u3002</p>";
      return;
    }
    container.innerHTML = items.map((item) => `
        <div class="info-card" style="margin-bottom: 12px;">
            <h3 style="margin-bottom: 8px;">${item.title || "\u5927\u4F1A\u540D\u672A\u8A2D\u5B9A"}</h3>
            <p><strong>\u72B6\u614B:</strong> ${item.status || "\u672A\u8A2D\u5B9A"}</p>
            <p><strong>\u958B\u50AC:</strong> ${item.start_at || "\u672A\u5B9A"}</p>
            <p><strong>\u7DE0\u5207:</strong> ${item.deadline || "\u672A\u5B9A"}</p>
        </div>
    `).join("");
  };
  var renderApplicationList = (items) => {
    const container = document.getElementById("admin-application-list");
    if (!container) return;
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = "<p>\u307E\u3060\u7533\u8ACB\u306F\u3042\u308A\u307E\u305B\u3093\u3002</p>";
      return;
    }
    container.innerHTML = items.map((item) => `
        <div class="info-card" style="margin-bottom: 12px;">
            <h3 style="margin-bottom: 8px;">${item.player_name || "\u672A\u8A2D\u5B9A"} / ${item.discord_id || "Discord\u672A\u8A2D\u5B9A"}</h3>
            <p><strong>\u5927\u4F1AID:</strong> ${item.tournament_id || "\u672A\u8A2D\u5B9A"}</p>
            <p><strong>\u30B2\u30FC\u30E0UID:</strong> ${item.game_uid || "\u672A\u8A2D\u5B9A"}</p>
            <p><strong>\u72B6\u614B:</strong> ${item.status || "pending"}</p>
            <p><strong>\u5099\u8003:</strong> ${item.notes ? item.notes : "\u306A\u3057"}</p>
        </div>
    `).join("");
  };
  var loadTournaments = async () => {
    try {
      const response = await fetch(getApiUrl(), {
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`\u4E00\u89A7\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${response.status}`);
      }
      const data = await response.json();
      renderAdminList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const container = document.getElementById("admin-tournament-list");
      if (container) {
        container.innerHTML = "<p>\u5927\u4F1A\u4E00\u89A7\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002</p>";
      }
    }
  };
  var loadApplications = async () => {
    try {
      const response = await fetch(getApplicationsApiUrl(), {
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`\u7533\u8ACB\u4E00\u89A7\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${response.status}`);
      }
      const data = await response.json();
      renderApplicationList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      const container = document.getElementById("admin-application-list");
      if (container) {
        container.innerHTML = "<p>\u7533\u8ACB\u4E00\u89A7\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002</p>";
      }
    }
  };
  var initAdminPage = () => {
    const form = document.getElementById("admin-form");
    if (!form) return;
    loadTournaments();
    loadApplications();
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = serializeForm(form);
      if (!payload.title || !payload.description || !payload.start_at || !payload.deadline) {
        showAdminMessage("\u5927\u4F1A\u540D\u30FB\u6982\u8981\u30FB\u958B\u50AC\u65E5\u6642\u30FB\u7533\u8ACB\u671F\u9650\u306F\u5FC5\u9808\u3067\u3059\u3002", true);
        return;
      }
      try {
        const response = await fetch(getApiUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || "\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002");
        }
        showAdminMessage(result.message || "\u5927\u4F1A\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        form.reset();
        await loadTournaments();
      } catch (error) {
        console.error(error);
        showAdminMessage(error.message || "\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002", true);
      }
    });
  };
  window.addEventListener("DOMContentLoaded", initAdminPage);
})();
