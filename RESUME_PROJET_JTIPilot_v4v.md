# RÉSUMÉ COMPLET — JTIPilot v4v (16 mars 2026)
## Document de transfert pour Gemini / DeepSeek — Base de travail : ZIP v4v

---

## 1. QUI EST JT ET QUEL EST L'OBJECTIF

**Jonathan TIMMIAH (JT)**, 46 ans, TDAH sévère, Responsable d'Agence intérim BTP Île-de-France, en recherche active de poste RA (cible >3 600€/mois, Paris intramuros).

Il développe **JTIPilot**, un outil de pilotage de son agence intérim BTP, 100% navigateur, sans serveur, sans framework, sans build step. Tout est en HTML/CSS/JS pur avec localStorage.

**Contraintes absolues :**
- 100% statique, déployé sur GitHub Pages
- Zéro dépendance serveur, zéro backend
- Tout le stockage dans localStorage du navigateur
- Pas de npm, pas de webpack, pas de React
- Compatible tous navigateurs modernes sans transpilation

---

## 2. ARCHITECTURE TECHNIQUE FONDAMENTALE

### Structure fichiers (v4v)
```
index.html         56 Ko   Shell principal + nav + dashboard KPIs
crm2.html         107 Ko   CRM prospects/clients, pipeline, besoins, propale
candidats2.html   410 Ko   Base candidats BTP, missions, compétences, ROME DB
missions.html      60 Ko   Suivi missions actives/clôturées
clients.html       61 Ko   Fiche client complète 6 onglets
marge2.html        53 Ko   Calculateur marge + propale imprimable + grilles
tdb.html           58 Ko   Tableau de bord KPIs temps réel
pl.html            39 Ko   Simulateur P&L agence
juridique.html     60 Ko   Guide juridique intérim (statique)
objections.html    49 Ko   Gestion objections direction (statique)
rome.html         150 Ko   Guide 52 fiches métiers ROME France Travail
shared.css          2 Ko   Variables CSS communes + thème light/dark
import_demo.html   12 Ko   Import XLSX logiciel intérim (Comète, Anael, Sigma)
```

### Shell index.html — pattern CRITIQUE
`index.html` charge TOUTES les iframes au démarrage avec `src` fixe (jamais rechargé dynamiquement) :
```html
<iframe id="if-tdb"        src="tdb.html"></iframe>
<iframe id="if-crm"        src="crm2.html"></iframe>
<iframe id="if-candidats"  src="candidats2.html"></iframe>
<iframe id="if-marge"      src="marge2.html"></iframe>
<iframe id="if-pl"         src="pl.html"></iframe>
<iframe id="if-clients"    src="clients.html"></iframe>
<iframe id="if-juridique"  src="juridique.html"></iframe>
<iframe id="if-objections" src="objections.html"></iframe>
<iframe id="if-missions"   src="missions.html"></iframe>
<iframe id="if-rome"       src="rome.html"></iframe>
```

Affichage/masquage via CSS uniquement :
```css
.content iframe { width:100%; height:100%; border:none; display:none; }
.content iframe.active { display:block; }
```

### Communication inter-modules (postMessage)
**index → iframes :**
- `{type:'theme', value:'light'|'dark'}` — propagation thème
- `{type:'nav_filter', ...}` — filtre navigation

**iframes → index :**
- `{type:'navigate', module:'missions', prefill:{client:'...'}}` — navigation avec prefill
- `{type:'missions_updated', count:N}` — badge missions dans nav
- `{type:'crm_updated'}` — rafraîchir KPIs

**Pattern double envoi (absorber délais init) :** postMessage envoyé à 80ms ET 400ms.

### localStorage — clés et propriétaires
```
crm_btp_db       → crm2.html          Array de prospects/clients (lu par tout)
cands_btp_v2     → candidats2.html    Array de candidats/intérimaires
jtp_missions     → missions.html      Array de missions
flc_clients      → clients.html       Array de fiches clients étendues
grilles_btp      → candidats2.html    Grilles tarifaires accord-cadre
jtp_theme        → index.html         'light' | 'dark'
tdb_cfg          → tdb.html           Config objectifs RA
crm_kpi_semaine  → tdb.html           KPIs hebdo
```

---

