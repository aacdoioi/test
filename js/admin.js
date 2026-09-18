const getApiUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes('/pages/');
    return isInPagesFolder ? '../api/tournaments' : './api/tournaments';
};

const getApplicationsApiUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes('/pages/');
    return isInPagesFolder ? '../api/applications' : './api/applications';
};

const showAdminMessage = (message, isError = false) => {
    const element = document.getElementById('admin-message');
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? '#b42318' : '#1d9d6c';
};

const serializeForm = (form) => {
    const formData = new FormData(form);
    const payload = {};

    for (const [key, value] of formData.entries()) {
        payload[key] = value;
    }

    const startAt = payload.start_at ? new Date(payload.start_at).toISOString() : '';
    const deadline = payload.deadline ? new Date(payload.deadline).toISOString() : '';

    return {
        ...payload,
        id: `${String(payload.title || 'tournament').trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        start_at: startAt,
        deadline,
        entry_fee: payload.entry_fee || '無料',
        capacity: Number(payload.capacity || 0),
        status: payload.status || '募集中',
        thumbnail: payload.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
    };
};

const renderAdminList = (items) => {
    const container = document.getElementById('admin-tournament-list');
    if (!container) return;

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = '<p>登録済みの大会はありません。</p>';
        return;
    }

    container.innerHTML = items.map((item) => `
        <div class="info-card" style="margin-bottom: 12px;">
            <h3 style="margin-bottom: 8px;">${item.title || '大会名未設定'}</h3>
            <p><strong>状態:</strong> ${item.status || '未設定'}</p>
            <p><strong>開催:</strong> ${item.start_at || '未定'}</p>
            <p><strong>締切:</strong> ${item.deadline || '未定'}</p>
        </div>
    `).join('');
};

const renderApplicationList = (items) => {
    const container = document.getElementById('admin-application-list');
    if (!container) return;

    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML = '<p>まだ申請はありません。</p>';
        return;
    }

    container.innerHTML = items.map((item) => `
        <div class="info-card" style="margin-bottom: 12px;">
            <h3 style="margin-bottom: 8px;">${item.player_name || '未設定'} / ${item.discord_id || 'Discord未設定'}</h3>
            <p><strong>大会ID:</strong> ${item.tournament_id || '未設定'}</p>
            <p><strong>ゲームUID:</strong> ${item.game_uid || '未設定'}</p>
            <p><strong>状態:</strong> ${item.status || 'pending'}</p>
            <p><strong>備考:</strong> ${item.notes ? item.notes : 'なし'}</p>
        </div>
    `).join('');
};

const loadTournaments = async () => {
    try {
        const response = await fetch(getApiUrl(), {
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`一覧取得に失敗しました: ${response.status}`);
        }

        const data = await response.json();
        renderAdminList(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error(error);
        const container = document.getElementById('admin-tournament-list');
        if (container) {
            container.innerHTML = '<p>大会一覧を取得できませんでした。</p>';
        }
    }
};

const loadApplications = async () => {
    try {
        const response = await fetch(getApplicationsApiUrl(), {
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`申請一覧取得に失敗しました: ${response.status}`);
        }

        const data = await response.json();
        renderApplicationList(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error(error);
        const container = document.getElementById('admin-application-list');
        if (container) {
            container.innerHTML = '<p>申請一覧を取得できませんでした。</p>';
        }
    }
};

const initAdminPage = () => {
    const form = document.getElementById('admin-form');
    if (!form) return;

    loadTournaments();
    loadApplications();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = serializeForm(form);

        if (!payload.title || !payload.description || !payload.start_at || !payload.deadline) {
            showAdminMessage('大会名・概要・開催日時・申請期限は必須です。', true);
            return;
        }

        try {
            const response = await fetch(getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || '保存に失敗しました。');
            }

            showAdminMessage(result.message || '大会を追加しました。');
            form.reset();
            await loadTournaments();
        } catch (error) {
            console.error(error);
            showAdminMessage(error.message || '保存できませんでした。', true);
        }
    });
};

window.addEventListener('DOMContentLoaded', initAdminPage);
