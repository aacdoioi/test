const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  }
});

const ensureDb = (env) => env?.DB ?? null;

const readBodyJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const validateApplicationPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'リクエストボディをJSON形式で送信してください。';
  }

  if (!payload.tournament_id && !payload.tournamentId) {
    return '大会IDは必須です。';
  }

  if (!payload.player_name && !payload.playerName) {
    return '現在のゲーム名は必須です。';
  }

  if (!payload.discord_id && !payload.discordId) {
    return 'Discord IDは必須です。';
  }

  if (!payload.game_uid && !payload.gameUid) {
    return 'ゲームUIDは必須です。';
  }

  return null;
};

export async function onRequestGet({ request, env }) {
  const db = ensureDb(env);

  if (!db) {
    return jsonResponse({ error: 'D1が未設定のため、申請一覧を取得できません。' }, 503);
  }

  const url = new URL(request.url);
  const tournamentId = url.searchParams.get('tournament_id') || url.searchParams.get('tournamentId');

  if (tournamentId) {
    const result = await db.prepare('SELECT * FROM applications WHERE tournament_id = ? ORDER BY created_at DESC').bind(tournamentId).all();
    return jsonResponse(result.results || []);
  }

  const result = await db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
  return jsonResponse(result.results || []);
}

export async function onRequestPost({ request, env }) {
  const db = ensureDb(env);
  const payload = await readBodyJson(request);
  const validationMessage = validateApplicationPayload(payload);

  if (validationMessage) {
    return jsonResponse({ error: validationMessage }, 400);
  }

  if (!db) {
    return jsonResponse({ error: 'D1が未設定のため、申請を保存できません。' }, 503);
  }

  const tournamentId = String(payload.tournament_id ?? payload.tournamentId).trim();
  const playerName = String(payload.player_name ?? payload.playerName).trim();
  const discordId = String(payload.discord_id ?? payload.discordId).trim();
  const gameUid = String(payload.game_uid ?? payload.gameUid).trim();
  const notes = String(payload.notes ?? '').trim();
  const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO applications (
        id, tournament_id, player_name, discord_id, game_uid, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, tournamentId, playerName, discordId, gameUid, 'pending', notes, now, now).run();

    return jsonResponse({
      message: '参加申請を受け付けました。',
      application: {
        id,
        tournament_id: tournamentId,
        player_name: playerName,
        discord_id: discordId,
        game_uid: gameUid,
        status: 'pending',
        notes,
        created_at: now,
        updated_at: now
      }
    }, 201);
  } catch (error) {
    return jsonResponse({ error: '申請の保存に失敗しました。', details: error.message }, 500);
  }
}

export async function onRequestPut({ request, params, env }) {
  const db = ensureDb(env);
  const applicationId = params?.id;

  if (!applicationId) {
    return jsonResponse({ error: '申請IDが指定されていません。' }, 400);
  }

  if (!db) {
    return jsonResponse({ error: 'D1が未設定のため、申請ステータスを更新できません。' }, 503);
  }

  const payload = await readBodyJson(request);
  const statusValue = String(payload?.status ?? '').trim();

  if (!statusValue) {
    return jsonResponse({ error: 'ステータスは必須です。' }, 400);
  }

  const now = new Date().toISOString();

  try {
    const result = await db.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?').bind(statusValue, now, applicationId).run();

    if (!result.meta || result.meta.changes === 0) {
      return jsonResponse({ error: '対象の申請が見つかりません。' }, 404);
    }

    return jsonResponse({ message: '申請ステータスを更新しました。', applicationId });
  } catch (error) {
    return jsonResponse({ error: 'ステータス更新に失敗しました。', details: error.message }, 500);
  }
}