## 3. MODÈLES DE DONNÉES

### Prospect/Client CRM (crm_btp_db)
```javascript
{
  id: 'uid_xxx',          // uid() = Date.now().toString(36) + random
  nom: 'VINCI CONSTRUCTION',
  metier: 'Maconnerie / Gros oeuvre',
  statut: 'froid'|'tiede'|'chaud'|'client'|'veille',
  decideur: 'M. Dupont',
  tel: '01 23 45 67 89',
  email: 'contact@...',
  zone: 'Paris 15e',
  taille: 'PME (10-49)',
  notes: 'Contexte...',
  nextType: 'appel'|'email'|'rdv'|'relance'|'cv',
  nextDate: '2026-03-20',
  nextDetail: 'Rappeler jeudi 10h',
  journal: [{id, type, date, texte}],
  besoins: [{
    id, qualif, nb, date, duree, statut:'ouvert'|'pourvu'|'annule',
    habilit, notes, tauxClient, horaires, adresse, cp, ville,
    cvs: [{id, candidat, date, taux, tauxClient, retour:'silence'|'accepte'|'refuse',
            mission:'non'|'oui', notes, contact_mission}]
  }],
  contacts_list: [{nom, fn, role:'decideur'|'commandes'|'admin'|'chantier'|'autre',
                   tel, mobile, email, notes}],
  qualifs: ['Plaquiste', 'Staffeur / Stuqueur', ...]  // qualifs cochées
}
```

### Candidat/Intérimaire (cands_btp_v2)
```javascript
{
  id: 'uid_xxx',
  nom: 'TARE', prenom: 'Guy',
  qualif: 'Staffeur / Stuqueur',
  niveau: 'N4',
  taux: '17',           // taux brut actuel €/h
  pretention: '18',
  tel: '06 12 34 56 78',
  email: 'guy.tare@mail.fr',
  cp: '75014', ville: 'Paris 14', rue: '12 rue...',
  mobilite: 'IDF entière',
  vehicule: '2 roues',
  dispo: 'mission'|'dispo'|'preavis'|'indispo',
  dispo_date: '2026-04-01',
  taille_vet: 'L', taille_chaussures: '44',
  notes: 'Très bon staffeur...',
  anon: false,            // anonymiser CV client
  exp_annees: '8',
  langues: 'Français, Arabe',
  permis: 'Permis B sans véhicule',
  outillage_perso: 'Oui — outillage partiel',
  embauche: 'Non — intérim uniquement',
  zone_mobilite: ['Paris (75)', 'Hauts-de-Seine (92)'],
  experiences: [{poste, employeur, de, a, description}],
  mission: {
    client: 'SOE STUC ET STAFF',
    contact: 'M. Samir OUALI',
    contact_tel: '06...',
    contact_email: 'contact@...',
    adresse: '15 rue de Rivoli 75001',
    cp_chantier: '75001', ville_chantier: 'Paris',
    horaires: '08h00–17h00 · Lundi au Vendredi',
    h_debut_matin: '08h00', h_fin_matin: '12h00',
    h_debut_am: '13h00', h_fin_journee: '17h00',
    h_jours: 'Lundi au Vendredi',
    h_pause: 'Sans coupure',
    base_contractuelle: '39h/sem',
    date_debut: '2026-01-15', date_fin: '2026-04-30',
    tc: '28', coeff: '2.15'
  },
  journal: [{id, type, date, texte}],
  checks: {},             // checklist items
  competences: {},        // compétences cochées par famille
  historique_missions: [{client, qualif, date_debut, date_fin, tc, tb, note, hsem, archivedAt}],
  cvs_envoyes: [{id, date, client, qualif, taux, notes}],
  propales_envoyees: [{id, date, client, qualif, taux, notes}],
  visite_medicale: {aptitude, date_visite, date_expiration, medecin},
  habilitations_detail: {travail_hauteur:{date_obtention, date_expiration, organisme, valide}},
  notation: {fiabilite, qualite, relationnel, commentaire},
  createdAt: '2026-01-01'
}
```

