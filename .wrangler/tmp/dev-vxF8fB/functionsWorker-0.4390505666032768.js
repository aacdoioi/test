var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-MYjUib/functionsWorker-0.4390505666032768.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var jsonResponse = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }
}), "jsonResponse");
var ensureDb = /* @__PURE__ */ __name2((env) => env?.DB ?? null, "ensureDb");
var readBodyJson = /* @__PURE__ */ __name2(async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
}, "readBodyJson");
var validateApplicationPayload = /* @__PURE__ */ __name2((payload) => {
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
}, "validateApplicationPayload");
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
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
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
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
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
__name(onRequestPut, "onRequestPut");
__name2(onRequestPut, "onRequestPut");
var seedTournaments = [
  {
    id: "spring-2026-open",
    title: "Spring 2026 Open",
    description: "\u5730\u57DF\u306E\u30B2\u30FC\u30E0\u4EF2\u9593\u304C\u96C6\u307E\u308B\u6625\u306E\u5927\u4F1A\u3002\u4E88\u9078\u3092\u52DD\u3061\u629C\u3044\u3066\u6C7A\u52DD\u306B\u9032\u307F\u3001\u4E0A\u4F4D\u5165\u8CDE\u8005\u306B\u306F\u666F\u54C1\u3092\u7528\u610F\u3057\u307E\u3059\u3002",
    start_at: "2026-04-18T18:30:00+09:00",
    deadline: "2026-04-05T23:59:59+09:00",
    status: "\u52DF\u96C6\u4E2D",
    venue: "\u30AA\u30F3\u30E9\u30A4\u30F3\u5BFE\u6226\u5BA4 / Discord",
    entry_fee: "\u7121\u6599",
    capacity: 32,
    organizer: "\u904B\u55B6\u30C1\u30FC\u30E0A",
    rules: "3\u672C\u5148\u53D6 / 5\u5206\u5236\u9650 / \u53CD\u5247\u6642\u306F\u5931\u683C\u5224\u5B9A",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "summer-showdown",
    title: "Summer Showdown",
    description: "\u590F\u4F11\u307F\u671F\u9593\u4E2D\u306B\u958B\u50AC\u3059\u308B\u5927\u578B\u5BFE\u6226\u30A4\u30D9\u30F3\u30C8\u3002\u4E88\u9078\u30E9\u30A6\u30F3\u30C9\u3068\u6C7A\u52DD\u30C8\u30FC\u30CA\u30E1\u30F3\u30C8\u3092\u901A\u3058\u3066\u512A\u52DD\u3092\u4E89\u3044\u307E\u3059\u3002",
    start_at: "2026-07-12T17:00:00+09:00",
    deadline: "2026-06-30T23:59:59+09:00",
    status: "\u53C2\u52A0\u53D7\u4ED8\u4E2D",
    venue: "\u90FD\u5185\u30A4\u30D9\u30F3\u30C8\u4F1A\u5834",
    entry_fee: "1,000\u5186",
    capacity: 16,
    organizer: "\u904B\u55B6\u30C1\u30FC\u30E0B",
    rules: "\u30B7\u30F3\u30B0\u30EB\u30A8\u30EA\u30DF\u30CD\u30FC\u30B7\u30E7\u30F3 / 1\u8A66\u5408 10\u5206 / \u4E8B\u524D\u8ABF\u6574\u5FC5\u9808",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "weekend-cup",
    title: "Weekend Cup",
    description: "\u571F\u65E5\u3092\u4F7F\u3063\u3066\u6C17\u8EFD\u306B\u53C2\u52A0\u3067\u304D\u308B\u77ED\u671F\u5927\u4F1A\u3002\u4E88\u9078\u306F\u6BD4\u8F03\u7684\u77ED\u6642\u9593\u3067\u9032\u884C\u3057\u3001\u4F53\u9A13\u53C2\u52A0\u3082\u3057\u3084\u3059\u3044\u69CB\u6210\u3067\u3059\u3002",
    start_at: "2026-09-05T13:00:00+09:00",
    deadline: "2026-08-31T23:59:59+09:00",
    status: "\u6E96\u5099\u4E2D",
    venue: "\u4F1A\u5834\u672A\u5B9A\uFF08\u767A\u8868\u4E88\u5B9A\uFF09",
    entry_fee: "\u7121\u6599",
    capacity: 24,
    organizer: "\u904B\u55B6\u30C1\u30FC\u30E0C",
    rules: "\u30B0\u30EB\u30FC\u30D7\u6226\uFF0B\u6C7A\u52DD / 5\u5206\u5236\u9650 / \u9014\u4E2D\u53C2\u52A0\u53EF",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80"
  }
];
var jsonResponse2 = /* @__PURE__ */ __name2((data, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }
}), "jsonResponse");
var normalizeTournament = /* @__PURE__ */ __name2((item) => ({
  id: item.id,
  title: item.title,
  description: item.description ?? "",
  startAt: item.start_at ?? item.startAt,
  deadline: item.deadline ?? "",
  status: item.status ?? "\u52DF\u96C6\u4E2D",
  venue: item.venue ?? "\u672A\u5B9A",
  entryFee: item.entry_fee ?? item.entryFee ?? "\u672A\u5B9A",
  capacity: item.capacity ?? null,
  organizer: item.organizer ?? "\u904B\u55B6\u30C1\u30FC\u30E0",
  rules: item.rules ?? "",
  thumbnail: item.thumbnail ?? ""
}), "normalizeTournament");
var ensureDb2 = /* @__PURE__ */ __name2((env) => env?.DB ?? null, "ensureDb");
var readBodyJson2 = /* @__PURE__ */ __name2(async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
}, "readBodyJson");
var validateTournamentPayload = /* @__PURE__ */ __name2((payload) => {
  if (!payload || typeof payload !== "object") {
    return "\u30EA\u30AF\u30A8\u30B9\u30C8\u30DC\u30C7\u30A3\u3092JSON\u5F62\u5F0F\u3067\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
  }
  if (!payload.title || !String(payload.title).trim()) {
    return "\u5927\u4F1A\u540D\u306F\u5FC5\u9808\u3067\u3059\u3002";
  }
  if (!payload.start_at && !payload.startAt) {
    return "\u958B\u50AC\u65E5\u6642\u306F\u5FC5\u9808\u3067\u3059\u3002";
  }
  if (!payload.deadline) {
    return "\u7533\u8ACB\u671F\u9650\u306F\u5FC5\u9808\u3067\u3059\u3002";
  }
  return null;
}, "validateTournamentPayload");
async function onRequestGet2({ params, env }) {
  const db = ensureDb2(env);
  if (!db) {
    return jsonResponse2(seedTournaments.map(normalizeTournament));
  }
  const tournamentId = params?.id ?? null;
  if (tournamentId) {
    const result2 = await db.prepare("SELECT * FROM tournaments WHERE id = ?").bind(tournamentId).first();
    if (!result2) {
      return jsonResponse2({ error: "\u5927\u4F1A\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002" }, 404);
    }
    return jsonResponse2(normalizeTournament(result2));
  }
  const result = await db.prepare("SELECT * FROM tournaments ORDER BY start_at ASC").all();
  return jsonResponse2((result.results || []).map(normalizeTournament));
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestPost2({ request, env }) {
  const db = ensureDb2(env);
  const payload = await readBodyJson2(request);
  const validationMessage = validateTournamentPayload(payload);
  if (validationMessage) {
    return jsonResponse2({ error: validationMessage }, 400);
  }
  const title = String(payload.title).trim();
  const description = String(payload.description ?? "").trim();
  const startAt = String(payload.start_at ?? payload.startAt).trim();
  const deadline = String(payload.deadline).trim();
  const status = String(payload.status ?? "\u52DF\u96C6\u4E2D").trim();
  const venue = String(payload.venue ?? "\u672A\u5B9A").trim();
  const entryFee = String(payload.entry_fee ?? payload.entryFee ?? "\u672A\u5B9A").trim();
  const capacity = payload.capacity ?? null;
  const organizer = String(payload.organizer ?? "\u904B\u55B6\u30C1\u30FC\u30E0").trim();
  const rules = String(payload.rules ?? "").trim();
  const thumbnail = String(payload.thumbnail ?? "").trim();
  const id = String(payload.id ?? `${title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`);
  if (!db) {
    return jsonResponse2({ error: "D1\u304C\u672A\u8A2D\u5B9A\u306E\u305F\u3081\u3001\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3002\u958B\u767A\u6642\u306FDB\u30D0\u30A4\u30F3\u30C7\u30A3\u30F3\u30B0\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, 503);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await db.prepare(`
      INSERT INTO tournaments (
        id, title, description, start_at, deadline, status, venue, entry_fee,
        capacity, organizer, rules, thumbnail, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      title,
      description,
      startAt,
      deadline,
      status,
      venue,
      entryFee,
      capacity,
      organizer,
      rules,
      thumbnail,
      now,
      now
    ).run();
    return jsonResponse2({
      message: "\u5927\u4F1A\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002",
      tournament: normalizeTournament({
        id,
        title,
        description,
        start_at: startAt,
        deadline,
        status,
        venue,
        entry_fee: entryFee,
        capacity,
        organizer,
        rules,
        thumbnail
      })
    }, 201);
  } catch (error) {
    return jsonResponse2({ error: "\u5927\u4F1A\u306E\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", details: error.message }, 500);
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestPut2({ request, params, env }) {
  const db = ensureDb2(env);
  const tournamentId = params?.id;
  if (!tournamentId) {
    return jsonResponse2({ error: "\u5927\u4F1AID\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002" }, 400);
  }
  if (!db) {
    return jsonResponse2({ error: "D1\u304C\u672A\u8A2D\u5B9A\u306E\u305F\u3081\u3001\u66F4\u65B0\u3067\u304D\u307E\u305B\u3093\u3002" }, 503);
  }
  const payload = await readBodyJson2(request);
  const validationMessage = validateTournamentPayload(payload);
  if (validationMessage) {
    return jsonResponse2({ error: validationMessage }, 400);
  }
  const title = String(payload.title).trim();
  const description = String(payload.description ?? "").trim();
  const startAt = String(payload.start_at ?? payload.startAt).trim();
  const deadline = String(payload.deadline).trim();
  const status = String(payload.status ?? "\u52DF\u96C6\u4E2D").trim();
  const venue = String(payload.venue ?? "\u672A\u5B9A").trim();
  const entryFee = String(payload.entry_fee ?? payload.entryFee ?? "\u672A\u5B9A").trim();
  const capacity = payload.capacity ?? null;
  const organizer = String(payload.organizer ?? "\u904B\u55B6\u30C1\u30FC\u30E0").trim();
  const rules = String(payload.rules ?? "").trim();
  const thumbnail = String(payload.thumbnail ?? "").trim();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const result = await db.prepare(`
      UPDATE tournaments
      SET title = ?, description = ?, start_at = ?, deadline = ?, status = ?, venue = ?,
          entry_fee = ?, capacity = ?, organizer = ?, rules = ?, thumbnail = ?, updated_at = ?
      WHERE id = ?
    `).bind(title, description, startAt, deadline, status, venue, entryFee, capacity, organizer, rules, thumbnail, now, tournamentId).run();
    if (!result.meta || result.meta.changes === 0) {
      return jsonResponse2({ error: "\u5BFE\u8C61\u306E\u5927\u4F1A\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002" }, 404);
    }
    return jsonResponse2({
      message: "\u5927\u4F1A\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002",
      tournament: normalizeTournament({
        id: tournamentId,
        title,
        description,
        start_at: startAt,
        deadline,
        status,
        venue,
        entry_fee: entryFee,
        capacity,
        organizer,
        rules,
        thumbnail
      })
    });
  } catch (error) {
    return jsonResponse2({ error: "\u5927\u4F1A\u306E\u66F4\u65B0\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", details: error.message }, 500);
  }
}
__name(onRequestPut2, "onRequestPut2");
__name2(onRequestPut2, "onRequestPut");
async function onRequestDelete({ params, env }) {
  const db = ensureDb2(env);
  const tournamentId = params?.id;
  if (!tournamentId) {
    return jsonResponse2({ error: "\u5927\u4F1AID\u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002" }, 400);
  }
  if (!db) {
    return jsonResponse2({ error: "D1\u304C\u672A\u8A2D\u5B9A\u306E\u305F\u3081\u3001\u524A\u9664\u3067\u304D\u307E\u305B\u3093\u3002" }, 503);
  }
  try {
    const result = await db.prepare("DELETE FROM tournaments WHERE id = ?").bind(tournamentId).run();
    if (!result.meta || result.meta.changes === 0) {
      return jsonResponse2({ error: "\u5BFE\u8C61\u306E\u5927\u4F1A\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002" }, 404);
    }
    return jsonResponse2({ message: "\u5927\u4F1A\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002" });
  } catch (error) {
    return jsonResponse2({ error: "\u5927\u4F1A\u306E\u524A\u9664\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002", details: error.message }, 500);
  }
}
__name(onRequestDelete, "onRequestDelete");
__name2(onRequestDelete, "onRequestDelete");
var routes = [
  {
    routePath: "/api/applications",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/applications",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/applications",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/tournaments",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/tournaments",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/tournaments",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/tournaments",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-Z0lFpe/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-Z0lFpe/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.4390505666032768.js.map
