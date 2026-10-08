/* Aira Home — shared chat widget for /home, /airahome, /energia, /garden, /construction.
   Usage: <script src="/assets/aira-home-chat.js" data-dir="energia" data-request="#request" defer></script>
   Chat relays through n8n (aira-airahome-chat → Anthropic). A lead collected in chat goes to
   aira-airahome-leads (Telegram), tagged with the direction. Phones/WhatsApp are fixed below. */
(function(){
  var script = document.currentScript;
  var DIR = (script && script.dataset.dir) || 'home';
  var REQUEST = (script && script.dataset.request) || '#request';
  var CHAT_WEBHOOK = 'https://n8n.aira-ai.net/webhook/aira-airahome-chat';
  var LEADS_WEBHOOK = 'https://n8n.aira-ai.net/webhook/aira-airahome-leads';
  var TEL = '+351308800687';
  var WA = '351936800000';

  var NAMES = {home:'Aira Home', airahome:'Airahome', energia:'Aira Energia', garden:'Aira Garden', construction:'Aira Construction'};

  var L = {
    en:{open:'Open chat — call, WhatsApp or request', close:'Close', online:'online · replies in seconds', call:'Call', wa:'WhatsApp', req:'Leave a request',
        ph:'Type a message…', send:'Send', sendAria:'Send message', err:'Connection error. Please call us: +351 308 800 687.',
        greet:{home:'Hi — which service do you need: an emergency repair, your electricity bill, the garden, or a renovation? Tell me what is going on.',
               airahome:"Hi — what's happened at your place? I'll get the details and have someone call you back.",
               energia:'Hi — want to check your electricity bill or look into solar? Tell me roughly what you pay per month.',
               garden:'Hi — tell me about your garden: roughly how big, and how is it watered today?',
               construction:'Hi — what are you planning to renovate, and where is the property?'}},
    de:{open:'Chat öffnen — Anruf, WhatsApp oder Anfrage', close:'Schließen', online:'online · antwortet sofort', call:'Anrufen', wa:'WhatsApp', req:'Anfrage senden',
        ph:'Nachricht schreiben…', send:'Senden', sendAria:'Nachricht senden', err:'Verbindungsfehler. Bitte rufen Sie uns an: +351 308 800 687.',
        greet:{home:'Hallo — welchen Dienst brauchen Sie: eine Notfallreparatur, Ihre Stromrechnung, den Garten oder eine Renovierung? Erzählen Sie kurz, worum es geht.',
               airahome:'Hallo — was ist bei Ihnen passiert? Ich nehme die Details auf und wir rufen Sie zurück.',
               energia:'Hallo — möchten Sie Ihre Stromrechnung prüfen oder sich über Solar informieren? Wie viel zahlen Sie ungefähr im Monat?',
               garden:'Hallo — erzählen Sie mir von Ihrem Garten: ungefähr wie groß, und wie wird er heute bewässert?',
               construction:'Hallo — was möchten Sie renovieren, und wo liegt die Immobilie?'}},
    fr:{open:'Ouvrir le chat — appel, WhatsApp ou demande', close:'Fermer', online:'en ligne · répond tout de suite', call:'Appeler', wa:'WhatsApp', req:'Faire une demande',
        ph:'Écrivez un message…', send:'Envoyer', sendAria:'Envoyer le message', err:'Erreur de connexion. Appelez-nous : +351 308 800 687.',
        greet:{home:'Bonjour — de quel service avez-vous besoin : une réparation urgente, votre facture d’électricité, le jardin ou une rénovation ? Dites-moi ce qui se passe.',
               airahome:"Bonjour — qu'est-ce qui se passe chez vous ? Je note les détails et nous vous rappelons.",
               energia:'Bonjour — vous voulez vérifier votre facture d’électricité ou étudier le solaire ? Combien payez-vous environ par mois ?',
               garden:'Bonjour — parlez-moi de votre jardin : quelle taille environ, et comment est-il arrosé aujourd’hui ?',
               construction:'Bonjour — que souhaitez-vous rénover, et où se trouve le bien ?'}},
    pt:{open:'Abrir chat — ligar, WhatsApp ou pedido', close:'Fechar', online:'online · responde de imediato', call:'Ligar', wa:'WhatsApp', req:'Deixar pedido',
        ph:'Escreva uma mensagem…', send:'Enviar', sendAria:'Enviar mensagem', err:'Erro de ligação. Ligue-nos: +351 308 800 687.',
        greet:{home:'Olá — de que serviço precisa: uma reparação urgente, a fatura da luz, o jardim ou uma remodelação? Diga-me o que se passa.',
               airahome:'Olá — o que se passou na sua casa? Vou registar os detalhes e ligamos-lhe de volta.',
               energia:'Olá — quer verificar a fatura da luz ou saber mais sobre painéis solares? Quanto paga mais ou menos por mês?',
               garden:'Olá — fale-me do seu jardim: mais ou menos que tamanho, e como é regado hoje?',
               construction:'Olá — o que pretende remodelar e onde fica o imóvel?'}}
  };
  var WA_TEXT = {
    en:'Hi, I came from the ' + NAMES[DIR] + ' page — I need help.',
    de:'Hallo, ich komme von der Seite ' + NAMES[DIR] + ' — ich brauche Hilfe.',
    fr:'Bonjour, je viens de la page ' + NAMES[DIR] + ' — j’ai besoin d’aide.',
    pt:'Olá, vim da página ' + NAMES[DIR] + ' — preciso de ajuda.'
  };

  function lang(){ var l = (document.documentElement.lang || 'en').slice(0,2).toLowerCase(); return L[l] ? l : 'en'; }

  function systemPrompt(){
    var focus = {
      home:'The visitor is on the Aira Home hub page and may need any of the four services — first find out which one.',
      airahome:'The visitor is on the Airahome page (emergency repairs).',
      energia:'The visitor is on the Aira Energia page (electricity bill and solar).',
      garden:'The visitor is on the Aira Garden page (smart irrigation).',
      construction:'The visitor is on the Aira Construction page (renovation).'
    }[DIR];
    return "You are the Aira Home assistant (Aira — AI concierge, Algarve), operated by Horizonte Solene Lda, Algarve, Portugal. "
    + "Aira Home has FOUR services: "
    + "1) Airahome — 24/7 emergency home-repair callout in the Algarve (Luz, Lagos, Portimão, Carvoeiro, Lagoa, Silves, Armação de Pêra, Albufeira, Vilamoura): plumbing, electrical, locks & keys, appliances, air conditioning, furniture, general repairs. Prices: Emergency (2–3 h) €300, Same day €150, Scheduled €50 — each covers the first hour incl. travel and diagnosis, then €35 per additional hour; price confirmed before anyone drives out. "
    + "2) Aira Energia — free electricity bill check, tariff switching, solar panels, licensed electrician, Algarve. "
    + "3) Aira Garden — wireless smart irrigation for properties in the Algarve: consultation and quote. "
    + "4) Aira Construction — renovation and finishing works by our own crew in the Algarve and Lisbon: walls, floors, bathrooms, kitchens, electrics. Quote after a visit. "
    + "Phone (all services): +351 308 800 687. WhatsApp: +351 936 800 000. Email: info@aira-ai.net. "
    + focus + " "
    + "Detect the visitor's language from their first message and reply in it (English, German, French, Portuguese). "
    + "Be direct, calm and brief — 2–4 sentences, no marketing tone. Plain text only: no Markdown, no asterisks, no headings.Do not quote prices for Energia, Garden or Construction — say the team will give a quote. "
    + "Your job: understand the request, then collect the address or area, a phone number, and how urgent it is (Now / Today / This week / Planning). Ask one question at a time. "
    + "Once you have the request, the address/area, the phone and the urgency, tell the visitor the team will call back shortly, and on that same reply append on its own line exactly this machine-readable tag (hidden from the visitor): "
    + "<<LEAD>>{\"name\":\"(their name if given, else empty string)\",\"service\":\"Airahome|Energia|Garden|Construction\",\"problem\":\"...\",\"address\":\"...\",\"phone\":\"...\",\"urgency\":\"Now|Today|This week|Planning\",\"language\":\"en|de|fr|pt\"}<<END>> "
    + "Only emit the tag once, when you actually have all of them. Never invent details the visitor didn't give you.";
  }

  var history = [], busy = false, opened = false, leadSent = false;
  var btn, panel, msgs, input, send;

  function el(tag, attrs, html){
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html) e.innerHTML = html;
    return e;
  }

  function build(){
    btn = el('button', {type:'button', class:'ahw-btn', 'aria-expanded':'false', 'aria-controls':'ahw-panel'},
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.4.96 4.58 2.53 6.2L3 21l4.2-1.35A10.1 10.1 0 0 0 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9z" fill="#fff"/><circle cx="8.5" cy="11" r="1.2" fill="#14181c"/><circle cx="12" cy="11" r="1.2" fill="#14181c"/><circle cx="15.5" cy="11" r="1.2" fill="#14181c"/></svg>');
    panel = el('div', {id:'ahw-panel', class:'ahw-panel', role:'dialog', 'aria-label':NAMES[DIR]});
    panel.innerHTML =
      '<div class="ahw-head"><div class="ahw-avatar" aria-hidden="true">A</div><div class="ahw-info"><div class="ahw-name">' + NAMES[DIR] + '</div>'
      + '<div class="ahw-status"><span class="ahw-dot"></span><span data-ahw="online"></span></div></div>'
      + '<button type="button" class="ahw-close" data-ahw="close"></button></div>'
      + '<div class="ahw-actions">'
      + '<a class="ahw-act primary" href="tel:' + TEL + '" data-ahw="call"></a>'
      + '<a class="ahw-act" data-ahw-wa target="_blank" rel="noopener" data-ahw="wa"></a>'
      + '<a class="ahw-act" href="' + REQUEST + '" data-ahw="req"></a>'
      + '</div>'
      + '<div class="ahw-msgs" aria-live="polite"></div>'
      + '<form class="ahw-bar"><input class="ahw-input" type="text" autocomplete="off"><button type="submit" class="ahw-send" data-ahw="send"></button></form>';
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    msgs = panel.querySelector('.ahw-msgs');
    input = panel.querySelector('.ahw-input');
    send = panel.querySelector('.ahw-send');

    btn.addEventListener('click', toggle);
    panel.querySelector('.ahw-close').addEventListener('click', toggle);
    panel.querySelector('[data-ahw="req"]').addEventListener('click', function(){ if (REQUEST.charAt(0) === '#') toggle(); });
    panel.querySelector('form').addEventListener('submit', function(e){ e.preventDefault(); sendMsg(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && panel.classList.contains('open')) toggle(); });
    relabel();
    new MutationObserver(relabel).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  }

  function relabel(){
    var l = lang(), t = L[l];
    btn.setAttribute('aria-label', t.open);
    btn.title = t.open;
    panel.querySelector('[data-ahw="online"]').textContent = t.online;
    var c = panel.querySelector('[data-ahw="close"]'); c.textContent = '✕'; c.setAttribute('aria-label', t.close);
    panel.querySelector('[data-ahw="call"]').textContent = '📞 ' + t.call;
    var wa = panel.querySelector('[data-ahw="wa"]'); wa.textContent = '💬 ' + t.wa;
    wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(WA_TEXT[l]);
    panel.querySelector('[data-ahw="req"]').textContent = '📝 ' + t.req;
    input.placeholder = t.ph; input.setAttribute('aria-label', t.ph);
    send.textContent = t.send; send.setAttribute('aria-label', t.sendAria);
  }

  function addMsg(role, text){
    var d = el('div', {class:'ahw-msg ' + role}); d.textContent = text;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }
  function typing(on){
    var e = msgs.querySelector('.ahw-typing');
    if (on && !e){ e = el('div', {class:'ahw-typing'}, '<span></span><span></span><span></span>'); msgs.appendChild(e); msgs.scrollTop = msgs.scrollHeight; }
    if (!on && e) e.remove();
  }

  function toggle(){
    var open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (open){
      if (!opened){ opened = true; addMsg('bot', L[lang()].greet[DIR]); }
      setTimeout(function(){ input.focus(); }, 100);
    }
  }

  function extractLead(text){
    var m = text.match(/<<LEAD>>([\s\S]*?)<<END>>/);
    if (!m) return {clean:text, lead:null};
    var lead = null;
    try { lead = JSON.parse(m[1]); } catch (e) { lead = null; }
    return {clean:text.replace(m[0], '').trim(), lead:lead};
  }

  function sendLead(lead){
    if (leadSent) return;
    leadSent = true;
    var service = lead.service || NAMES[DIR];
    fetch(LEADS_WEBHOOK, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name: lead.name || '', phone: lead.phone || '', address: lead.address || '',
        problem: '[' + service + '] ' + (lead.problem || ''),
        urgency: lead.urgency || '', language: lead.language || lang(),
        page: DIR, service: service, source: 'chat'
      })
    }).catch(function(){});
  }

  function sendMsg(){
    if (busy) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg('user', text);
    history.push({role:'user', content:text});
    busy = true; send.disabled = true; typing(true);
    fetch(CHAT_WEBHOOK, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({system: systemPrompt(), messages: history.slice(-12)})
    }).then(function(r){ return r.json(); }).then(function(data){
      typing(false);
      var raw = (data && data.content && data.content[0] && data.content[0].text) || L[lang()].err;
      var x = extractLead(raw);
      addMsg('bot', x.clean.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, ''));
      history.push({role:'assistant', content:raw});
      if (x.lead && x.lead.phone) sendLead(x.lead);
    }).catch(function(){
      typing(false);
      addMsg('bot', L[lang()].err);
    }).then(function(){ busy = false; send.disabled = false; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
