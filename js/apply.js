const getTournamentIdFromUrl = () => new URLSearchParams(window.location.search).get('id');

const getApplicationApiUrl = () => {
    const { pathname } = window.location;
    const isInPagesFolder = pathname.includes('/pages/');
    return isInPagesFolder ? '../api/applications' : './api/applications';
};

const showMessage = (message, isError = false) => {
    const element = document.getElementById('form-message');
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? '#b42318' : '#1d9d6c';
};

const setSelectedTournament = () => {
    const selectedTournament = document.getElementById('selected-tournament');
    if (!selectedTournament) return;

    const tournamentId = getTournamentIdFromUrl();
    if (!tournamentId) {
        selectedTournament.textContent = '大会IDが指定されていません。一覧から選択してください。';
        return;
    }

    selectedTournament.textContent = `対象大会ID: ${tournamentId}`;
};

const validateField = (value, fieldName) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
        return `${fieldName}は必須です。`;
    }

    if (fieldName === 'Discord ID' && trimmed.length < 3) {
        return 'Discord IDは3文字以上で入力してください。';
    }

    return '';
};

const redirectToDetailPage = (tournamentId) => {
    if (!tournamentId) return;

    const detailUrl = `./detail.html?id=${encodeURIComponent(tournamentId)}`;
    window.location.assign(detailUrl);
};

const initApplicationForm = () => {
    const form = document.getElementById('application-form');
    if (!form) {
        return;
    }

    setSelectedTournament();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const tournamentId = getTournamentIdFromUrl();
        const playerName = form.querySelector('#player-name').value;
        const discordId = form.querySelector('#discord-id').value;
        const gameUid = form.querySelector('#game-uid').value;

        const errors = [
            validateField(playerName, '現在のゲーム名'),
            validateField(discordId, 'Discord ID'),
            validateField(gameUid, 'ゲームUID')
        ].filter(Boolean);

        if (errors.length > 0) {
            showMessage(errors[0], true);
            return;
        }

        if (!tournamentId) {
            showMessage('大会IDが指定されていません。一覧から選択してください。', true);
            return;
        }

        const button = form.querySelector('#submit-button');
        button.disabled = true;
        button.textContent = '送信中...';

        try {
            const response = await fetch(getApplicationApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
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
                throw new Error(result.error || '申請の保存に失敗しました。');
            }

            redirectToDetailPage(tournamentId);
        } catch (error) {
            console.error(error);
            button.disabled = false;
            button.textContent = '申請する';
            showMessage(error.message || '申請の保存に失敗しました。', true);
        }
    });
};

window.addEventListener('DOMContentLoaded', initApplicationForm);
