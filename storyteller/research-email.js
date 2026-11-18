// MurrValley copy (2026-11-18) of maringolf.org's research-email.js, for /sources/ and /research-guide/ on tennis, 2am and
// baseball.murrvalley.com. The page sets window.MV_SITE = {base, topic, domain}; nothing else is site-specific.
// Builds copy-ready request emails from fixed templates (the researcher's own name; exact titles and call numbers) and
// shows a small dialog: the email, or "How to request" (the institution's own method, verified on its site).
// Never invents an address: a mailto link appears only for an email verified on the institution's own website.
(function (root) {
  'use strict';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safe = (u) => (/^https?:\/\//i.test(u || '') ? u : '');
  const UNVER = /^\s*(check with the library|contact the library to arrange access)/i;
  const verified = (s) => !!s && !UNVER.test(s);
  const MV = root.MV_SITE || {};
  const GUIDE = (MV.base || '') + '/research-guide/';
  const TOPIC = MV.topic || 'the history of Mill Valley, California';
  const DOMAIN = MV.domain || 'murrvalley.com';

  function itemLines(items) {
    return items.map((it) => {
      let l = `- ${it.title}`;
      if (it.call) l += `\n  Call number / catalog no.: ${it.call}`;
      if (it.url) l += `\n  Catalog record: ${it.url}`;
      return l;
    }).join('\n');
  }
  // items: [{title, call, url, holder}]; repo: a repository record (or null when no guide exists)
  function email(items, repo) {
    const one = items.length === 1;
    const place = repo ? repo.name : (items[0].holder ? items[0].holder.replace(/\*/g, '').split(/;/)[0].trim() : 'your library (an interlibrary loan request)');
    const short = items[0].title.replace(/^["“*]+|["”*]+$/g, '').slice(0, 70);
    const subject = `Research request: ${one ? short : `${items.length} items for a Mill Valley history`}${one && items[0].call ? ` (${items[0].call.slice(0, 40)})` : ''}`;
    const recorder = repo && repo.slug === 'marin-county-recorder';
    const body = `Hello,

I am researching ${TOPIC} ([Your affiliation/purpose]). The research guide at ${DOMAIN}, a free local-history site, located ${one ? 'the following item' : 'the following items'} at ${place}:

${itemLines(items)}

${recorder
    ? `Could you tell me how to obtain ${one ? 'a copy of this record' : 'copies of these records'}: whether I should search the index in person or send a mail request, and the fees?`
    : `Could you tell me:
1. Whether ${one ? 'it is' : 'they are'} available to consult, and how much notice you need (for example, if ${one ? 'it is' : 'any are'} stored off-site);
2. How to arrange a visit, or whether scans or copies can be ordered, and the fees;
3. Your process for permission to quote or reproduce ${one ? 'it' : 'them'}, should I need it later.`}

Thank you very much,
[Your name]
[Your affiliation/purpose]
[Your email/phone]
`;
    const to = repo && repo.email ? repo.email : '';
    const via = repo ? (safe(repo.request_url) || safe(repo.contact_url) || safe(repo.website)) : (safe(items[0].url) || '');
    return { subject, body, to, via };
  }
  function emailText(e) {
    return `${e.to ? `To: ${e.to}\n` : ''}Subject: ${e.subject}\n\n${e.body}`;
  }

  // ---------- the dialog (one per page, created on first use)
  let dlg = null, lastFocus = null;
  function ensure() {
    if (dlg) return dlg;
    const css = document.createElement('style');
    css.textContent = `.mgr-dlg{border:1px solid var(--rule,rgba(34,30,25,.14));border-radius:12px;padding:0;max-width:640px;width:calc(100% - 32px);background:var(--paper,#f4eee2);color:var(--ink,#221e19);box-shadow:0 10px 40px -10px rgba(0,0,0,.45)}
.mgr-dlg::backdrop{background:rgba(20,18,16,.45)}.mgr-in{padding:16px 18px 18px;max-height:85vh;overflow:auto}
.mgr-hd{display:flex;justify-content:space-between;align-items:start;gap:12px}.mgr-hd h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;font-size:26px;line-height:1.15;margin:0 0 6px}
.mgr-x{background:none;border:0;font-size:26px;line-height:1;cursor:pointer;color:inherit;padding:2px 6px}
.mgr-dlg p{margin:0 0 10px;font-size:16px;line-height:1.5}.mgr-dlg .mgr-fine{font-size:14px;color:var(--ink-3,#7a7063)}
.mgr-dlg textarea{width:100%;min-height:260px;font:14px/1.45 ui-monospace,Menlo,Consolas,monospace;padding:10px;border-radius:8px;border:1px solid var(--rule,rgba(34,30,25,.14));background:var(--mount,#fbf8f1);color:inherit}
.mgr-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:16px}
.mgr-row button{font:inherit;font-size:15px;padding:6px 12px;border-radius:8px;border:1px solid var(--gold,#a8814a);background:var(--gold,#a8814a);color:var(--paper,#fff);cursor:pointer}
.mgr-dlg a{color:inherit;text-decoration-color:var(--gold,#a8814a);text-underline-offset:3px}.mgr-dl{margin:0 0 10px;font-size:15px}.mgr-dl dt{font-weight:600;margin-top:6px}.mgr-dl dd{margin:0}
@media (max-width:480px){.mgr-in{padding:14px}.mgr-dlg textarea{min-height:300px}}`;
    document.head.appendChild(css);
    dlg = document.createElement('dialog');
    dlg.className = 'mgr-dlg';
    dlg.setAttribute('aria-labelledby', 'mgr-h');
    dlg.innerHTML = '<div class="mgr-in"><div class="mgr-hd"><h2 id="mgr-h"></h2><button type="button" class="mgr-x" aria-label="Close">×</button></div><div class="mgr-body"></div></div>';
    document.body.appendChild(dlg);
    const close = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); if (lastFocus) lastFocus.focus(); };
    dlg.querySelector('.mgr-x').addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    return dlg;
  }
  function show(title, html, focusSel) {
    const d = ensure();
    lastFocus = document.activeElement;
    d.querySelector('#mgr-h').textContent = title;
    d.querySelector('.mgr-body').innerHTML = html;
    if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
    const f = d.querySelector(focusSel || '.mgr-x'); if (f) f.focus();
    return d;
  }

  function openEmail(items, repo) {
    const e = email(items, repo);
    const text = emailText(e);
    const where = e.to
      ? `Send it to <b>${esc(e.to)}</b> (published on the ${esc(repo.short || repo.name)} website)${e.via ? `, or use their <a href="${esc(e.via)}" target="_blank" rel="noopener">request page</a>` : ''}.`
      : (e.via ? `Send it through the ${repo ? 'library’s' : 'holding library’s'} <a href="${esc(e.via)}" target="_blank" rel="noopener">${repo ? 'contact or request page' : 'catalog record and its contact page'}</a>.`
        : 'Send it through the holding library’s contact or request page.');
    const d = show('Request email', `<p>Fill in the bracketed parts with your own details. ${where}</p>
      <label class="mgr-fine" for="mgr-t">Email text</label><textarea id="mgr-t" readonly>${esc(text)}</textarea>
      <div class="mgr-row"><button type="button" class="mgr-copy">Copy email</button>${e.to ? `<a href="mailto:${encodeURIComponent(e.to)}?subject=${encodeURIComponent(e.subject)}&body=${encodeURIComponent(e.body)}">Open in your mail app</a>` : ''}
      <span class="mgr-fine" role="status" aria-live="polite"></span></div>
      ${repo ? `<p class="mgr-fine" style="margin-top:10px"><a href="${esc((repo.guide || GUIDE + repo.slug + '/'))}" target="_blank" rel="noopener">${esc(repo.short || repo.name)}: research guide</a></p>` : ''}`, '.mgr-copy');
    d.querySelector('.mgr-copy').onclick = async () => {
      const st = d.querySelector('[role=status]');
      try { await navigator.clipboard.writeText(text); st.textContent = 'Copied.'; }
      catch { const t = d.querySelector('#mgr-t'); t.focus(); t.select(); st.textContent = 'Press Ctrl+C (or ⌘C) to copy.'; }
    };
  }

  function howHTML(repo) {
    const L = [];
    L.push(`<p>${esc(repo.request_method || 'Contact the library to arrange access.')}</p>`);
    const dl = [];
    if (verified(repo.hours)) dl.push(`<dt>Hours</dt><dd>${esc(repo.hours)}</dd>`);
    if (verified(repo.address)) dl.push(`<dt>Address</dt><dd>${esc(repo.address)}</dd>`);
    const c = [];
    if (repo.email) c.push(`<a href="mailto:${esc(repo.email)}">${esc(repo.email)}</a>`);
    if (repo.phone) c.push(esc(repo.phone));
    if (c.length) dl.push(`<dt>Contact</dt><dd>${c.join(' · ')}</dd>`);
    if (dl.length) L.push(`<dl class="mgr-dl">${dl.join('')}</dl>`);
    const links = [];
    if (safe(repo.request_url)) links.push(`<a href="${esc(repo.request_url)}" target="_blank" rel="noopener">Request page</a>`);
    if (!safe(repo.request_url) && safe(repo.contact_url)) links.push(`<a href="${esc(repo.contact_url)}" target="_blank" rel="noopener">Contact page</a>`);
    links.push(`<a href="${esc((repo.guide || GUIDE + repo.slug + '/'))}" target="_blank" rel="noopener">Full guide</a>`);
    L.push(`<p>${links.join(' · ')}</p>`);
    L.push(`<p class="mgr-fine">${repo.status === 'needs checking' ? 'Their website could not be checked automatically: confirm everything with them before you go.' : `Checked on the institution’s own website, ${esc(repo.date_checked)}. Details change: confirm before you go.`}</p>`);
    return L.join('');
  }
  function openHow(repo) { show(`How to request: ${repo.short || repo.name}`, howHTML(repo)); }

  function dbHTML(db) {
    if (!db) return '<p>Contact the library to arrange access.</p>';
    const s = db.sfpl || {};
    const card = s.card || {};
    const L = [`<p>${esc(card.summary || 'An SFPL library card (free to California residents) and its PIN open SFPL’s newspaper databases.')}</p>`];
    if (s.remote && s.remote.how) L.push(`<p>${esc(s.remote.how)}</p>`);
    const links = [];
    if (safe(s.remote && s.remote.url)) links.push(`<a href="${esc(s.remote.url)}" target="_blank" rel="noopener">SFPL Articles &amp; Databases</a>`);
    if (safe(card.apply_url)) links.push(`<a href="${esc(card.apply_url)}" target="_blank" rel="noopener">Get an SFPL card</a>`);
    links.push(`<a href="${GUIDE}library-card-databases/" target="_blank" rel="noopener">How to get access (full guide)</a>`);
    L.push(`<p>${links.join(' · ')}</p><p class="mgr-fine">Use the citation’s paper, date and page to find the item. Checked on SFPL’s website, ${esc(db.date_checked || '')}.</p>`);
    return L.join('');
  }
  function openDb(db) { show('View at SFPL (library card)', dbHTML(db)); }

  // "Request email · How to request · Directions & website" for one institution (repo may be null: email only)
  function linksHTML(repo, key) {
    const k = key ? ` data-k="${esc(key)}"` : '';
    const r = repo ? ` data-repo="${esc(repo.slug)}"` : '';
    const em = `<button type="button" class="mgr-lnk" data-act="email"${r}${k}>Request email</button>`;
    if (!repo) return em;
    const v = visitURL(repo);
    return `${em} · <button type="button" class="mgr-lnk" data-act="how"${r}${k}>How to request</button>` +
      (v ? ` · <a class="mgr-lnk" href="${esc(v)}" target="_blank" rel="noopener">Directions &amp; website<span class="mgr-vh"> (opens the ${esc(repo.short || repo.name)} website in a new tab)</span></a>` : '');
  }
  // "Where to see it": one located item, where it is held and how to get at it
  function openWhere(item, repo, onEmail) {
    const head = `<p><b>${esc(item.title)}</b>${item.call ? `<br><span class="mgr-fine">${esc(item.call)}</span>` : ''}</p>`;
    const rec = safe(item.url) ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">Catalog record</a> · ` : '';
    if (!repo) {
      const d = show('Where to see it', `${head}<p>Held by: ${esc(item.holder || 'see the catalog record')}.</p><p>We have no guide for this holder yet: send a request through the library’s contact or request page.</p>
        <p>${rec}<button type="button" class="mgr-lnk mgr-em">Request email</button></p>`, '.mgr-em');
      d.querySelector('.mgr-em').onclick = () => (onEmail ? onEmail() : openEmail([item], null));
      return;
    }
    const v = visitURL(repo);
    const d = show(`Where to see it: ${repo.short || repo.name}`, `${head}<p>${rec}<button type="button" class="mgr-lnk mgr-em">Request email</button>${v ? ` · <a href="${esc(v)}" target="_blank" rel="noopener">Directions &amp; website</a>` : ''}</p>
      <h3 style="font:600 17px/1.3 var(--body,Georgia,serif);margin:12px 0 4px">How to request</h3>${howHTML(repo)}`, '.mgr-em');
    d.querySelector('.mgr-em').onclick = () => (onEmail ? onEmail() : openEmail([item], repo));
  }
  function visitURL(repo) { return safe(repo.visit_url) || safe(repo.website) || safe(repo.contact_url); }

  if (typeof document !== 'undefined' && !document.getElementById('mgr-lnk-css')) {
    const st = document.createElement('style'); st.id = 'mgr-lnk-css';
    st.textContent = '.mgr-lnk{background:none;border:0;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;text-decoration:underline;text-decoration-color:var(--gold,#a8814a);text-underline-offset:3px}.mgr-lnk:hover{color:var(--gold-ink,#8a6a3b)}.mgr-lnk:focus-visible{outline:2px solid var(--gold,#a8814a);outline-offset:2px}.mgr-vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}';
    (document.head || document.documentElement).appendChild(st);
  }
  root.MGResearch = { openWhere, email, emailText, openEmail, openHow, openDb, howHTML, dbHTML, linksHTML, visitURL, GUIDE, esc, verified };
})(typeof window !== 'undefined' ? window : globalThis);
