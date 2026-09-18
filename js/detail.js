const detailGetDataUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes('/pages/');
    return isInPagesFolder ? '../data/tournaments.json' : './data/tournaments.json';
};

const detailEscapeHtml = (value) => {
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

const detailFormatDate = (dateString) => {
    if (!dateString) return '未定';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const renderDetail = (tournament) => {
    const container = document.getElementById('tournament-detail');
    if (!container) {
        return;
    }

    if (!tournament) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>大会が見つかりませんでした</h2>
                <p>指定された大会は存在しないか、削除された可能性があります。</p>
                <a class="primary-button" href="../index.html">一覧へ戻る</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <article class="detail-hero">
            <div class="detail-hero__image">
                <img src="${detailEscapeHtml(tournament.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80')}" alt="${detailEscapeHtml(tournament.title)}">
            </div>
            <div class="detail-hero__content">
                <span class="badge">${detailEscapeHtml(tournament.status || '未設定')}</span>
                <h2>${detailEscapeHtml(tournament.title)}</h2>
                <p class="detail-description">${detailEscapeHtml(tournament.description || '詳細はまだ登録されていません。')}</p>
                <div class="card-actions">
                    <a class="primary-button" href="./apply.html?id=${encodeURIComponent(tournament.id)}">この大会に参加申請</a>
                    <button type="button" class="secondary-button special-navigation" data-normal-url="../index.html" data-admin-url="./admin.html">一覧へ戻る</button>
                </div>

                <div class="detail-grid">
                    <div class="info-card">
                        <h3>開催日時</h3>
                        <p>${detailEscapeHtml(detailFormatDate(tournament.startAt))}</p>
                    </div>
                    <div class="info-card">
                        <h3>申請期限</h3>
                        <p>${detailEscapeHtml(detailFormatDate(tournament.deadline))}</p>
                    </div>
                    <div class="info-card">
                        <h3>開催場所</h3>
                        <p>${detailEscapeHtml(tournament.venue || '未定')}</p>
                    </div>
                    <div class="info-card">
                        <h3>参加費</h3>
                        <p>${detailEscapeHtml(tournament.entryFee || '未定')}</p>
                    </div>
                    <div class="info-card">
                        <h3>定員</h3>
                        <p>${detailEscapeHtml(tournament.capacity ? `${tournament.capacity}名` : '未定')}</p>
                    </div>
                    <div class="info-card">
                        <h3>主催</h3>
                        <p>${detailEscapeHtml(tournament.organizer || '運営チーム')}</p>
                    </div>
                    <div class="info-card">
                        <h3>ルール</h3>
                        <p>${detailEscapeHtml(tournament.rules || 'ルール詳細は未定です。')}</p>
                    </div>
                </div>
            </div>
        </article>
    `;
};

const initTournamentDetail = async () => {
    const params = new URLSearchParams(window.location.search);
    const tournamentId = params.get('id');

    try {
        const response = await fetch(detailGetDataUrl(), {
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`データ取得に失敗しました: ${response.status}`);
        }

        const tournaments = await response.json();
        const tournament = tournaments.find((item) => item.id === tournamentId) || null;
        renderDetail(tournament);
    } catch (error) {
        console.error(error);
        renderDetail(null);
    }
};

window.addEventListener('DOMContentLoaded', initTournamentDetail);
