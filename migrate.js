/* ═══════════════════════════════════════════════════════
   JTIPILOT — Script de migration localStorage
   Depuis : cands_btp_v2, flc_clients, crm_btp_db
   Vers   : jtp_interimaires, jtp_prospects, jtp_missions
   Usage  : inclure ce script dans n'importe quelle page
            puis appeler migrate() depuis la console
═══════════════════════════════════════════════════════ */

function migrate() {
  var rapport = [];
  var migrated = 0;

  /* ── 1. INTÉRIMAIRES (cands_btp_v2 → jtp_interimaires) ── */
  var oldCands = null;
  try { oldCands = JSON.parse(localStorage.getItem('cands_btp_v2')); } catch(e) {}
  if (oldCands && Array.isArray(oldCands) && oldCands.length) {
    var existing = [];
    try { existing = JSON.parse(localStorage.getItem('jtp_interimaires')) || []; } catch(e) {}
    var existingIds = existing.map(function(x){ return x.id; });
    var added = 0;
    oldCands.forEach(function(c) {
      if (existingIds.indexOf(c.id) === -1) {
        // Normalisation structure
        if (!c.habilitations_detail) c.habilitations_detail = [];
        if (!c.visite_medicale) c.visite_medicale = {};
        if (!c.notation) c.notation = { fiabilite: 0, qualite: 0, relationnel: 0, commentaire: '' };
        if (!c.historique_missions) c.historique_missions = [];
        existing.push(c);
        added++;
      }
    });
    localStorage.setItem('jtp_interimaires', JSON.stringify(existing));
    rapport.push('✅ Intérimaires : ' + added + ' ajouté(s) depuis cands_btp_v2 (' + oldCands.length + ' trouvé(s))');
    migrated += added;
  } else {
    rapport.push('ℹ️ Intérimaires : aucune donnée dans cands_btp_v2');
  }

  /* ── 2. PROSPECTS/CLIENTS (flc_clients + crm_btp_db → jtp_prospects) ── */
  var oldClients = null;
  try { oldClients = JSON.parse(localStorage.getItem('flc_clients')); } catch(e) {}
  var oldCRM = null;
  try { oldCRM = JSON.parse(localStorage.getItem('crm_btp_db')); } catch(e) {}

  var existingPros = [];
  try { existingPros = JSON.parse(localStorage.getItem('jtp_prospects')) || []; } catch(e) {}
  var existingProsIds = existingPros.map(function(x){ return x.id; });
  var proAdded = 0;

  // Migration clients (flc_clients)
  if (oldClients && Array.isArray(oldClients) && oldClients.length) {
    oldClients.forEach(function(c) {
      if (existingProsIds.indexOf(c.id) === -1) {
        var pro = {
          id: c.id,
          statut: 'client',
          nom: c.nom || '',
          secteur: c.secteur || '',
          taille: c.taille || '',
          adresse: c.adresse || '',
          siret: c.siret || '',
          ca: c.ca || '',
          capital: c.capital || 0,
          age: c.age || 0,
          delai_pmt: c.delai_pmt || 45,
          encours: c.encours || 0,
          cond_regl: c.cond_regl || '',
          acompte_client: c.acompte_client || 'non',
          procedure: c.procedure || 0,
          incidents: c.incidents || 0,
          contacts: c.contacts || [],
          qualifs_recherchees: [],
          notes: c.notes || '',
          placements: c.placements || [],
          journal: c.journal || []
        };
        // Compat ancienne structure decideurs
        if (!pro.contacts.length && c.decideur1 && c.decideur1.nom) {
          pro.contacts.push({ nom: c.decideur1.nom, fonction: c.decideur1.poste || 'Commercial', tel: c.decideur1.tel || '', email: c.decideur1.email || '', site: '' });
        }
        if (!pro.contacts.some(function(ct){ return c.decideur2 && ct.nom === c.decideur2.nom; }) && c.decideur2 && c.decideur2.nom) {
          pro.contacts.push({ nom: c.decideur2.nom, fonction: c.decideur2.poste || 'DAF/Comptable', tel: c.decideur2.tel || '', email: c.decideur2.email || '', site: '' });
        }
        existingPros.push(pro);
        existingProsIds.push(pro.id);
        proAdded++;
      }
    });
    rapport.push('✅ Clients : ' + proAdded + ' ajouté(s) depuis flc_clients');
    migrated += proAdded;
  }

  // Migration prospects CRM (crm_btp_db)
  var crmAdded = 0;
  if (oldCRM && Array.isArray(oldCRM) && oldCRM.length) {
    oldCRM.forEach(function(c) {
      // Éviter doublons par nom
      var nomNorm = (c.nom || '').toLowerCase().trim();
      var alreadyExists = existingPros.some(function(p){ return (p.nom || '').toLowerCase().trim() === nomNorm; });
      if (!alreadyExists && c.nom) {
        var pid = c.id || ('crm_' + Date.now() + '_' + Math.random().toString(36).slice(2,5));
        var pro = {
          id: pid,
          statut: c.statut_avancement && c.statut_avancement.indexOf('client') !== -1 ? 'client' : 'prospect',
          nom: c.nom || '',
          secteur: c.secteur || c.secteur_cible || '',
          taille: c.taille || '',
          adresse: c.ville || c.adresse || '',
          siret: c.siret || '',
          ca: '', capital: 0, age: 0,
          delai_pmt: 45, encours: 0, cond_regl: '', acompte_client: 'non',
          procedure: 0, incidents: 0,
          contacts: c.contacts || [],
          qualifs_recherchees: c.qualifs_cibles ? c.qualifs_cibles.split(',').map(function(q){ return q.trim(); }) : [],
          notes: c.notes || c.commentaire || '',
          placements: [],
          journal: c.journal || c.actions || []
        };
        if (!pro.contacts.length && (c.nom_contact || c.prenom_contact)) {
          pro.contacts.push({ nom: (c.prenom_contact || '') + ' ' + (c.nom_contact || ''), fonction: c.poste_contact || 'Contact', tel: c.tel || '', email: c.email || '', site: '' });
        }
        existingPros.push(pro);
        existingProsIds.push(pro.id);
        crmAdded++;
      }
    });
    rapport.push('✅ Prospects CRM : ' + crmAdded + ' ajouté(s) depuis crm_btp_db');
    migrated += crmAdded;
  }

  if (proAdded + crmAdded > 0) {
    localStorage.setItem('jtp_prospects', JSON.stringify(existingPros));
  } else if (!oldClients && !oldCRM) {
    rapport.push('ℹ️ Prospects : aucune donnée dans flc_clients ni crm_btp_db');
  }

  /* ── 3. GRILLES TARIFAIRES (grilles_btp → jtp_grilles) ── */
  var oldGrilles = null;
  try { oldGrilles = localStorage.getItem('grilles_btp'); } catch(e) {}
  if (oldGrilles) {
    if (!localStorage.getItem('jtp_grilles')) {
      localStorage.setItem('jtp_grilles', oldGrilles);
      rapport.push('✅ Grilles tarifaires : migrées depuis grilles_btp');
    } else {
      rapport.push('ℹ️ Grilles tarifaires : déjà présentes dans jtp_grilles');
    }
  }

  /* ── 4. CONFIG AGENCE (agence_btp / tdb_cfg → jtp_config) ── */
  var oldAgence = null;
  try { oldAgence = JSON.parse(localStorage.getItem('agence_btp')); } catch(e) {}
  var oldTdb = null;
  try { oldTdb = JSON.parse(localStorage.getItem('tdb_cfg')); } catch(e) {}

  if ((oldAgence || oldTdb) && !localStorage.getItem('jtp_config')) {
    var cfg = {};
    if (oldAgence) Object.assign(cfg, oldAgence);
    if (oldTdb) {
      cfg.obj_etp = oldTdb.objEtp || '';
      cfg.obj_mb = oldTdb.objMb || '';
      cfg.obj_rdv = oldTdb.objRdv || '';
      cfg.obj_appels = oldTdb.objAppels || '';
    }
    localStorage.setItem('jtp_config', JSON.stringify(cfg));
    rapport.push('✅ Config agence : migrée depuis agence_btp / tdb_cfg');
  }

  /* ── RAPPORT FINAL ── */
  console.group('🔄 JTIPILOT — Migration terminée');
  rapport.forEach(function(r){ console.log(r); });
  console.log('──────────────────────────────────');
  console.log('Total migré : ' + migrated + ' enregistrement(s)');
  console.groupEnd();

  // Affichage dans la page si possible
  var rapportDiv = document.getElementById('migration-rapport');
  if (rapportDiv) {
    rapportDiv.innerHTML = '<div style="font-family:monospace;font-size:12px;line-height:1.8">'
      + rapport.join('<br>') + '<br><hr style="margin:8px 0">'
      + '<strong>Total migré : ' + migrated + ' enregistrement(s)</strong>'
      + '</div>';
    rapportDiv.style.display = 'block';
  }

  return { migrated: migrated, rapport: rapport };
}

/* Auto-run si page de migration dédiée */
if (typeof AUTO_MIGRATE !== 'undefined' && AUTO_MIGRATE) {
  document.addEventListener('DOMContentLoaded', migrate);
}