### Mission (jtp_missions)
```javascript
{
  id: 'm_' + Date.now(),
  client: 'VINCI Construction',
  contact: 'M. Dupont',     // ← ajouté v4v depuis contacts_list CRM
  interimaire: 'TARE Guy',
  qualif: 'Staffeur / Stuqueur',
  statut: 'pending'|'active'|'closed',
  debut: '2026-01-15',
  fin: '2026-04-30',
  finReelle: null,
  txh: 28,                  // taux client €/h
  coeff: 2.15,
  chantier: '15 rue de Rivoli 75001',
  contrat: 'CTR-2026-042',
  notes: '...',
  motifCloture: null,
  commentaireCloture: null,
  updatedAt: '2026-03-16T...'
}
```

### Fiche Client étendue (flc_clients — clients.html)
```javascript
{
  id: 'uid_xxx',
  nom: 'ARTISAN PLATERIE',
  statut: 'client'|'prospect'|'inactif',
  origine: 'Appel entrant',
  secteur: 'Platrerie / Plaquiste',
  taille: 'TPE (1-9)',
  forme_jur: 'SARL',
  siret: '123 456 789 00012',
  n_client: 'CLI-042',
  adresse: '75 rue de la Paix 75002 Paris',
  zones: ['Paris (75)'],
  web: 'www...',
  coeff: 2.15, delai_pmt: 30, encours_max: 15000, acompte: false,
  contacts: [{nom, fn, role, tel, mobile, email, site, notes}],
  qualifs: ['Plaquiste', 'Staffeur / Stuqueur'],
  docs_a_recevoir: [{nom, cochage:false, horodatage:''}],
  docs_envoyes: [{nom, cochage:false, horodatage:''}],
  journal: [{id, type, date, texte, prochaine_action, prochaine_date}],
  scoring: {ca_annuel, anciennete, taille_score, infogreffe:true, delai_pmt, incidents:false, procedures:false, capital},
  createdAt: '2026-01-01'
}
```

---

## 4. LISTE ROME COMPLÈTE — 51 MÉTIERS, 8 FAMILLES

**Cette liste est utilisée dans TOUS les modules. Ne jamais la modifier partiellement. Synchroniser partout.**

```
GROS OEUVRE:
  Macon, Macon VRD, Macon Finisseur, Coffreur-Bancheur, Ferrailleur,
  Charpentier Bois, Charpentier Metallique, Couvreur, Etancheur, Demolisseur

SECOND OEUVRE:
  Plaquiste, Platrerie / Staff, Staffeur / Stuqueur, Peintre en batiment,
  Facadier, Solier / Moquettiste, Carreleur, Menuisier Poseur,
  Menuisier Atelier, Serrurier / Metallier, Calorifugeur, Echafaudeur

CVC / PLOMBERIE:
  Technicien CVC, Chauffagiste, Plombier Sanitaire, Installateur CVC,
  Technicien Frigoriste, Technicien Maintenance Batiment

ELECTRICITE:
  Electricien CFO, Electricien CFA, Tireur de Cables, Technicien Automatisme

ENGINS / LEVAGE:
  Conducteur Engins (CACES R482), Grutier (CACES R487),
  Conducteur Grue Mobile, Conducteur Nacelle (PEMP),
  Mecanicien Engins Chantier, Cariste (CACES R489)

TRAVAUX PUBLICS:
  Canalisateur, Asphalteur, Poseur de Bordures, Ouvrier VRD

ENCADREMENT:
  Chef de Chantier, Conducteur de Travaux, Chef Equipe, Animateur QSE

BUREAU D'ETUDES:
  Dessinateur Projeteur, Metreuse / Economiste, Ingenieur CVC,
  Operateur Topographe, Responsable QSE
```

---

## 5. ESTHÉTIQUE ET DESIGN — RÈGLES ABSOLUES À CONSERVER

### Palette couleurs (thème dark — défaut)
```css
--bg: #0f1117;          /* fond principal */
--surface: #181c27;     /* cartes/panels */
--surface2: #1e2335;    /* inputs, fonds secondaires */
--surface3: #242840;    /* états hover */
--border: #2a3050;
--border2: #323860;
--accent: #f97316;      /* orange — actions principales, CTA */
--blue: #3b82f6;        /* info, liens */
--green: #22c55e;       /* succès, disponible */
--warn: #ef4444;        /* danger, retard */
--yellow: #fbbf24;      /* alertes douces */
--cyan: #06b6d4;        /* données calculées, hints */
--purple: #a855f7;      /* accent secondaire */
--text: #e2e8f0;
--muted: #64748b;
--muted2: #94a3b8;
--mono: 'IBM Plex Mono', monospace;  /* tous les chiffres, codes, KPIs */
--sans: 'IBM Plex Sans', sans-serif; /* texte courant */
```

