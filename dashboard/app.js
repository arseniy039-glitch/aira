// Shared helpers for /dashboard/* pages: DOM/format utils, safe localStorage, data endpoints,
// bottom sheet and bottom navigation. Load before the page script.
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ago(iso){if(!iso)return'';const m=(Date.now()-new Date(iso))/6e4;if(m<60)return Math.max(1,Math.round(m))+' мин назад';const h=m/60;if(h<24)return Math.round(h)+' ч назад';return Math.round(h/24)+' дн назад'}
function fmtDate(d){if(!d)return'—';const [y,m,dd]=String(d).slice(0,10).split('-');return dd+'.'+m+'.'+y}
function hoursSince(iso){return iso?(Date.now()-new Date(iso))/36e5:Infinity}
function todayIso(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)}

// localStorage can throw (private mode, blocked storage) — always go through here.
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} },
};

const API = {
  // Pages Function proxy (Basic Auth + X-Aira-Key from env) -> Scout + Fixando.
  leadsProxy: '/dashboard/api/leads',
  // Public webhook: Fixando only. Used when the proxy is unavailable (e.g. static preview).
  leadsPublic: 'https://n8n.aira-ai.net/webhook/lisbon-leads-data',
  leadStatus: '/dashboard/api/lead-status',
  dashboard: 'https://n8n.aira-ai.net/webhook/dashboard-data',
  board: 'https://n8n.aira-ai.net/webhook/board-data',
  config: '/config.json',
};

async function getJSON(url, opt){
  const r = await fetch(url, opt);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
async function getLeads(query){
  const q = String(query || '');
  try { return await getJSON(API.leadsProxy + '?' + q); }
  catch (e) { return getJSON(API.leadsPublic + '?' + q); }
}
let _sources = null;
async function getSources(){
  if (_sources) return _sources;
  try { _sources = await getJSON('/dashboard/sources.json'); }
  catch (e) { _sources = [{id:'scout',name:'Scout · FB-группы',color:'#2f7d4f',trusted:true},{id:'fixando',name:'Fixando · не проверен',color:'#a07c00',trusted:false}]; }
  return _sources;
}
function srcBadge(sources, id){
  const s = sources.find(x => x.id === id) || {name: id, color: '', trusted: false};
  return `<span class="src${s.trusted?'':' untrusted'}" style="--src:${esc(s.color)}">${esc(s.name)}</span>`;
}

// Bottom sheet: markup is injected once; open(title, html) / close(). Back button and Esc close it.
const Sheet = (() => {
  let wrap, onClose = null;
  function ensure(){
    if (wrap) return;
    wrap = document.createElement('div');
    wrap.innerHTML = `<div class="scrim" id="scrim"></div>
      <aside class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="shTitle">
      <div class="grab"></div><div class="sh-head"><h2 id="shTitle"></h2><button class="x" id="shClose" aria-label="Закрыть">×</button></div>
      <div class="sh-body" id="shBody"></div></aside>`;
    document.body.appendChild(wrap);
    $('scrim').onclick = () => close();
    $('shClose').onclick = () => close();
    let y0 = null;
    $('sheet').addEventListener('touchstart', e => { if ($('shBody').scrollTop <= 0) y0 = e.touches[0].clientY; }, {passive:true});
    $('sheet').addEventListener('touchend', e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) close(); y0 = null; });
    window.addEventListener('popstate', () => { if (isOpen()) close(true); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
  }
  const isOpen = () => document.body.classList.contains('open');
  function open(title, html, hash, closeCb){
    ensure();
    $('shTitle').textContent = title;
    $('shBody').innerHTML = html;
    $('shBody').scrollTop = 0;
    onClose = closeCb || null;
    document.body.classList.add('open');
    if (hash && location.hash !== '#' + hash) history.pushState({sheet: hash}, '', '#' + hash);
    return $('shBody');
  }
  function close(fromPop){
    if (!isOpen()) return;
    document.body.classList.remove('open');
    if (!fromPop && location.hash) history.back();
    if (onClose) onClose();
  }
  return {open, close, isOpen, body: () => $('shBody')};
})();

// Two-step confirm on a button: first tap arms it, second tap within 4 s runs fn.
function confirmTap(btn, label, fn){
  if (btn.dataset.armed === '1') { btn.dataset.armed = ''; clearTimeout(btn._t); return fn(); }
  const orig = btn.textContent, cls = btn.className;
  btn.dataset.armed = '1'; btn.textContent = label; btn.className = cls + ' arm';
  btn._t = setTimeout(() => { btn.dataset.armed = ''; btn.textContent = orig; btn.className = cls; }, 4000);
}

async function copyText(text, btn){
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (e2) {} t.remove();
  }
  if (btn) { const o = btn.textContent; btn.textContent = 'Скопировано'; setTimeout(() => btn.textContent = o, 1500); }
}
