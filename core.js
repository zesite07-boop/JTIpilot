/* ═══════════════════════════════════════════════════════════════
   JTIPilot — core.js
   Données & fonctions métier partagées entre tous les modules
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ── Clés localStorage ────────────────────────────────────────────
var STORE = {
  prospects:    'app_prospects',    // Prospects + Clients EU
  interimaires: 'app_interimaires', // Intérimaires
  missions:     'app_missions',     // Missions
  config:       'app_config',       // Paramètres agence + objectifs
  grilles:      'app_grilles',      // Grilles tarifaires
};

// ── Paramètres agence par défaut ─────────────────────────────────
var AGENCE_DEFAUT = {
  nom: 'JTIPilot BTP',
  emetteur: 'Jonathan T.',
  tel: '01 XX XX XX XX',
  email: 'contact@jtipilot.fr',
  adresse: 'Paris 16e / 17e',
  siret: '',
  obj_etp: 15,
  obj_mb: 18,
  obj_rdv: 5,
  obj_appels: 20,
};

// ── Utilitaires ──────────────────────────────────────────────────
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
function today(){ return new Date().toISOString().split('T')[0]; }
function fmt(d){ if(!d)return '--'; var p=d.split('-'); return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:d; }
function nrm(s){ return (s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt2(n){ return isNaN(n)?'0,00':parseFloat(n).toFixed(2).replace('.',','); }
function fmtCA(n){ if(!n||isNaN(n))return '—'; n=Math.round(n); if(n>=1000)return (n/1000).toFixed(1).replace('.',',')+'k€'; return n+'€'; }
function fmtPct(n){ return (parseFloat(n)||0).toFixed(1).replace('.',',')+'%'; }

// ── Lecture / écriture localStorage ─────────────────────────────
function dbGet(key){
  try{ var s=localStorage.getItem(key); return s?JSON.parse(s):[]; }catch(e){ return []; }
}
function dbGetObj(key, deflt){
  try{ var s=localStorage.getItem(key); return s?JSON.parse(s):(deflt||{}); }catch(e){ return deflt||{}; }
}
function dbSet(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); return true; }catch(e){ return false; }
}

function getConfig(){ return dbGetObj(STORE.config, AGENCE_DEFAUT); }
function saveConfig(cfg){ dbSet(STORE.config, cfg); }
function getAgence(){ return getConfig(); }

// ── Toast notifications ──────────────────────────────────────────
function toast(msg, type){
  var tc = document.getElementById('toast-container');
  if(!tc){ tc=document.createElement('div'); tc.id='toast-container'; document.body.appendChild(tc); }
  var t = document.createElement('div');
  t.className = 'toast'+(type?' '+type:'');
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 2800);
}
function toastOK(msg){ toast(msg,'success'); }
function toastERR(msg){ toast(msg,'error'); }
function toastWARN(msg){ toast(msg,'warning'); }

// ── ACOSS 2024 ───────────────────────────────────────────────────
var ACOSS = {
  panier_sedentaire : 10.10,
  panier_gd_repas   : 20.70,
  gd_nuit           : 72.50,
  navigo_exo        : 1.00,
};

// ── Barème ITR ACOSS (zones indemnité transport) ─────────────────
var ZONES_ITR = [
  [5,   2.20, 'Z1 ≤5km — 2,20€'],
  [10,  4.50, 'Z2 5→10km — 4,50€'],
  [20,  6.80, 'Z3 10→20km — 6,80€'],
  [30,  9.15, 'Z4 20→30km — 9,15€'],
  [40, 11.50, 'Z5 30→40km — 11,50€'],
  [50, 13.85, 'Z6 40→50km — 13,85€'],
  [999,16.20, 'Z7 >50km — 16,20€'],
];

function getITR(km){
  for(var i=0;i<ZONES_ITR.length;i++){
    if(km <= ZONES_ITR[i][0]) return {val:ZONES_ITR[i][1], label:ZONES_ITR[i][2]};
  }
  return {val:16.20, label:'Z7 >50km — 16,20€'};
}

// ── Géolocalisation approximative IDF ────────────────────────────
var CP_COORDS = {
  '75001':[48.860,2.347],'75002':[48.865,2.349],'75003':[48.863,2.361],'75004':[48.854,2.352],
  '75005':[48.851,2.345],'75006':[48.850,2.332],'75007':[48.855,2.317],'75008':[48.875,2.310],
  '75009':[48.877,2.337],'75010':[48.876,2.360],'75011':[48.859,2.380],'75012':[48.841,2.391],
  '75013':[48.830,2.362],'75014':[48.828,2.325],'75015':[48.841,2.300],'75016':[48.860,2.267],
  '75017':[48.884,2.311],'75018':[48.892,2.347],'75019':[48.882,2.381],'75020':[48.864,2.397],
  '92100':[48.897,2.317],'92200':[48.898,2.268],'92300':[48.821,2.235],'92400':[48.889,2.257],
  '92500':[48.893,2.214],'92600':[48.833,2.207],'92700':[48.905,2.228],'92800':[48.882,2.237],
  '93100':[48.913,2.462],'93200':[48.921,2.380],'93300':[48.931,2.461],'93400':[48.917,2.483],
  '94000':[48.773,2.474],'94100':[48.815,2.459],'94200':[48.804,2.430],'94300':[48.813,2.395],
  '94400':[48.787,2.425],'94500':[48.773,2.507],'94600':[48.800,2.364],'94700':[48.775,2.393],
  '78000':[48.800,2.133],'78100':[48.767,2.100],'78200':[48.867,2.167],'78300':[48.850,2.067],
  '91000':[48.624,2.430],'91100':[48.690,2.380],'91200':[48.654,2.347],'91300':[48.618,2.462],
  '77000':[48.541,2.660],'77100':[48.580,2.700],'77200':[48.540,2.720],'77300':[48.550,2.690],
  '95000':[49.034,2.076],'95100':[49.010,2.090],'95200':[49.020,2.080],'95300':[49.050,2.060],
};

function haversine(lat1,lon1,lat2,lon2){
  var R=6371, dL=((lat2-lat1)*Math.PI/180), dG=((lon2-lon1)*Math.PI/180);
  var a=Math.sin(dL/2)*Math.sin(dL/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dG/2)*Math.sin(dG/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function getCoords(cp){
  if(CP_COORDS[cp]) return CP_COORDS[cp];
  var dpt=cp.slice(0,2);
  var dpts={'75':[48.857,2.347],'92':[48.860,2.270],'93':[48.910,2.440],'94':[48.800,2.450],
            '77':[48.600,2.700],'78':[48.900,2.000],'91':[48.600,2.350],'95':[49.040,2.100]};
  return dpts[dpt]||null;
}

function cpToVille_str(cp){ return cp; }

function calcDistKm(cp1, cp2){
  var c1=getCoords(cp1), c2=getCoords(cp2);
  if(!c1||!c2) return null;
  return Math.round(haversine(c1[0],c1[1],c2[0],c2[1]));
}

// ── Calcul heures supplémentaires BTP ────────────────────────────
// Base 35h / +25% de 36h à 43h / +50% au-delà
function calcHeuresSup(totalHeures, tauxBase){
  var h35 = Math.min(totalHeures, 35);
  var h25 = Math.max(0, Math.min(totalHeures - 35, 8)); // 36→43
  var h50 = Math.max(0, totalHeures - 43);
  var brut = h35 * tauxBase + h25 * tauxBase * 1.25 + h50 * tauxBase * 1.50;
  var tauxMoyen = totalHeures > 0 ? brut / totalHeures : tauxBase;
  return { h35:h35, h25:h25, h50:h50, brut:brut, tauxMoyen:tauxMoyen };
}

// ── Calcul marge simplifié ────────────────────────────────────────
// coeff = prix facturation / taux base
function calcMargeSimple(taux, coeff, heures, ifm_pct, icp_pct, charges_pct){
  var r = calcHeuresSup(heures, taux);
  var brut = r.brut;
  var ifm = brut * (ifm_pct||0.10);
  var base_icp = brut + ifm;
  var icp = base_icp * (icp_pct||0.10);
  var base_charges = brut + ifm + icp;
  var charges = base_charges * (charges_pct||0.43);
  var cout_total = brut + ifm + icp + charges;
  var ca = r.tauxMoyen * coeff * heures;
  var marge = ca - cout_total;
  var marge_pct = ca > 0 ? (marge/ca)*100 : 0;
  return { ca:ca, cout:cout_total, marge:marge, marge_pct:marge_pct, brut:brut, ifm:ifm, icp:icp, charges:charges };
}

// ── Templates fillVars ────────────────────────────────────────────
function fillVars(txt, c, extra){
  extra = extra||{};
  var ag = getAgence();
  var dateStr = new Date().toLocaleDateString('fr-FR');
  // Agence
  txt = txt.replace(/\[AGENCE\]/g, ag.nom||'')
    .replace(/\[PRENOM_RA\]/g, ag.emetteur||'')
    .replace(/\[TEL_AGENCE\]/g, ag.tel||'')
    .replace(/\[EMAIL_AGENCE\]/g, ag.email||'')
    .replace(/\[SIGNATURE\]/g, (ag.emetteur||'')+' — '+(ag.nom||'')+'\nTél. : '+(ag.tel||'')+'\n'+(ag.email||''))
    .replace(/\[DATE\]/g, dateStr);
  // Candidat
  if(c){
    var nomAffiche=(c.prenom&&c.nom)?(c.prenom+' '+c.nom):(c.nom||c.prenom||'');
    txt = txt.replace(/\[CANDIDAT\]/g, nomAffiche)
      .replace(/\[PRENOM\]/g, c.prenom||'')
      .replace(/\[NOM\]/g, c.nom||'')
      .replace(/\[QUALIF\]/g, c.qualif||'')
      .replace(/\[TEL_CAND\]/g, c.tel||c.telephone||'')
      .replace(/\[EMAIL_CAND\]/g, c.email||'')
      .replace(/\[CP_CAND\]/g, c.cp||'')
      .replace(/\[VILLE_CAND\]/g, c.ville||c.cp||'');
  }
  // Mission
  if(c&&c._mission){
    var m=c._mission;
    txt = txt.replace(/\[CLIENT\]/g, m.client||'')
      .replace(/\[CHANTIER\]/g, m.chantier||m.adresse||'')
      .replace(/\[DEBUT_MISSION\]/g, fmt(m.debut_mission||m.date_debut||''))
      .replace(/\[FIN_MISSION\]/g, fmt(m.fin_mission||m.date_fin||''))
      .replace(/\[TAUX\]/g, m.taux_base||'')
      .replace(/\[COEFF\]/g, m.coeff||'')
      .replace(/\[SEM\]/g, extra.semaine||m.semaine||'')
      .replace(/\[CONTACT\]/g, m.contact||'');
  }
  // Extra passé en paramètre
  if(extra.semaine) txt=txt.replace(/\[SEM\]/g, extra.semaine);
  if(extra.heure)   txt=txt.replace(/\[HEURE\]/g, extra.heure);
  if(extra.client)  txt=txt.replace(/\[CLIENT\]/g, extra.client);
  return txt;
}

// ── fillVarsCRM (prospects/clients) ─────────────────────────────
function fillVarsCRM(txt, p){
  var ag = getAgence();
  var dateStr = new Date().toLocaleDateString('fr-FR');
  txt = txt.replace(/\[AGENCE\]/g, ag.nom||'')
    .replace(/\[PRENOM_RA\]/g, ag.emetteur||'')
    .replace(/\[TEL_AGENCE\]/g, ag.tel||'')
    .replace(/\[EMAIL_AGENCE\]/g, ag.email||'')
    .replace(/\[SIGNATURE\]/g, (ag.emetteur||'')+' — '+(ag.nom||'')+'\nTél. : '+(ag.tel||'')+'\n'+(ag.email||''))
    .replace(/\[DATE\]/g, dateStr);
  if(p){
    txt = txt.replace(/\[SOCIETE\]/g, p.societe||p.nom||'')
      .replace(/\[CONTACT\]/g, p.contact||'')
      .replace(/\[PRENOM_CONTACT\]/g, (p.contact||'').split(' ')[0]||'')
      .replace(/\[VILLE\]/g, p.ville||p.cp||'')
      .replace(/\[TEL_CLIENT\]/g, p.tel||'')
      .replace(/\[EMAIL_CLIENT\]/g, p.email||'')
      .replace(/\[SECTEUR\]/g, p.secteur||'');
  }
  return txt;
}

// ── Grilles tarifaires ────────────────────────────────────────────
function getGrilles(){ return dbGet(STORE.grilles); }
function saveGrilles(grilles){ dbSet(STORE.grilles, grilles); }

// ── Scoring solvabilité client ────────────────────────────────────
function scoreClient(c){
  var pts=0, max=100;
  if(c.siret && c.siret.length>=14) pts+=20;
  if(c.encours_plafond && c.encours_plafond>0) pts+=15;
  if(c.nb_interimaires_hist > 0) pts+=20;
  if(c.ca_hist > 0) pts+=15;
  if(c.delai_paiement && c.delai_paiement<=30) pts+=20;
  if(c.contact_valide) pts+=10;
  var score = Math.round(pts);
  var grade = score>=80?'A':score>=60?'B':score>=40?'C':'D';
  return {score:score, grade:grade};
}

// ── Alertes VM (visites médicales) ───────────────────────────────
function checkVM(interimaire){
  var vm = interimaire.visite_medicale||{};
  if(!vm.date_expiration) return null;
  var exp = new Date(vm.date_expiration);
  var now = new Date();
  var diff = Math.round((exp-now)/(1000*60*60*24));
  if(diff < 0) return {type:'expired', label:'VM expirée', days:diff};
  if(diff <= 30) return {type:'warning', label:'VM expire dans '+diff+' j', days:diff};
  return null;
}

// ── Alerte fin de mission ────────────────────────────────────────
function checkFinMission(mission){
  if(!mission || !mission.date_fin) return null;
  var fin = new Date(mission.date_fin);
  var now = new Date();
  var diff = Math.round((fin-now)/(1000*60*60*24));
  if(diff<=0) return {type:'expired', label:'Mission terminée', days:diff};
  if(diff<=3)  return {type:'urgent',  label:'Fin J-'+diff, days:diff};
  if(diff<=7)  return {type:'warning', label:'Fin J-'+diff, days:diff};
  return null;
}

// ── Alerte plafond encours ───────────────────────────────────────
function checkEncours(client){
  if(!client.encours_plafond || !client.encours_en_cours) return null;
  var ratio = client.encours_en_cours / client.encours_plafond;
  if(ratio > 1.0)  return {type:'danger', label:'Encours dépassé', ratio:ratio};
  if(ratio >= 0.8) return {type:'warning', label:'Encours ≥80%', ratio:ratio};
  return null;
}

// ── Navigation postMessage (module → index) ──────────────────────
function navTo(module, filterKey, filterVal){
  var data = {type:'navigate', module:module, filter:{key:filterKey||'', value:filterVal||''}};
  if(window.parent && window.parent !== window) window.parent.postMessage(data,'*');
}

// ── Import XLSX helper (SheetJS requis) ──────────────────────────
function xlsxToRows(arrayBuffer, sheetIndex){
  sheetIndex = sheetIndex||0;
  var workbook = XLSX.read(new Uint8Array(arrayBuffer), {type:'array'});
  var sheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
  return XLSX.utils.sheet_to_json(sheet, {defval:''});
}

// ── Export JSON ──────────────────────────────────────────────────
function exportJSON(data, filename){
  var blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename||'jtipilot_export.json';
  a.click();
}

function importJSON(file, callback){
  var reader = new FileReader();
  reader.onload = function(e){
    try{ callback(null, JSON.parse(e.target.result)); }
    catch(err){ callback('JSON invalide : '+err.message); }
  };
  reader.readAsText(file);
}

// ── Migration depuis anciens localStorage v4 ─────────────────────
function migrerDepuisAncienFormat(){
  var migrated = false;

  // Candidats : cands_btp_v2 → app_interimaires
  if(!localStorage.getItem(STORE.interimaires) && localStorage.getItem('cands_btp_v2')){
    try{
      var old = JSON.parse(localStorage.getItem('cands_btp_v2')||'[]');
      if(old.length>0){
        var newInts = old.map(function(c){
          return Object.assign({}, c, {
            _type: 'interimaire',
            _migre: true,
            id: c.id || uid(),
          });
        });
        dbSet(STORE.interimaires, newInts);
        console.log('[JTIPilot] Migration candidats OK : '+newInts.length+' intérimaires');
        migrated = true;
      }
    }catch(e){ console.warn('[JTIPilot] Migration candidats échouée', e); }
  }

  // CRM prospects : crm_btp_db → app_prospects
  if(!localStorage.getItem(STORE.prospects) && localStorage.getItem('crm_btp_db')){
    try{
      var oldCRM = JSON.parse(localStorage.getItem('crm_btp_db')||'[]');
      if(oldCRM.length>0){
        var newProsp = oldCRM.map(function(p){
          return Object.assign({}, p, {
            _type: p.statut==='CLIENT'||p.statut==='ACTIF' ? 'client' : 'prospect',
            _migre: true,
            id: p.id || uid(),
          });
        });
        dbSet(STORE.prospects, newProsp);
        console.log('[JTIPilot] Migration CRM OK : '+newProsp.length+' prospects/clients');
        migrated = true;
      }
    }catch(e){ console.warn('[JTIPilot] Migration CRM échouée', e); }
  }

  // Grilles : grilles_btp → app_grilles
  if(!localStorage.getItem(STORE.grilles) && localStorage.getItem('grilles_btp')){
    try{
      var oldG = JSON.parse(localStorage.getItem('grilles_btp')||'[]');
      if(oldG.length>0){ dbSet(STORE.grilles, oldG); migrated=true; }
    }catch(e){}
  }

  // Config agence : agence_btp → app_config
  if(!localStorage.getItem(STORE.config) && localStorage.getItem('agence_btp')){
    try{
      var oldAg = JSON.parse(localStorage.getItem('agence_btp')||'{}');
      var cfg = Object.assign({}, AGENCE_DEFAUT, oldAg);
      // Mapper objectifs depuis tdb_cfg si présent
      try{
        var tdb = JSON.parse(localStorage.getItem('tdb_cfg')||'{}');
        if(tdb.objEtp) cfg.obj_etp = tdb.objEtp;
        if(tdb.objMb)  cfg.obj_mb  = tdb.objMb;
        if(tdb.objRdv) cfg.obj_rdv = tdb.objRdv;
        if(tdb.objAppels) cfg.obj_appels = tdb.objAppels;
      }catch(e2){}
      dbSet(STORE.config, cfg);
      migrated=true;
    }catch(e){}
  }

  return migrated;
}

// ── Données démo ──────────────────────────────────────────────────
// Appelé si les bases sont vides (première utilisation)
function chargerDonneesDemo(){
  var TODAY = today();
  var D = function(j){ var d=new Date(); d.setDate(d.getDate()+j); return d.toISOString().split('T')[0]; };

  // Intérimaires démo
  var interimaires = [
    {id:'INT001', prenom:'Karim', nom:'Bensaïd', qualif:'Coffreur bancheur', dispo:'mission',
     tel:'06 12 34 56 78', email:'k.bensaid@mail.fr', cp:'93100', ville:'Montreuil', adresse:'12 rue Voltaire',
     experience:8, permis:'B', lastKm:12, _grille_id:'',
     visite_medicale:{aptitude:'Apte', date_visite:D(-180), date_expiration:D(185), medecin:'Dr Martin / SSTI'},
     notation:{fiabilite:5, qualite:4, relationnel:4, commentaire:'Excellent profil, toujours ponctuel'},
     habilitations_detail:{travail_hauteur:{date_obtention:D(-365), date_expiration:D(365), organisme:'AFPA', valide:true}},
     historique_missions:[
       {id:'m1', client:'VINCI Construction', chantier:'Résidence Les Ormes - Montreuil', debut:'2024-09-01', fin:'2025-02-28', taux_base:'13.50', coeff:'2.15', nb_semaines:26, valide:true},
     ],
     competences_extra:{}, experience_rows:[
       {poste:'Coffreur bancheur',entreprise:'Bouygues Bâtiment',de:'2020',a:'2024'},
       {poste:'Manœuvre BTP',entreprise:'Eiffage Construction',de:'2018',a:'2020'},
     ],
     journal:[
       {date:D(-5), type:'appel', texte:'Disponible à partir du '+fmt(D(3))+'. Cherche chantier IDF.'},
     ],
     _mission:{client:'VINCI Construction', chantier:'ZAC Plaine-Saint-Denis', date_debut:D(-45), date_fin:D(15), taux_base:'13.50', coeff:'2.15', contact:'Pierre Moreau'},
    },
    {id:'INT002', prenom:'Amara', nom:'Diallo', qualif:'Électricien du bâtiment', dispo:'dispo',
     tel:'06 98 76 54 32', email:'a.diallo@mail.fr', cp:'92100', ville:'Boulogne-Billancourt', adresse:'5 bd du Maréchal Joffre',
     experience:5, permis:'B', lastKm:8, _grille_id:'',
     visite_medicale:{aptitude:'Apte', date_visite:D(-90), date_expiration:D(275), medecin:'Dr Bernard / SSTI'},
     notation:{fiabilite:4, qualite:5, relationnel:4, commentaire:'Très bon technicien, à réactiver'},
     habilitations_detail:{
       elec_b1v:{date_obtention:D(-400), date_expiration:D(200), organisme:'FORMELEC', valide:true},
       elec_h1v:{date_obtention:D(-400), date_expiration:D(200), organisme:'FORMELEC', valide:true},
     },
     historique_missions:[
       {id:'m2', client:'Eiffage Énergie', chantier:'Centre commercial Vélizy', debut:'2024-03-01', fin:'2024-08-31', taux_base:'14.20', coeff:'2.10', nb_semaines:26, valide:true},
     ],
     competences_extra:{}, experience_rows:[
       {poste:'Électricien N3P1',entreprise:'Spie Batignolles',de:'2022',a:'2024'},
     ],
     journal:[
       {date:D(-2), type:'contact', texte:'Disponible immédiatement. Intéressé par poste superviseur.'},
     ],
    },
    {id:'INT003', prenom:'Nadia', nom:'Benali', qualif:'Technicien CVC', dispo:'preavis',
     tel:'06 55 44 33 22', email:'n.benali@mail.fr', cp:'75020', ville:'Paris 20e', adresse:'34 rue des Pyrénées',
     experience:12, permis:'B', lastKm:6, _grille_id:'',
     visite_medicale:{aptitude:'Apte', date_visite:D(-60), date_expiration:D(305), medecin:'Dr Chen / SSTI'},
     notation:{fiabilite:5, qualite:5, relationnel:5, commentaire:'Profil rare — expertise froid + GTB'},
     habilitations_detail:{
       fluides_i:{date_obtention:D(-730), date_expiration:D(95), organisme:'QUALICLIMAFROID', valide:true},
       elec_b1v:{date_obtention:D(-500), date_expiration:D(230), organisme:'FORMELEC', valide:true},
     },
     historique_missions:[
       {id:'m3', client:'Dalkia', chantier:'Tour Montparnasse maintenance CVC', debut:'2023-01-01', fin:'2024-12-31', taux_base:'16.80', coeff:'2.05', nb_semaines:52, valide:true},
     ],
     competences_extra:{}, experience_rows:[
       {poste:'Technicien CVC senior',entreprise:'Dalkia',de:'2023',a:'2025'},
       {poste:'Technicien frigoriste',entreprise:'Axima Réfrigération',de:'2018',a:'2023'},
     ],
     journal:[
       {date:D(-1), type:'appel', texte:'Préavis en cours, fin le '+fmt(D(12))+'. Cherche poste technique IDF.'},
     ],
     _mission:{client:'Dalkia', chantier:'Tour Montparnasse', date_debut:D(-400), date_fin:D(12), taux_base:'16.80', coeff:'2.05', contact:'Sophie Laurent'},
    },
    {id:'INT004', prenom:'Florian', nom:'Marchand', qualif:'Maçon', dispo:'mission',
     tel:'06 11 22 33 44', email:'f.marchand@mail.fr', cp:'94300', ville:'Vincennes', adresse:'7 av du Château',
     experience:3, permis:'', lastKm:15, _grille_id:'',
     visite_medicale:{aptitude:'Apte', date_visite:D(-20), date_expiration:D(345), medecin:'Dr Petit / SSTI'},
     notation:{fiabilite:3, qualite:3, relationnel:4, commentaire:'Junior, en progression'},
     habilitations_detail:{},
     historique_missions:[],
     competences_extra:{}, experience_rows:[
       {poste:'Maçon N2',entreprise:'Bouygues Bâtiment',de:'2023',a:'2025'},
     ],
     journal:[],
     _mission:{client:'GTM Construction', chantier:'Logements Vincennes', date_debut:D(-30), date_fin:D(60), taux_base:'12.50', coeff:'2.20', contact:'Marc Dupont'},
    },
    {id:'INT005', prenom:'Sébastien', nom:'Leroux', qualif:'Plombier chauffagiste', dispo:'dispo',
     tel:'06 77 88 99 00', email:'s.leroux@mail.fr', cp:'78000', ville:'Versailles', adresse:'15 rue du Marché',
     experience:9, permis:'B', lastKm:28, _grille_id:'',
     visite_medicale:{aptitude:'Apte mais à renouveler', date_visite:D(-340), date_expiration:D(25), medecin:'Dr Rousseau / SSTI'},
     notation:{fiabilite:4, qualite:4, relationnel:5, commentaire:'Très bon contact client'},
     habilitations_detail:{},
     historique_missions:[
       {id:'m5', client:'Batigère', chantier:'Réhabilitation Versailles', debut:'2024-04-01', fin:'2024-09-30', taux_base:'13.80', coeff:'2.10', nb_semaines:26, valide:true},
     ],
     competences_extra:{}, experience_rows:[],
     journal:[
       {date:D(-10), type:'contact', texte:'Cherche mission longue durée secteur 78-92.'},
     ],
    },
  ];

  // Prospects / Clients démo
  var prospects = [
    {id:'PRO001', _type:'client', societe:'VINCI Construction IDF', contact:'Pierre Moreau', poste:'Responsable RH', tel:'01 47 XX XX 01', email:'p.moreau@vinci.fr', cp:'93200', ville:'Saint-Denis', secteur:'Gros Œuvre', statut:'CLIENT_ACTIF',
     nb_interimaires_hist:12, ca_hist:180000, encours_plafond:50000, encours_en_cours:32000, contact_valide:true, delai_paiement:30, siret:'55218187100021',
     score:'A', placements:[
       {date:'2024-09-01', fin:'2025-02-28', nb_interimaires:3, ca:45000, marge_pct:17.2, intitule:'Logements ZAC Plaine-Saint-Denis'},
     ],
     journal:[
       {date:D(-30), type:'rdv', texte:'RDV site, validation 3 coffreurs supplémentaires.'},
       {date:D(-5), type:'appel', texte:'Relance pour besoin prochain trimestre — à recontacter fin du mois.'},
     ],
    },
    {id:'PRO002', _type:'client', societe:'Eiffage Énergie Systèmes', contact:'Christine Vidal', poste:'Chef de projet', tel:'01 46 XX XX 02', email:'c.vidal@eiffage.fr', cp:'92400', ville:'Courbevoie', secteur:'CVC / Génie Climatique', statut:'CLIENT_ACTIF',
     nb_interimaires_hist:6, ca_hist:95000, encours_plafond:30000, encours_en_cours:8000, contact_valide:true, delai_paiement:45, siret:'55226965800025',
     score:'B', placements:[],
     journal:[
       {date:D(-60), type:'rdv', texte:'Présentation agence. Intéressée par profils CVC.'},
     ],
    },
    {id:'PRO003', _type:'prospect', societe:'Bouygues Immobilier Résidentiel', contact:'Marc Dubois', poste:'Directeur travaux', tel:'01 XX XX XX 03', email:'m.dubois@bouygues.fr', cp:'78280', ville:'Guyancourt', secteur:'Second Œuvre', statut:'CHAUD',
     nb_interimaires_hist:0, ca_hist:0, encours_plafond:0, encours_en_cours:0, contact_valide:true, delai_paiement:null, siret:'',
     score:'C', placements:[],
     journal:[
       {date:D(-7), type:'appel', texte:'Premier contact LinkedIn. Chantier résidentiel 120 logements. Cherche électriciens.'},
       {date:D(-3), type:'email', texte:'Envoi book agence et références BTP.'},
     ],
    },
    {id:'PRO004', _type:'prospect', societe:'Spie Batignolles Ouest', contact:'Fabrice Renard', poste:'Chef d\'agence', tel:'01 XX XX XX 04', email:'f.renard@spie.fr', cp:'92300', ville:'Levallois-Perret', secteur:'TP / Génie Civil', statut:'TIEDE',
     nb_interimaires_hist:0, ca_hist:0, encours_plafond:0, encours_en_cours:0, contact_valide:false, delai_paiement:null, siret:'',
     score:'D', placements:[],
     journal:[
       {date:D(-45), type:'appel', texte:'Appel froid — pas de besoin immédiat. Rappel dans 2 mois.'},
     ],
    },
    {id:'PRO005', _type:'client', societe:'Dalkia Services Énergie', contact:'Sophie Laurent', poste:'RH opérationnel', tel:'01 XX XX XX 05', email:'s.laurent@dalkia.fr', cp:'75008', ville:'Paris 8e', secteur:'CVC / Maintenance', statut:'CLIENT_ACTIF',
     nb_interimaires_hist:8, ca_hist:210000, encours_plafond:60000, encours_en_cours:52000, contact_valide:true, delai_paiement:30, siret:'30828837400024',
     score:'A', placements:[
       {date:'2023-01-01', fin:'2024-12-31', nb_interimaires:4, ca:85000, marge_pct:18.5, intitule:'Maintenance CVC sites tertiaires Paris'},
     ],
     journal:[
       {date:D(-15), type:'rdv', texte:'Renouvellement contrat annuel — 4 profils CVC dont 1 GTB.'},
     ],
    },
  ];

  // Missions démo
  var missions = [
    {id:'MIS001', _type:'mission', titre:'Coffreur bancheur — ZAC Plaine-Saint-Denis', statut:'EN_COURS',
     client_id:'PRO001', client_nom:'VINCI Construction IDF', chantier:'ZAC Plaine-Saint-Denis - Bat. B2',
     contact:'Pierre Moreau', adresse_chantier:'Av. du Stade de France, 93200 Saint-Denis', cp_chantier:'93200',
     interimaire_id:'INT001', interimaire_nom:'Karim Bensaïd',
     qualif:'Coffreur bancheur', taux_base:'13.50', coeff:'2.15',
     date_debut:D(-45), date_fin:D(15), nb_heures_sem:39, type_contrat:'CTM',
     motif:'Accroissement d\'activité', motif_detail:'Chantier logements neufs phase 2',
     journal:[
       {date:D(-45), texte:'Démarrage mission — accueil sécurité effectué.'},
       {date:D(-7), texte:'Demande prolongation 2 semaines en cours.'},
     ],
    },
    {id:'MIS002', _type:'mission', titre:'Technicienne CVC — Dalkia Tour Montparnasse', statut:'EN_COURS',
     client_id:'PRO005', client_nom:'Dalkia Services Énergie', chantier:'Tour Montparnasse - Exploitation CVC',
     contact:'Sophie Laurent', adresse_chantier:'33 av. du Maine, 75015 Paris', cp_chantier:'75015',
     interimaire_id:'INT003', interimaire_nom:'Nadia Benali',
     qualif:'Technicien CVC', taux_base:'16.80', coeff:'2.05',
     date_debut:D(-400), date_fin:D(12), nb_heures_sem:35, type_contrat:'CTM',
     motif:'Remplacement', motif_detail:'Remplacement salarié en arrêt maladie',
     journal:[
       {date:D(-400), texte:'Démarrage — profil validé par chef de site.'},
     ],
    },
    {id:'MIS003', _type:'mission', titre:'Maçon — Logements Vincennes', statut:'EN_COURS',
     client_id:'PRO001', client_nom:'VINCI Construction IDF', chantier:'Résidence du Château - Vincennes',
     contact:'Marc Dupont', adresse_chantier:'Rue du Château, 94300 Vincennes', cp_chantier:'94300',
     interimaire_id:'INT004', interimaire_nom:'Florian Marchand',
     qualif:'Maçon', taux_base:'12.50', coeff:'2.20',
     date_debut:D(-30), date_fin:D(60), nb_heures_sem:39, type_contrat:'CTM',
     motif:'Accroissement d\'activité', motif_detail:'Maçonnerie corps d\'état',
     journal:[],
    },
  ];

  dbSet(STORE.interimaires, interimaires);
  dbSet(STORE.prospects, prospects);
  dbSet(STORE.missions, missions);
  dbSet(STORE.config, Object.assign({}, AGENCE_DEFAUT, {
    nom: 'JTIPilot BTP — Démo',
    emetteur: 'Jonathan T.',
    tel: '06 XX XX XX XX',
    email: 'jt@jtipilot.fr',
    obj_etp: 15, obj_mb: 18, obj_rdv: 5, obj_appels: 20,
  }));

  console.log('[JTIPilot] Données démo chargées');
}

// ── Initialisation ────────────────────────────────────────────────
function initCore(){
  // Tenter migration depuis ancien format
  var migrated = migrerDepuisAncienFormat();
  
  // Si toujours vide (première installation) → charger démo
  var ints = dbGet(STORE.interimaires);
  var pros = dbGet(STORE.prospects);
  if(ints.length===0 && pros.length===0 && !migrated){
    chargerDonneesDemo();
  }
}

// Auto-init si pas d'index
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', initCore);
} else {
  initCore();
}
