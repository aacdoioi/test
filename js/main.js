const getDataUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes('/pages/');
    return isInPagesFolder ? '../data/tournaments.json' : './data/tournaments.json';
};

const formatDate = (dateString) => {
    if (!dateString) return '未定';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return new Intl.DateTimeFormat('ja-JP', options).format(date);
};

const escapeHtml = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const renderTournamentList = (tournaments) => {
    const container = document.getElementById('tournament-list');
    if (!container) {
        return;
    }

    if (!Array.isArray(tournaments) || tournaments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>大会情報はまだありません</h2>
                <p>現在、表示できる大会が登録されていません。</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tournaments.map((tournament) => `
        <article class="tournament-card">
            <div class="tournament-card__image">
                <img src="${escapeHtml(tournament.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80')}" alt="${escapeHtml(tournament.title)}" loading="lazy">
            </div>
            <div class="tournament-card__content">
                <span class="badge">${escapeHtml(tournament.status || '未設定')}</span>
                <h3>${escapeHtml(tournament.title)}</h3>
                <div class="meta-list">
                    <div class="meta-item"><strong>開催</strong><span>${escapeHtml(formatDate(tournament.startAt))}</span></div>
                    <div class="meta-item"><strong>締切</strong><span>${escapeHtml(formatDate(tournament.deadline))}</span></div>
                    <div class="meta-item"><strong>場所</strong><span>${escapeHtml(tournament.venue || '未定')}</span></div>
                </div>
                <p>${escapeHtml(tournament.description || '大会概要はまだ登録されていません。')}</p>
                <div class="card-actions">
                    <a class="link-button" href="./pages/detail.html?id=${encodeURIComponent(tournament.id)}">詳細を見る</a>
                    <a class="secondary-button" href="./pages/apply.html?id=${encodeURIComponent(tournament.id)}">参加申請</a>
                </div>
            </div>
        </article>
    `).join('');
};

const initTournamentList = async () => {
    try {
        const response = await fetch(getDataUrl(), {
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`データ取得に失敗しました: ${response.status}`);
        }

        const tournaments = await response.json();
        renderTournamentList(tournaments);
    } catch (error) {
        console.error(error);
        const container = document.getElementById('tournament-list');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h2>大会情報の読み込みに失敗しました</h2>
                    <p>時間を空けて再度確認してください。</p>
                </div>
            `;
        }
    }
};

window.addEventListener('DOMContentLoaded', initTournamentList);