**Important v4v :** tdb.html utilise DM Mono (déjà importé) pour --display au lieu de Syne (illisible).

### Thème clair (shared.css)
Activé via `document.documentElement.classList.add('light')` et persisté dans `jtp_theme`.
Propagé aux iframes via `postMessage({type:'theme', value:'light'})`.

### Règles de style inviolables
- Police MONO pour tous les KPIs, taux, codes, dates, badges
- Orange (`--accent: #f97316`) = actions principales uniquement
- Badge statuts : `.pc-status` avec classes `s-froid/tiede/chaud/client/veille`
- Pas de dépendances CSS externes (tout inline ou dans le `<style>` du fichier)
- Scrollbar custom harmonisée via `shared.css`
- Modals : `.modal-overlay` avec `display:none` → `display:flex` via `.open`
- iframes sans border, 100% width/height dans leur conteneur

---

## 6. ONGLETS PAR MODULE

### crm2.html — Fiche prospect/client
`JOURNAL | CONTACTS (N) | BESOINS & CV | QUALIFICATIONS | PROCHAINE ACTION`

### candidats2.html — Fiche candidat/intérimaire
`IDENTITÉ | CHECKLIST | COMPÉTENCES | HABILIT. | JOURNAL | MISSION | HISTORIQUE | TRAJET`

### clients.html — Fiche client étendue
`IDENTITÉ | CONTACTS (N) | QUALIFICATIONS | DOCUMENTS | JOURNAL (N) | SCORING`

### index.html — Navigation principale
Dashboard → Missions → Fiche Marge → CRM → Candidats → Tableau de Bord → Simulateur P&L → Fiches Métiers ROME → Guide Juridique → Objections → Import → Export JSON

---

## 7. RÈGLES TECHNIQUES CRITIQUES — NE JAMAIS VIOLER

### R1 : Apostrophes françaises dans les strings JS
```javascript
// FAUX — casse le parseur
var txt = 'En cas d'absence...';
// CORRECT
var txt = "En cas d'absence...";
var txt2 = 'En cas d\'absence...';
```

### R2 : HTML avec onclick dans du JS (pattern du projet)
```javascript
// MAUVAIS — JSON.stringify produit des guillemets qui cassent l'attribut
html += '<div onclick="fn(' + JSON.stringify(id) + ')">';
// CORRECT — apostrophes simples dans attribut double-quoté
html += '<div onclick="fn(\'' + id + '\',\'' + qEsc + '\')">';
```

### R3 : Event listeners sur innerHTML (pattern OBLIGATOIRE du projet)
Quand on fait `parent.innerHTML = ...`, les event listeners sont perdus.
**Solution du projet :** onclick inline dans la string HTML (le plus robuste).
```javascript
// Toujours utiliser des onclick inline, jamais addEventListener après injection innerHTML
html += '<button onclick="maFonction(\'' + id + '\')">OK</button>';
```

### R4 : Génération de fichiers HTML en Python (JAMAIS heredoc bash)
```python
# TOUJOURS écrire les fichiers HTML/JS en Python
with open('fichier.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
# JAMAIS : cat << 'EOF' > fichier.html (échappe les apostrophes en \' dans le résultat)
```

### R5 : Validation JS obligatoire
```bash
# Extraire les scripts et valider avec node
node --check script.js
```
Utiliser le script Python d'extraction qui respecte `<\/script>` dans les strings.

### R6 : replace('</body>', ...) dans fichiers complexes
**DANGER** si le fichier contient des strings JS avec `</body>` (ex: templates PDF).
Toujours utiliser `rfind` ou insertion par numéro de ligne.

### R7 : Modals — utiliser `.modal-overlay` (pas `.modal-bg`)
CSS défini = `.modal-overlay`. Utiliser `.classList.add('open')` / `.classList.remove('open')`.

