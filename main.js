const MAX_HISTORY = 10;
let history = JSON.parse(localStorage.getItem('lotto-history') || '[]');
let selectedCount = 1;

function getBallRange(number) {
    if (number <= 10) return '1';
    if (number <= 20) return '2';
    if (number <= 30) return '3';
    if (number <= 40) return '4';
    return '5';
}

function generateNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

function createBall(number) {
    const el = document.createElement('div');
    el.className = 'ball';
    el.setAttribute('data-range', getBallRange(number));
    el.textContent = number;
    return el;
}

function renderResults(gamesSets) {
    const area = document.getElementById('results-area');
    area.innerHTML = '';

    gamesSets.forEach((numbers, gameIndex) => {
        const gameSet = document.createElement('div');
        gameSet.className = 'game-set';
        gameSet.style.animationDelay = `${gameIndex * 0.1}s`;

        if (gamesSets.length > 1) {
            const label = document.createElement('div');
            label.className = 'game-label';
            label.textContent = `${String.fromCharCode(65 + gameIndex)}조`;
            gameSet.appendChild(label);
        }

        const row = document.createElement('div');
        row.className = 'balls-row';

        numbers.forEach((num, i) => {
            const ball = createBall(num);
            row.appendChild(ball);
            setTimeout(() => ball.classList.add('show'), gameIndex * 300 + i * 130 + 100);
        });

        gameSet.appendChild(row);
        area.appendChild(gameSet);
    });
}

function saveToHistory(gamesSets) {
    const entry = {
        time: new Date().toLocaleString('ko-KR', {
            month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }),
        games: gamesSets
    };
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem('lotto-history', JSON.stringify(history));
}

function renderHistory() {
    const list = document.getElementById('history-list');

    if (history.length === 0) {
        list.innerHTML = '<p class="empty-history">아직 추첨 기록이 없습니다</p>';
        return;
    }

    list.innerHTML = '';
    history.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const meta = document.createElement('div');
        meta.className = 'history-meta';
        meta.textContent = entry.time;
        item.appendChild(meta);

        entry.games.forEach(numbers => {
            const row = document.createElement('div');
            row.className = 'history-balls';
            numbers.forEach(num => row.appendChild(createBall(num)));
            item.appendChild(row);
        });

        list.appendChild(item);
    });
}

function draw() {
    const btn = document.getElementById('draw-button');
    btn.classList.add('loading');
    btn.disabled = true;

    const gamesSets = Array.from({ length: selectedCount }, generateNumbers);

    renderResults(gamesSets);
    saveToHistory(gamesSets);
    renderHistory();

    const totalDuration = selectedCount * 300 + 6 * 130 + 300;
    setTimeout(() => {
        btn.classList.remove('loading');
        btn.disabled = false;
    }, totalDuration);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';

    // Disqus 색상 테마 갱신
    if (typeof DISQUS !== 'undefined') {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.url = window.location.href;
                this.page.identifier = 'lotto-main';
                this.page.colorScheme = theme;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('lotto-theme') || 'light';
    applyTheme(savedTheme);

    // 다크/라이트 모드 토글
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('lotto-theme', next);
    });

    // 게임 수 선택
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCount = parseInt(btn.dataset.count);
        });
    });

    // 추첨 버튼
    document.getElementById('draw-button').addEventListener('click', draw);

    // 기록 지우기
    document.getElementById('clear-history').addEventListener('click', () => {
        history = [];
        localStorage.removeItem('lotto-history');
        renderHistory();
    });

    // 저장된 기록 불러오기
    renderHistory();
});
