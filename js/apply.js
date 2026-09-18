const getTournamentIdFromUrl = () => new URLSearchParams(window.location.search).get('id');

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

const initApplicationForm = () => {
    const form = document.getElementById('application-form');
    if (!form) {
        return;
    }

    setSelectedTournament();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

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

        const button = form.querySelector('#submit-button');
        button.disabled = true;
        button.textContent = '送信中...';

        showMessage('申請内容を受け付けました。管理者確認後に連絡します。');
    });
};

window.addEventListener('DOMContentLoaded', initApplicationForm);