### R8 : Double `<script>` dans `<head>` interdit
Les fonctions JS dans le `<head>` qui référencent `DB` (définie dans le `<body>`) provoquent des erreurs silencieuses. Tout le JS applicatif doit être dans le `<body>`.

---

## 8. CE QUI A ÉTÉ FAIT DANS LES DERNIÈRES SESSIONS (→ v4v)

### Session précédente (v4t — 15 mars 2026)
- Contacts multiples dans fiche CRM (onglet + modal `modal-crm-contact`)
- Propale CRM avec autocomplete client (datalist `dl-pb-clients`)
- Lieu mission avec liste déroulante intelligente
- Création mission depuis fiche client CRM (`creerMissionDepuisCRM`)
- Qualifications ROME exhaustives (51 métiers) synchronisées partout
- Guide ROME 52 fiches `rome.html`
- Événements mission (⚡ ÉVÉNEMENT) avec 6 types
- CVs envoyés + propales archivées dans onglet HISTORIQUE (candidats2)
- Thème clair propagé aux iframes
- KPI besoins ouverts corrigé dans TDB

### Session courante (v4v — 16 mars 2026)

#### crm2.html — 5 bugs corrigés
1. **Bug JS affiché top-right** : l'`onclick` du bouton PROPALE contenait des guillemets doubles imbriqués dans un attribut HTML double-quoté → le navigateur affichait le JS en texte. Corrigé : extracté en `function openPropaleToolbar()`.
2. **Modal contacts mal positionnée** : utilisait `class="modal-bg"` (CSS inexistant) → corrigé en `class="modal-overlay"`.
3. **Double `<script>` dans `<head>`** : les fonctions contacts étaient dupliquées et exécutées avant `DB`. Supprimé.
4. **Modal CV sans sélection** : ajouté datalist candidats depuis `cands_btp_v2` + select contact client depuis `p.contacts_list`.
5. **Propale sans contacts auto** : `pb_contact` avec datalist `dl-pb-contacts` peuplé depuis `contacts_list` du client sélectionné.

#### tdb.html — police illisible
- Syne (police décorative) → **DM Mono** pour `--display`. Les KPIs (marge, CA, coeff, ETP) sont maintenant lisibles.

#### candidats2.html — 3 corrections
1. **Import CV "Failed to fetch"** : l'appel `api.anthropic.com` est bloqué par CORS en production GitHub Pages. Remplacé par un **parser regex local** sans réseau : extrait nom/prénom, téléphone, email, CP/ville, taux brut depuis le texte du PDF/DOC.
2. **Nouvel onglet MISSION** ajouté entre JOURNAL et HISTORIQUE : formulaire complet (client datalist CRM, contact auto depuis `contacts_list`, adresse, horaires détaillés, dates, TC/coeff, anonymisation). Fonctions : `renderMissionCourante`, `saveMissionOnglet`, `onMisClientInput`, `buildHoraires2`, `resoudreMissionCP2`.
3. **CV ENVOYÉ déjà intégré dans HISTORIQUE** (pas de bloc flottant séparé) — c'était déjà le cas, confirmé.

#### missions.html — contact client
- Champ **Contact client** ajouté dans le modal nouvelle mission, peuplé automatiquement depuis `contacts_list` du CRM à l'input du client. Sauvegardé dans `m.contact`. Fonction `onClientInputMission`.

#### marge2.html — grilles tarifaires
- `onchange="chargerGrilleQualif()"` sur le select `p_qualif` : quand on choisit une qualification, le taux client (`p_txclient`) se pré-remplit depuis `grilles_btp` (localStorage). Badge hint indicatif `#grille-hint`.

---

## 9. BACKLOG RESTANT (non implémenté)

- [ ] Vue "Today" consolidée — actions CRM en retard + missions qui expirent + candidats en préavis (dans index.html dashboard)
- [ ] Raccourcis clavier — N=nouveau, F=focus recherche, Échap=fermer modal
- [ ] Badge "non lu" sur sous-menus nav — actions CRM en retard
- [ ] Création de mission depuis la fiche candidat avec lien CRM automatique (ex: bouton dans onglet MISSION qui crée aussi dans jtp_missions)
- [ ] Fiche client complète dans missions.html (accès depuis détail mission)
- [ ] Synchronisation KPIs CVs envoyés / propales → dashboard tdb.html
- [ ] Breadcrumb contextuel dans les iframes
- [ ] Import CV : améliorer le parser regex pour les PDF plus complexes (extraction par zones visuelles)

