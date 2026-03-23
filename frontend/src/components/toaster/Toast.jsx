const ICONS = { success: '✓', error: '✕', warning: '!', info: 'i' };
const DURATION = 3000;

function injectStyles() {
  if (document.getElementById('toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    #toast-container { position: fixed; bottom: 24px; right: 14px; display: flex;
      flex-direction: column-reverse; gap: 8px; z-index: 9999; }
    .toast { display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      border-radius: 10px; background: #1f2937 ; border: 0.5px solid rgba(255,255,255,0.08);
      min-width: 220px; max-width: 320px; animation: toastIn 0.22s ease; position: relative;
      overflow: hidden; padding-top: 14px; padding-right: 28px; }
    .toast.removing { animation: toastOut 0.2s ease forwards; }
    @keyframes toastIn  { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes toastOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(60px); opacity: 0; } }
    .toast-icon { width: 18px; height: 18px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 500; }
    .toast-text { flex: 1; }
    .toast-title { font-size: 13px; font-weight: 500; color: #f9fafb; line-height: 1.3; }
    .toast-desc  { font-size: 11px; color: #9ca3af; margin-top: 1px; line-height: 1.3; }
    .toast-close { position: absolute; top: 6px; right: 7px; background: none; border: none;
      cursor: pointer; color: #e5e7eb; font-size: 9px; line-height: 1; padding: 0; }
    .toast-close:hover { background: none; }
    .toast.success .toast-icon { background: #052e16; color: #4ade80; }
    .toast.error   .toast-icon { background: #2d0a0a; color: #f87171; }
    .toast.warning .toast-icon { background: #2d1e04; color: #fbbf24; }
    .toast.info    .toast-icon { background: #0a1e36; color: #60a5fa; }
    .toast.loading .toast-icon { background: #1f2937; color: #9ca3af; }
    .spinner { width: 14px; height: 14px; border: 2px solid #374151;
      border-top-color: #9ca3af; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

function getContainer() {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  return c;
}

function createToast(type, title, desc, duration) {
  injectStyles();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <div class="toast-icon">${type === 'loading' ? '<div class="spinner"></div>' : ICONS[type]}</div>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
    </div>
    <button class="toast-close">✕</button>
  `;
  const dismiss = () => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };
  el.querySelector('.toast-close').addEventListener('click', dismiss);
  if (duration) setTimeout(dismiss, duration);
  getContainer().appendChild(el);
  return { el, dismiss };
}

const toast = {
  success: (title, desc = '') => createToast('success', title, desc, DURATION),
  error:   (title, desc = '') => createToast('error',   title, desc, DURATION),
  warning: (title, desc = '') => createToast('warning', title, desc, DURATION),
  info:    (title, desc = '') => createToast('info',    title, desc, DURATION),
  loading: (title, desc = '') => createToast('loading', title, desc, null),
  promise: async (promise, { loading, success, error }) => {
    const t = createToast('loading', loading, '', null);
    try   { await promise; t.dismiss(); setTimeout(() => createToast('success', success, '', DURATION), 2000); }
    catch { t.dismiss();   setTimeout(() => createToast('error',   error,   '', DURATION), 2000); }
  },
};

export default toast;