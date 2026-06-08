const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const loadingView = document.getElementById('loading-view');
const enterView = document.getElementById('enter-view');

const ESTIMATED_MS = 17000;
const CEILING = 96;

let startTime = Date.now();
let shown = 0;
let finishing = false;

const STATUSES = [
    'ИНИЦИАЛИЗАЦИЯ',
    'ЗАГРУЗКА РЕСУРСОВ',
    'ПОДГОТОВКА МИРА',
    'ПОЧТИ ГОТОВО',
    'ВХОД ГОТОВ'
];

let lastStatus = 0;

const setStatus = (i) => {
    if (i < lastStatus) return;
    lastStatus = i;
    if (STATUSES[i]) statusText.innerText = STATUSES[i];
};

const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);

const tick = () => {
    if (!finishing) {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / ESTIMATED_MS, 1);
        const goal = easeOut(t) * CEILING;
        if (goal > shown) shown = goal;
        if (shown >= 80 && lastStatus < 3) setStatus(3);
    } else {
        if (shown < 100) {
            shown += (100 - shown) * 0.08 + 0.4;
            if (shown > 100) shown = 100;
        }
    }

    progressBar.style.width = shown + '%';

    if (finishing && shown >= 99.5) {
        setTimeout(() => {
            loadingView.classList.add('hidden');
            enterView.classList.remove('hidden');
        }, 350);
        return;
    }
    requestAnimationFrame(tick);
};
requestAnimationFrame(tick);

const handlers = {
    startInitFunctionOrder() { setStatus(1); },
    initFunctionInvoking() {},
    initFunctionInvoked() {},
    performMapLoadFunction() { setStatus(2); },
    onLogLine() {},
    showEnterScreen() {
        setStatus(4);
        finishing = true;
    }
};

window.addEventListener('message', (e) => {
    const data = e.data || {};
    const name = data.eventName || data.action;
    (handlers[name] || function() {})(data);
});
