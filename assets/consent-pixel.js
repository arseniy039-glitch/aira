/* Meta Pixel — GDPR consent gate. Loaded on every public page via <script> before </body>. */
(function(){
  var PIXEL_ID = '1631609014744767';
  var KEY = 'aira-pixel-consent';
  var PRIVACY_URL = '/home/privacy.html';

  var MSGS = {
    pt: {text:'Usamos cookies de análise para melhorar o site.', privacy:'Política de privacidade', accept:'Aceitar', decline:'Recusar'},
    en: {text:'We use analytics cookies to improve our site.',   privacy:'Privacy policy',           accept:'Accept',   decline:'Decline'},
    de: {text:'Wir verwenden Analyse-Cookies zur Verbesserung unserer Website.', privacy:'Datenschutzerklärung', accept:'Akzeptieren', decline:'Ablehnen'},
    fr: {text:'Nous utilisons des cookies analytiques pour améliorer notre site.', privacy:'Politique de confidentialité', accept:'Accepter', decline:'Refuser'}
  };

  function getLang(){
    var raw = (window.currentLang || document.documentElement.lang || navigator.language || 'en').slice(0,2).toLowerCase();
    return MSGS[raw] ? raw : 'en';
  }

  function getConsent(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function saveConsent(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }

  function loadPixel(){
    if(window.fbq) return;
    /* ponytail: standard Meta Pixel snippet — do not simplify, format mandated by Meta */
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');

    // Contact: tel/WhatsApp link clicks
    document.addEventListener('click', function(ev){
      var a = ev.target.closest ? ev.target.closest('a') : null;
      if(!a || !a.href) return;
      if(a.href.indexOf('tel:') === 0 || a.href.indexOf('wa.me') !== -1) fbq('track','Contact');
    }, true);

    // Lead: form submission success (#formStatus gains class 'ok')
    var fs = document.getElementById('formStatus');
    if(fs) new MutationObserver(function(muts){
      muts.forEach(function(m){ if(m.attributeName==='class' && fs.classList.contains('ok')) fbq('track','Lead'); });
    }).observe(fs, {attributes:true});
  }

  function showBanner(){
    var m = MSGS[getLang()];
    var d = document.createElement('div');
    d.id = 'aira-cb';
    d.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e5e7eb;padding:12px 16px;display:flex;align-items:center;gap:10px;z-index:9999;flex-wrap:wrap;font-family:system-ui,sans-serif;font-size:13px;line-height:1.4;box-shadow:0 -2px 8px rgba(0,0,0,.07);';
    d.innerHTML = '<span style="flex:1;min-width:180px;">' + m.text +
      ' <a href="' + PRIVACY_URL + '" style="color:inherit;text-decoration:underline;white-space:nowrap;">' + m.privacy + '</a></span>' +
      '<button id="aira-cb-ok" style="background:#111;color:#fff;border:none;border-radius:5px;padding:7px 16px;cursor:pointer;font-size:13px;white-space:nowrap;">' + m.accept + '</button>' +
      '<button id="aira-cb-no" style="background:none;border:1px solid #d1d5db;border-radius:5px;padding:7px 16px;cursor:pointer;font-size:13px;white-space:nowrap;">' + m.decline + '</button>';
    document.body.appendChild(d);
    document.getElementById('aira-cb-ok').onclick = function(){ saveConsent('accepted'); d.remove(); loadPixel(); };
    document.getElementById('aira-cb-no').onclick = function(){ saveConsent('declined'); d.remove(); };
  }

  function init(){
    var c = getConsent();
    if(c === 'accepted') loadPixel();
    else if(!c) showBanner();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
