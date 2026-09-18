const seedTournaments = [
  {
    id: 'spring-2026-open',
    title: 'Spring 2026 Open',
    description: '地域のゲーム仲間が集まる春の大会。予選を勝ち抜いて決勝に進み、上位入賞者には景品を用意します。',
    start_at: '2026-04-18T18:30:00+09:00',
    deadline: '2026-04-05T23:59:59+09:00',
    status: '募集中',
    venue: 'オンライン対戦室 / Discord',
    entry_fee: '無料',
    capacity: 32,
    organizer: '運営チームA',
    rules: '3本先取 / 5分制限 / 反則時は失格判定',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'summer-showdown',
    title: 'Summer Showdown',
    description: '夏休み期間中に開催する大型対戦イベント。予選ラウンドと決勝トーナメントを通じて優勝を争います。',
    start_at: '2026-07-12T17:00:00+09:00',
    deadline: '2026-06-30T23:59:59+09:00',
    status: '参加受付中',
    venue: '都内イベント会場',
    entry_fee: '1,000円',
    capacity: 16,
    organizer: '運営チームB',
    rules: 'シングルエリミネーション / 1試合 10分 / 事前調整必須',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'weekend-cup',
    title: 'Weekend Cup',
    description: '土日を使って気軽に参加できる短期大会。予選は比較的短時間で進行し、体験参加もしやすい構成です。',
    start_at: '2026-09-05T13:00:00+09:00',
    deadline: '2026-08-31T23:59:59+09:00',
    status: '準備中',
    venue: '会場未定（発表予定）',
    entry_fee: '無料',
    capacity: 24,
    organizer: '運営チームC',
    rules: 'グループ戦＋決勝 / 5分制限 / 途中参加可',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80'
  }
];

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  }
});

const normalizeTournament = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description ?? '',
  startAt: item.start_at ?? item.startAt,
  deadline: item.deadline ?? '',
  status: item.status ?? '募集中',
  venue: item.venue ?? '未定',
  entryFee: item.entry_fee ?? item.entryFee ?? '未定',
  capacity: item.capacity ?? null,
  organizer: item.organizer ?? '運営チーム',
  rules: item.rules ?? '',
  thumbnail: item.thumbnail ?? ''
});

const ensureDb = (env) => env?.DB ?? null;

const readBodyJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const validateTournamentPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'リクエストボディをJSON形式で送信してください。';
  }

  if (!payload.title || !String(payload.title).trim()) {
    return '大会名は必須です。';
  }

  if (!payload.start_at && !payload.startAt) {
    return '開催日時は必須です。';
  }

  if (!payload.deadline) {
    return '申請期限は必須です。';
  }

  return null;
};

export async function onRequestGet({ params, env }) {
  const db = ensureDb(env);

  if (!db) {
    return jsonResponse(seedTournaments.map(normalizeTournament));
  }

  const tournamentId = params?.id ?? null;

  if (tournamentId) {
    const result = await db.prepare('SELECT * FROM tournaments WHERE id = ?').bind(tournamentId).first();
    if (!result) {
      return jsonResponse({ error: '大会が見つかりません。' }, 404);
    }
    return jsonResponse(normalizeTournament(result));
  }

  const result = await db.prepare('SELECT * FROM tournaments ORDER BY start_at ASC').all();
  return jsonResponse((result.results || []).map(normalizeTournament));
}

export async function onRequestPost({ request, env }) {
  const db = ensureDb(env);
  const payload = await readBodyJson(request);
  const validationMessage = validateTournamentPayload(payload);

  if (validationMessage) {
    return jsonResponse({ error: validationMessage }, 400);
  }

  const title = String(payload.title).trim();
  const description = String(payload.description ?? '').trim();
  const startAt = String(payload.start_at ?? payload.startAt).trim();
  const deadline = String(payload.deadline).trim();
  const status = String(payload.status ?? '募集中').trim();
  const venue = String(payload.venue ?? '未定').trim();
  const entryFee = String(payload.entry_fee ?? payload.entryFee ?? '未定').trim();
  const capacity = payload.capacity ?? null;
  const organizer = String(payload.organizer ?? '運営チーム').trim();
  const rules = String(payload.rules ?? '').trim();
  const thumbnail = String(payload.thumbnail ?? '').trim();
  const id = String(payload.id ?? `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`);

  if (!db) {
    return jsonResponse({ error: 'D1が未設定のため、保存できません。開発時はDBバインディングを設定してください。' }, 503);
  }

  const now = new Date().toISOString();

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

    return jsonResponse({
      message: '大会を追加しました。',
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
    return jsonResponse({ error: '大会の保存に失敗しました。', details: error.message }, 500);
  }
}

export async function onRequestPut({ request, params, env }) {
  const db = ensureDb(env);
  const tournamentId = params?.id;

  if (!tournamentId) {
    return jsonResponse({ error: '大会IDが指定されていません。' }, 400);
  }

  if (!db) {
    return jsonResponse({ error: 'D1が未設定のため、更新できません。' }, 503);
  }

  const payload = await readBodyJson(request);
  const validationMessage = validateTournamentPayload(payload);

  if (validationMessage) {
    return jsonResponse({ error: validationMessage }, 400);
  }

  const title = String(payload.title).trim();
  const description = String(payload.description ?? '').trim();
  const startAt = String(payload.start_at ?? payload.startAt).trim();
  const deadline = String(payload.deadline).trim();
  const status = String(payload.status ?? '募集中').trim();
  const venue = String(payload.venue ?? '未定').trim();
  const entryFee = String(payload.entry_fee ?? payload.entryFee ?? '未定').trim();
  const capacity = payload.capacity ?? null;
  const organizer = String(payload.organizer ?? '運営チーム').trim();
  const rules = String(payload.rules ?? '').trim();
  const thumbnail = String(payload.thumbnail ?? '').trim();
  const now = new Date().toISOString();

  try {
    const result = await db.prepare(`
      UPDATE tournaments
      SET title = ?, description = ?, start_at = ?, deadline = ?, status = ?, venue = ?,
          entry_fee = ?, capacity = ?, organizer = ?, rules = ?, thumbnail = ?, updated_at = ?
      WHERE id = ?
    `).bind(title, description, startAt, deadline, status, venue, entryFee, capacity, organizer, rules, thumbnail, now, tournamentId).run();

    if (!result.meta || result.meta.changes === 0) {
      return jsonResponse({ error: '対象の大会が見つかりません。' }, 404);
    }

    return jsonResponse({
      message: '大会を更新しました。',
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
    return jsonResponse({ error: '大会の更新に失敗しました。', details: error.message }, 500);
  }
}

export async function onRequestDelete({ params, env }) {
  const db = ensureDb(env);
  const tournamentId = params?.id;

  if (!tournamentId) {
    return jsonResponse({ error: '大会IDが指定されていません。' }, 400);
  }

  if (!db) {
    return jsonResponse({ error: 'D1が未設定のため、削除できません。' }, 503);
  }

  try {
    const result = await db.prepare('DELETE FROM tournaments WHERE id = ?').bind(tournamentId).run();

    if (!result.meta || result.meta.changes === 0) {
      return jsonResponse({ error: '対象の大会が見つかりません。' }, 404);
    }

    return jsonResponse({ message: '大会を削除しました。' });
  } catch (error) {
    return jsonResponse({ error: '大会の削除に失敗しました。', details: error.message }, 500);
  }
}
