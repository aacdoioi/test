// functions/api/applications.js
var jsonResponse = (data, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }
});
var ensureDb = (env) => env?.DB ?? null;
var readBodyJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};
var validateApplicationPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "\u30EA\u30AF\u30A8\u30B9\u30C8\u30DC\u30C7\u30A3\u3092JSON\u5F62\u5F0F\u3067\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
  }
  if (!payload.tournament_id && !payload.tournamentId) {
    return "\u5927\u4F1AID\u306F\u5FC5\u9808\u3067\u3059\u3002";
  }
  if (!payload.player_name && !payload.playerName) {
    return "\u73FE\u5728\u306E\u30B2\u30FC\u30E0\u540D\u306F\u5FC5\u9808\u3067\u3059\u3002";
  }
  if (!payload.discord_id && !payload.discordId) {
    return "Discord ID\u306F\u5FC5\u9808\u3067\u3059\u3002";
  }
  if (!payload.game_uid && !payload.gameUid) {
    return "\u30B2\u30FC\u30E0UID\u306F\u5FC5\u9808\u3067\u3059\u3002";
  }
  return null;
};
async function onRequestGet({ request, env }) {
  const db = ensureDb(env);
  if (!db) {
    return jsonResponse({ error: "D1\u304C\u672A\u8A2D\u5B9A\u306E\u305F\u3081\u3001\u7533\u8ACB\u4E00\u89A7\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3002" }, 503);
  }
  const url = new URL(request.url);
  const tournamentId = url.searchParams.get("tournament_id") || url.searchParams.get("tournamentId");
  if (tournamentId) {
    const result2 = await db.prepare("SELECT * FROM applications WHERE tournament_id = ? ORDER BY created_at DESC").bind(tournamentId).all();
    return jsonResponse(result2.results || []);
  }
  const result = await db.prepare("SELECT * FROM applications ORDER BY created_at DESC").all();
  return jsonResponse(result.results || []);
}
async function onRequestPost({ request, env }) {
  const db = ensureDb(env);
  const payload = await readBodyJson(request);
  const validationMessage = validateApplicationPayload(payload);
  if (validationMessage) {
    return jsonResponse({ error: validationMessage }, 400);
  }
  if (!db) {
    return jsonResponse({ error: "D1\u304C\u672A\u8A2D\u5B9A\u306E\u305F\u3081\u3001\u7533\u8ACB\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002" }, 503);
  }
  const tournamentId = String(payload.tournament_id ?? payload.tournamentId).trim();
  const playerName = String(payload.player_name ?? payload.playerName).trim();
  const discordId = String(payload.discord_id ?? payload.discordId).trim();
  const gameUid = String(payload.game_uid ?? payload.gameUid).trim();
  const notes = String(payload.notes ?? "").trim();
  const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await db.prepare(`
      INSERT INTO applications (
        id, tournament_id, player_name, discord_id, game_uid, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, tournamentId, playerName, discordId, gameUid, "pending", notes, now, now).run();
    return jsonResponse({
      message: "\u53C2\u52A0\u7533\u8ACB\u3092\u53D7\u3051\u4ED8\u3051\u307E\u3057\u305F\u3002",
      application: {
        id,
        tournament_id: tournamentId,
        player_name: playerName,
        discord_id: discordId,
        game_uid: gameUid,
        status: "pending",
        notes,
        created_at: now,
        updated_at: now
      }
    }, 201);
  } catch (error) {
    return jsonResponse({ error: "\u7533\u8ACB\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", details: error.message }, 500);
  }
}
async function onRequestPut({ request, params, env }) {
  const db = ensureDb(env);
  const applicationId = params?.id;
  if (!applicationId) {
    return jsonResponse({ error: "\u7533\u8ACBID\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002" }, 400);
  }
  if (!db) {
    return jsonResponse({ error: "D1\u304C\u672A\u8A2D\u5B9A\u306E\u305F\u3081\u3001\u7533\u8ACB\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u66F4\u65B0\u3067\u304D\u307E\u305B\u3093\u3002" }, 503);
  }
  const payload = await readBodyJson(request);
  const statusValue = String(payload?.status ?? "").trim();
  if (!statusValue) {
    return jsonResponse({ error: "\u30B9\u30C6\u30FC\u30BF\u30B9\u306F\u5FC5\u9808\u3067\u3059\u3002" }, 400);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const result = await db.prepare("UPDATE applications SET status = ?, updated_at = ? WHERE id = ?").bind(statusValue, now, applicationId).run();
    if (!result.meta || result.meta.changes === 0) {
      return jsonResponse({ error: "\u5BFE\u8C61\u306E\u7533\u8ACB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002" }, 404);
    }
    return jsonResponse({ message: "\u7533\u8ACB\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002", applicationId });
  } catch (error) {
    return jsonResponse({ error: "\u30B9\u30C6\u30FC\u30BF\u30B9\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", details: error.message }, 500);
  }
}
export {
  onRequestGet,
  onRequestPost,
  onRequestPut
};