---

## 10. INTERCONNEXIONS ENTRE MODULES — ÉTAT v4v

### Flux contacts (IMPLÉMENTÉ)
```
CRM Fiche → onglet CONTACTS → contacts_list[]
    ↓ sélection dans modal CV → contact_mission sauvegardé dans cvs[]
    ↓ ouverture propale → pb_contact auto-rempli
    ↓ création mission → f-contact auto-rempli depuis CRM
    ↓ onglet MISSION candidat → contact auto depuis CRM
```

### Flux mission (IMPLÉMENTÉ)
```
Fiche CRM → bouton ➕ MISSION → postMessage(navigate, missions, prefill:{client})
    → index.html stocke prefill dans sessionStorage
    → missions.html lit prefill au chargement → modal pré-rempli

Fiche Candidat → onglet MISSION → saveMissionOnglet() → sauvegarde c.mission
    → candidat passe en statut "mission"
    → missions.html sync auto depuis cands_btp_v2
```

### Flux qualifications (SYNCHRONISÉ partout)
- crm2.html : modal besoin `b_qualif` + propale `pb_qualif`
- candidats2.html : select `c_qualif` + ROME_DB + METIERS aliases
- missions.html : select `f-qualif`
- marge2.html : select `p_qualif` + lecture grilles
- clients.html : onglet QUALIFICATIONS + propale

### Flux grilles tarifaires
```
clients.html (buildGrillesModal) → grilles_btp localStorage
    → candidats2.html (saveGrilles / GRILLES var)
    → marge2.html (chargerGrilleQualif → p_txclient auto)
```

---

## 11. CONTRAINTES STYLE COMMUNICATION JT

- **TDAH sévère** : réponses courtes, structurées, directes. Pas de blabla.
- Utilise des lettres/chiffres pour répondre (ex : "B3 B1 B2") → proposer les options de cette façon.
- Préfère les solutions pragmatiques qui marchent plutôt que les solutions "propres" mais longues.
- Ne pas demander confirmation sur ce qui est évident.
- **Ne jamais sacrifier une feature existante** pour en ajouter une nouvelle — tout s'additionne, rien ne se retire.
- L'esthétique sombre IBM Plex Mono/Sans est une identité, pas une préférence. Ne jamais la modifier sans instruction explicite.
- Le projet est une démonstration de ses compétences RA BTP → chaque module doit être impeccable métier.

---

## 12. PATTERN DÉPLOIEMENT

Déploiement : **GitHub Pages** (branche main, dossier racine).
Pas de fichier `_config.yml` nécessaire.
Accès direct aux fichiers HTML via l'URL publique.
Pas d'authentification côté client (l'`_htaccess` et `gen_htpasswd.py` sont là pour un éventuel serveur Apache mais inutilisés sur GitHub Pages).

---

## 13. POINTS DE VIGILANCE POUR TOUTE MODIFICATION

1. **Tester la syntaxe JS** avant de livrer (`node --check`). Ne jamais livrer un fichier avec une erreur JS.
2. **Ne jamais utiliser heredoc bash** pour écrire du HTML/JS. Toujours Python.
3. **Vérifier les `<\/script>`** dans les strings JS lors de l'extraction des scripts pour validation.
4. **Les modals dans le body statique** : la modal `modal-crm-contact` dans crm2.html est dans le DOM statique, peuplée via `openCRMContactModal()`. Ne pas la déplacer dans le JS dynamique.
5. **La fonction `esc()`** est définie dans chaque fichier séparément. Ne pas supposer qu'elle est globale.
6. **Les IDs des iframes** (`if-crm`, `if-candidats`, etc.) doivent correspondre aux noms de modules utilisés dans les postMessage navigate.
7. **Ne pas toucher à rome.html** (150Ko, statique, ROME_DB embarquée) sauf pour des corrections mineures.
8. **Import CV** : l'appel `api.anthropic.com` est BLOQUÉ par CORS en production. Utiliser uniquement le parser regex local (v4v).
