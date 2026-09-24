// Bottom navigation for all /dashboard/* pages (no globals besides NAV/renderNav).
const NAV = [
  ['/dashboard', 'Сводка', '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'],
  ['/dashboard/leads', 'Лиды', '<path d="M4 4h16v12H7l-3 3z"/>'],
  ['/dashboard/tasks', 'Задачи', '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11"/>'],
  ['/dashboard/competitors', 'Конкуренты', '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.2.9-4 3.5-4S22 18 22 20"/>'],
  ['/dashboard/tech', 'Тех', '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>'],
];
function renderNav(){
  const path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/dashboard';
  const nav = document.createElement('nav');
  nav.className = 'bnav'; nav.setAttribute('aria-label', 'Разделы');
  nav.innerHTML = NAV.map(([href, label, icon]) =>
    `<a href="${href}"${path === href ? ' aria-current="page"' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>${label}</a>`).join('');
  document.body.appendChild(nav);
}
document.addEventListener('DOMContentLoaded', renderNav);
