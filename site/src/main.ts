const toggle = document.querySelector<HTMLInputElement>('#demo-toggle');
const dashboard = document.querySelector<HTMLElement>('.dashboard');

toggle?.addEventListener('change', () => {
  dashboard?.classList.toggle('labels-off', !toggle.checked);
});

const offlineNote = document.querySelector<HTMLElement>('#offline-note');
const updateNetworkState = () => { if (offlineNote) offlineNote.hidden = navigator.onLine; };
addEventListener('online', updateNetworkState);
addEventListener('offline', updateNetworkState);
updateNetworkState();

if ('serviceWorker' in navigator) {
  addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
}
