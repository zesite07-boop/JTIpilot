/**
 * JTIPilot — Supabase Sync Module v1.0
 * Sync bidirectionnelle localStorage ↔ Supabase
 * Strategy: last-write-wins par record (updated_at)
 * Usage: inclure après le script principal de chaque page
 */

(function() {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────────
  var CFG_KEY = 'jtp_supabase_cfg';

  function getCfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY) || '{}'); } catch(e) { return {}; }
  }

  /** Base projet Supabase sans slash final ni suffixe /rest/v1 */
  function normalizeSupabaseUrl(raw) {
    var u = (raw || '').trim().replace(/\/+$/, '');
    if (!u) return '';
    u = u.replace(/\/rest\/v1\/?$/i, '');
    return u;
  }

  /** Valide le nom de table PostgREST (évite chemins mal formés) */
  function assertSafeTableName(table) {
    if (!table || typeof table !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
      throw new Error('Nom de table Supabase invalide : ' + String(table));
    }
    return table;
  }

  // Tables Supabase → clés localStorage
  var TABLE_MAP = {
    'crm_prospects':  'crm_btp_db',
    'candidats':      'cands_btp_v2',
    'clients':        'flc_clients',
    'missions':       'jtp_missions',
    'grilles':        'grilles_btp'
  };

  // ── STATE ────────────────────────────────────────────────────────
  var SB = {
    url: '',
    key: '',
    enabled: false,
    syncing: false,
    lastSync: null,
    listeners: [],
    realtimeSubs: [],
    errors: 0
  };

  // ── API FETCH ────────────────────────────────────────────────────
  function sbFetch(path, opts) {
    var cfg = getCfg();
    cfg.url = normalizeSupabaseUrl(cfg.url);
    if(!cfg.url || !cfg.key) return Promise.reject(new Error('Supabase non configuré'));
    var pathClean = String(path || '').replace(/^\/+/, '');
    if(!pathClean) return Promise.reject(new Error('Chemin REST vide'));
    var base = cfg.url.replace(/\/$/, '');
    var url = base + '/rest/v1/' + pathClean;
    var headers = {
      'Content-Type': 'application/json',
      'apikey': cfg.key,
      'Authorization': 'Bearer ' + cfg.key,
      'Prefer': 'return=representation'
    };
    var finalOpts = Object.assign({}, opts || {});
    finalOpts.headers = Object.assign({}, headers, opts && opts.headers ? opts.headers : {});
    return Promise.resolve()
      .then(function() { return fetch(url, finalOpts); })
      .then(function(r) {
        if(!r.ok) {
          return r.text().then(function(t) {
            var snippet = (t || '').replace(/\s+/g, ' ').trim().slice(0, 500);
            var errMsg = 'HTTP ' + r.status;
            if (snippet) errMsg += ' — ' + snippet;
            if (r.status === 500) errMsg += ' (vérifiez schéma SQL, RLS et types colonnes id / _payload)';
            var err = new Error(errMsg);
            err.status = r.status;
            throw err;
          });
        }
        if (r.status === 204) return [];
        var ct = (r.headers.get('content-type') || '').toLowerCase();
        if (ct.indexOf('application/json') === -1) return r.text().then(function() { return []; });
        return r.json().catch(function() { return []; });
      })
      .catch(function(e) {
        if (e && typeof e.status === 'number') throw e;
        var msg = (e && e.message) ? e.message : String(e);
        if (e instanceof TypeError) msg = 'Réseau / CORS : ' + msg;
        throw new Error('[Supabase] ' + msg);
      });
  }

  // ── UPSERT (insert or update by id) ─────────────────────────────
  // POST /rest/v1/<table>?on_conflict=id + Prefer: resolution=merge-duplicates
  function upsertRecords(table, records) {
    if(!records || !records.length) return Promise.resolve([]);
    assertSafeTableName(table);
    var now = new Date().toISOString();
    var rows = [];
    try {
      records.forEach(function(r) {
        if (!r || r.id == null || r.id === '') return;
        var row = JSON.parse(JSON.stringify(r));
        row.updated_at = row.updated_at || now;
        row._payload = JSON.stringify(r);
        rows.push({ id: String(r.id), updated_at: row.updated_at, _payload: row._payload });
      });
    } catch (e) {
      return Promise.reject(new Error('Préparation upsert impossible : ' + (e.message || e)));
    }
    if (!rows.length) return Promise.resolve([]);
    return sbFetch(table + '?on_conflict=id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(rows)
    });
  }

  // ── FETCH REMOTE ─────────────────────────────────────────────────
  function fetchRemote(table) {
    assertSafeTableName(table);
    return sbFetch(table + '?select=id,updated_at,_payload&order=updated_at.desc');
  }

  // ── MERGE: local + remote → last-write-wins ──────────────────────
  function mergeRecords(local, remote) {
    var map = {};
    // Charger local d'abord
    local.forEach(function(r) {
      map[r.id] = { data: r, ts: r.updated_at || '0' };
    });
    // Merger remote — gagne si updated_at plus récent
    remote.forEach(function(row) {
      var remoteTs = row.updated_at || '0';
      var payload;
      try { payload = JSON.parse(row._payload || '{}'); } catch(e) { payload = {}; }
      if(!map[row.id] || remoteTs > map[row.id].ts) {
        map[row.id] = { data: payload, ts: remoteTs };
      }
    });
    return Object.values(map).map(function(x) { return x.data; });
  }

  // ── SYNC UNE TABLE ───────────────────────────────────────────────
  function syncTable(sbTable, lsKey) {
    var local = [];
    try { local = JSON.parse(localStorage.getItem(lsKey) || '[]'); } catch(e) {}
    if(!Array.isArray(local)) local = [];

    // Pousser le local vers Supabase
    return upsertRecords(sbTable, local)
      .then(function() {
        // Récupérer remote
        return fetchRemote(sbTable);
      })
      .then(function(remote) {
        if(!Array.isArray(remote)) return;
        var merged = mergeRecords(local, remote);
        localStorage.setItem(lsKey, JSON.stringify(merged));
        return merged.length;
      });
  }

  // ── SYNC COMPLÈTE ────────────────────────────────────────────────
  function syncAll(silent) {
    var cfg = getCfg();
    if(!cfg.url || !cfg.key) return Promise.resolve();
    if(SB.syncing) return Promise.resolve();
    SB.syncing = true;
    setSyncStatus('syncing');

    var tables = Object.keys(TABLE_MAP);
    var results = {};

    return tables.reduce(function(chain, sbTable) {
      return chain.then(function() {
        return syncTable(sbTable, TABLE_MAP[sbTable])
          .then(function(n) { results[sbTable] = n || 0; })
          .catch(function(e) { results[sbTable] = 'ERR: ' + e.message; });
      });
    }, Promise.resolve())
    .then(function() {
      SB.syncing = false;
      SB.lastSync = new Date();
      SB.errors = 0;
      setSyncStatus('ok');
      if(!silent) showSyncToast('✓ Synchronisé avec Supabase');
      // Notifier les iframes
      notifyIframes();
      // Rafraîchir KPIs si disponible
      if(typeof refreshKPIs === 'function') refreshKPIs();
      if(typeof renderToday === 'function') renderToday();
      return results;
    })
    .catch(function(e) {
      SB.syncing = false;
      SB.errors++;
      setSyncStatus('error');
      var detail = (e && e.message) ? e.message : String(e);
      console.error('[JTISync] Erreur sync:', detail);
      try {
        if (!silent) showSyncToast('✗ Sync : ' + detail.slice(0, 120) + (detail.length > 120 ? '…' : ''));
      } catch (ex) {}
    });
  }

  // ── REALTIME ─────────────────────────────────────────────────────
  function setupRealtime() {
    var cfg = getCfg();
    if(!cfg.url || !cfg.key || !cfg.realtime) return;
    // Supabase Realtime via WebSocket
    var wsUrl = cfg.url.replace('https://', 'wss://').replace('http://', 'ws://')
                       .replace(/\/$/, '') + '/realtime/v1/websocket?apikey=' + cfg.key + '&vsn=1.0.0';
    try {
      var ws = new WebSocket(wsUrl);
      ws.onopen = function() {
        // S'abonner à toutes les tables
        Object.keys(TABLE_MAP).forEach(function(t) {
          ws.send(JSON.stringify({
            topic: 'realtime:public:' + t,
            event: 'phx_join',
            payload: {},
            ref: null
          }));
        });
        setSyncStatus('realtime');
      };
      ws.onmessage = function(e) {
        var msg;
        try { msg = JSON.parse(e.data); } catch(ex) { return; }
        if(msg.event === 'INSERT' || msg.event === 'UPDATE' || msg.event === 'DELETE') {
          // Resync la table concernée après un délai
          var tbl = (msg.topic || '').split(':')[2];
          if(tbl && TABLE_MAP[tbl]) {
            setTimeout(function() { syncTable(tbl, TABLE_MAP[tbl]).then(function() {
              if(typeof refreshKPIs === 'function') refreshKPIs();
            }); }, 500);
          }
        }
      };
      ws.onerror = function() { setSyncStatus('ok'); }; // Realtime optionnel
      SB.realtimeSubs.push(ws);
    } catch(e) {}
  }

  // ── STATUS UI ────────────────────────────────────────────────────
  function setSyncStatus(status) {
    var el = document.getElementById('sync-status-dot');
    var lbl = document.getElementById('sync-status-lbl');
    if(!el) return;
    var map = {
      'off':      { color: '#475569', txt: 'SYNC OFF' },
      'syncing':  { color: '#fbbf24', txt: 'SYNC…' },
      'ok':       { color: '#22c55e', txt: 'SYNC OK' },
      'error':    { color: '#ef4444', txt: 'SYNC ERR' },
      'realtime': { color: '#06b6d4', txt: 'LIVE' }
    };
    var s = map[status] || map.off;
    el.style.background = s.color;
    if(lbl) lbl.textContent = s.txt;
  }

  function showSyncToast(msg) {
    var t = document.getElementById('sync-toast');
    if(!t) return;
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(function() { t.style.opacity = '0'; }, 3000);
  }

  // ── NOTIFIER IFRAMES ─────────────────────────────────────────────
  function notifyIframes() {
    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(f) {
      try { f.contentWindow.postMessage({ type: 'sync_complete' }, '*'); } catch(e) {}
    });
  }

  // ── INIT UI ──────────────────────────────────────────────────────
  function injectSyncUI() {
    // Badge dans la topbar
    var topbarRight = document.querySelector('.topbar-right');
    if(topbarRight && !document.getElementById('sync-status-dot')) {
      var badge = document.createElement('div');
      badge.id = 'sync-badge';
      badge.style.cssText = 'display:flex;align-items:center;gap:5px;padding:4px 10px;background:var(--s2);border:1px solid var(--border);border-radius:2px;cursor:pointer;font-family:var(--mono);font-size:9px;';
      badge.title = 'Sync Supabase';
      badge.onclick = function() { openSyncModal(); };
      badge.innerHTML = '<div id="sync-status-dot" style="width:6px;height:6px;border-radius:50%;background:#475569;flex-shrink:0;transition:background .3s;"></div>'
        + '<span id="sync-status-lbl" style="color:var(--muted);letter-spacing:.5px;">SYNC OFF</span>';
      topbarRight.insertBefore(badge, topbarRight.firstChild);
    }

    // Toast notification
    if(!document.getElementById('sync-toast')) {
      var toast = document.createElement('div');
      toast.id = 'sync-toast';
      toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#22c55e;color:#fff;padding:8px 16px;border-radius:4px;font-family:var(--mono);font-size:11px;font-weight:700;opacity:0;transition:opacity .4s;z-index:9999;pointer-events:none;';
      document.body.appendChild(toast);
    }

    // Modal config Supabase
    if(!document.getElementById('modal-supabase')) {
      // Injecter CSS si pas déjà présent
      if(!document.getElementById('jti-sync-css')) {
        var styleEl = document.createElement('style');
        styleEl.id = 'jti-sync-css';
        styleEl.textContent = [
          '#modal-supabase{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:600;align-items:center;justify-content:center;padding:20px;}',
          '#modal-supabase.open{display:flex;}',
          '#modal-supabase .sb-modal-inner{background:#0f1117;border:1px solid #2a3050;border-radius:6px;padding:22px;width:min(500px,95vw);max-height:90vh;overflow-y:auto;}',
          '#modal-supabase h3{font-family:monospace;font-size:13px;font-weight:700;color:#f97316;margin-bottom:16px;letter-spacing:.5px;}',
          '#modal-supabase p{font-size:11px;color:#94a3b8;margin-bottom:14px;line-height:1.6;}',
          '#modal-supabase .sb-field{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}',
          '#modal-supabase .sb-field label{font-size:10px;color:#64748b;font-family:monospace;font-weight:700;letter-spacing:.3px;}',
          '#modal-supabase .sb-field input[type=text],#modal-supabase .sb-field input[type=password]{background:#181c27;border:1px solid #2a3050;color:#e2e8f0;padding:7px 10px;border-radius:3px;font-size:12px;font-family:monospace;width:100%;box-sizing:border-box;}',
          '#modal-supabase .sb-field input:focus{border-color:#f97316;outline:none;}',
          '#modal-supabase .sb-field-row{display:flex;align-items:center;gap:8px;}',
          '#modal-supabase .sb-btn-primary{padding:6px 14px;background:#f97316;color:#fff;border:none;border-radius:3px;font-family:monospace;font-size:11px;font-weight:700;cursor:pointer;}',
          '#modal-supabase .sb-btn-cancel{padding:6px 14px;background:transparent;color:#64748b;border:1px solid #2a3050;border-radius:3px;font-family:monospace;font-size:11px;cursor:pointer;}',
          '#modal-supabase .sb-btn-test{padding:5px 10px;background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);border-radius:3px;color:#60a5fa;font-family:monospace;font-size:10px;cursor:pointer;}',
          '#modal-supabase .sb-btn-sql{padding:5px 10px;background:transparent;border:1px solid #2a3050;border-radius:3px;color:#64748b;font-family:monospace;font-size:10px;cursor:pointer;}',
          '#modal-supabase .sb-footer{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:14px;border-top:1px solid #2a3050;}',
          '#modal-supabase .sb-schema{margin:12px 0;padding:10px;background:#181c27;border:1px solid #2a3050;border-radius:3px;font-size:10px;font-family:monospace;color:#94a3b8;display:none;}',
          '#modal-supabase pre{overflow-x:auto;font-size:9px;color:#e2e8f0;line-height:1.6;white-space:pre-wrap;margin-top:6px;}'
        ].join('');
        document.head.appendChild(styleEl);
      }

    var modal = document.createElement('div');
      modal.id = 'modal-supabase';
      modal.className = '';
      modal.innerHTML = [
        '<div class="sb-modal-inner">',
        '<h3>☁ SYNC SUPABASE</h3>',
        '<p style="font-size:11px;color:var(--muted2);margin-bottom:16px">',
        'Sync bidirectionnelle localStorage ↔ Supabase.<br>',
        'Créez un projet gratuit sur <a href="https://supabase.com" target="_blank" style="color:var(--accent)">supabase.com</a> puis collez vos clés.',
        '</p>',
        '<div id="sync-setup-status" style="margin-bottom:12px"></div>',
        '<div style="">',
        '<div class="sb-field"><label style="font-size:10px;color:var(--muted);font-family:var(--mono)">PROJECT URL</label>',
        '<input type="text" id="sb-url" placeholder="https://xxxxxxxxxxxx.supabase.co" style="background:var(--s2);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:3px;font-size:12px;font-family:var(--mono);width:100%"/></div>',
        '<div class="sb-field"><label style="font-size:10px;color:var(--muted);font-family:var(--mono)">ANON PUBLIC KEY</label>',
        '<input type="password" id="sb-key" placeholder="eyJhbGciO…" style="background:var(--s2);border:1px solid var(--border);color:var(--text);padding:7px 10px;border-radius:3px;font-size:12px;font-family:var(--mono);width:100%"/></div>',
        '<div class="sb-field" style="flex-direction:row;align-items:center;gap:8px">',
        '<input type="checkbox" id="sb-realtime" style="width:auto"/>',
        '<label for="sb-realtime" style="font-size:11px;color:var(--muted2)">Activer Realtime (WebSocket — sync instantanée)</label>',
        '</div>',
        '</div>',
        '<div id="sync-schema-info" class="sb-schema">',
        '<div style="color:var(--cyan);margin-bottom:6px">SQL À EXÉCUTER DANS SUPABASE → SQL EDITOR :</div>',
        '<pre id="sync-sql-pre" style="overflow-x:auto;font-size:9px;color:var(--text);line-height:1.6;white-space:pre-wrap"></pre>',
        '</div>',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">',
        '<div style="display:flex;gap:8px">',
        '<button class="sb-btn-sql" onclick="showSyncSQL()">VOIR SQL</button>',
        '<button class="sb-btn-test" onclick="testSyncConnection()">TESTER</button>',
        '</div>',
        '<div style="display:flex;gap:8px">',
        '<button onclick="closeSyncModal()" style="padding:6px 14px;background:transparent;border:1px solid var(--border);border-radius:3px;color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer">FERMER</button>',
        '<button onclick="saveSyncCfgAndSync()" style="padding:6px 14px;background:var(--accent);border:none;border-radius:3px;color:#fff;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer">ENREGISTRER & SYNC</button>',
        '</div>',
        '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);
      modal.addEventListener('click', function(e) {
        if(e.target === modal) closeSyncModal();
      });
    }
  }

  // ── MODAL SYNC ───────────────────────────────────────────────────
  window.openSyncModal = function() {
    var cfg = getCfg();
    var urlEl = document.getElementById('sb-url');
    var keyEl = document.getElementById('sb-key');
    var rtEl  = document.getElementById('sb-realtime');
    if(urlEl) urlEl.value = cfg.url || '';
    if(keyEl) keyEl.value = cfg.key || '';
    if(rtEl)  rtEl.checked = !!cfg.realtime;
    document.getElementById('modal-supabase').classList.add('open');
    updateSetupStatus();
  };

  window.closeSyncModal = function() {
    document.getElementById('modal-supabase').classList.remove('open');
  };

  window.saveSyncCfgAndSync = function() {
    var url = (document.getElementById('sb-url')||{}).value || '';
    var key = (document.getElementById('sb-key')||{}).value || '';
    var rt  = (document.getElementById('sb-realtime')||{}).checked || false;
    if(!url || !key) { alert('URL et clé requis'); return; }
    var cfg = { url: normalizeSupabaseUrl(url.trim()), key: key.trim(), realtime: rt };
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
    closeSyncModal();
    syncAll(false);
    if(rt) setupRealtime();
  };

  window.testSyncConnection = function() {
    var url = (document.getElementById('sb-url')||{}).value || '';
    var key = (document.getElementById('sb-key')||{}).value || '';
    if(!url || !key) { setSetupStatus('error','URL et clé requis'); return; }
    // Sauver temporairement pour le test
    var prev = localStorage.getItem(CFG_KEY);
    localStorage.setItem(CFG_KEY, JSON.stringify({ url: normalizeSupabaseUrl(url), key: key }));
    setSetupStatus('loading','Test de connexion…');
    sbFetch('crm_prospects?select=id&limit=1')
      .then(function() { setSetupStatus('ok','✓ Connexion réussie — tables accessibles'); })
      .catch(function(e) {
        setSetupStatus('error','✗ Erreur : ' + e.message + ' — Vérifiez URL/clé et que les tables existent (voir SQL)');
        if(prev) localStorage.setItem(CFG_KEY, prev);
        else localStorage.removeItem(CFG_KEY);
      });
  };

  window.showSyncSQL = function() {
    var el = document.getElementById('sync-schema-info');
    var pre = document.getElementById('sync-sql-pre');
    if(!el || !pre) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
    pre.textContent = generateSQL();
  };

  function generateSQL() {
    var tables = [
      ['crm_prospects', 'CRM Prospects/Clients'],
      ['candidats', 'Base candidats intérimaires'],
      ['clients', 'Fiches clients étendues'],
      ['missions', 'Missions actives/clôturées'],
      ['grilles', 'Grilles tarifaires accord-cadre']
    ];
    var sql = '-- JTIPilot — Schéma Supabase\n-- Exécuter dans Supabase > SQL Editor\n\n';
    tables.forEach(function(t) {
      sql += '-- ' + t[1] + '\n';
      sql += 'create table if not exists public.' + t[0] + ' (\n';
      sql += '  id text primary key,\n';
      sql += '  updated_at timestamptz default now(),\n';
      sql += '  _payload jsonb\n';
      sql += ');\n';
      sql += 'alter table public.' + t[0] + ' enable row level security;\n';
      sql += 'create policy "Allow all" on public.' + t[0] + ' for all using (true) with check (true);\n\n';
    });
    sql += '-- Activer Realtime (optionnel)\n';
    tables.forEach(function(t) {
      sql += "alter publication supabase_realtime add table public." + t[0] + ";\n";
    });
    return sql;
  }

  function setSetupStatus(type, msg) {
    var el = document.getElementById('sync-setup-status');
    if(!el) return;
    var colors = { ok:'#22c55e', error:'#ef4444', loading:'#fbbf24', info:'#64748b' };
    var c = colors[type] || colors.info;
    el.innerHTML = '<div style="padding:8px 10px;border-radius:3px;font-size:11px;font-family:var(--mono);color:'+c+';background:rgba(0,0,0,.2);border-left:2px solid '+c+'">'+msg+'</div>';
  }

  function updateSetupStatus() {
    var cfg = getCfg();
    if(!cfg.url) {
      setSetupStatus('info', 'Non configuré — renseignez votre projet Supabase ci-dessous');
    } else if(SB.lastSync) {
      setSetupStatus('ok', '✓ Connecté — dernière sync : ' + SB.lastSync.toLocaleTimeString('fr-FR'));
    } else {
      setSetupStatus('info', 'Configuré — sync non encore effectuée');
    }
  }

  // ── FORCE SYNC (callable depuis n'importe quel module) ───────────
  window.JTISync = {
    sync: syncAll,
    syncTable: syncTable,
    getStatus: function() { return { enabled: !!getCfg().url, lastSync: SB.lastSync, syncing: SB.syncing }; },
    openConfig: function() { window.openSyncModal && window.openSyncModal(); },
    generateSQL: generateSQL
  };

  // ── ÉCOUTER LES CHANGEMENTS localStorage (inter-onglets) ─────────
  window.addEventListener('storage', function(e) {
    var syncedKeys = Object.values(TABLE_MAP);
    if(syncedKeys.indexOf(e.key) >= 0 && getCfg().url) {
      // Debounce : sync 2s après le dernier changement
      clearTimeout(SB._debounce);
      SB._debounce = setTimeout(function() { syncAll(true); }, 2000);
    }
  });

  // ── INIT ─────────────────────────────────────────────────────────
  function init() {
    injectSyncUI();
    var cfg = getCfg();
    if(cfg.url && cfg.key) {
      // Sync initiale au chargement
      setTimeout(function() { syncAll(true); }, 2000);
      // Sync périodique toutes les 60s
      setInterval(function() { syncAll(true); }, 60000);
      // Realtime si activé
      if(cfg.realtime) setTimeout(setupRealtime, 3000);
    } else {
      setSyncStatus('off');
    }
  }

  // Attendre le DOM
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

})();
