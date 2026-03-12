/* ═══════════════════════════════════════════════════════
   JTIPILOT — Données de démonstration BTP
   8 intérimaires · 6 clients · 4 missions fictifs
   Chargé via <script src="data_demo.js"> dans chaque module
═══════════════════════════════════════════════════════ */

var DEMO_INTERIMAIRES = [
  {
    id: 'int_001',
    nom: 'MARTINEZ', prenom: 'Carlos',
    qualif: 'Maçon N2', niveau: 'N2', taux: '16.50', pretention: '17.00',
    tel: '06 12 34 56 78', email: 'c.martinez@mail.fr',
    cp: '93200', ville: 'Saint-Denis',
    mobilite: 'IDF', vehicule: 'oui',
    dispo: 'disponible', dispo_date: '',
    source: 'Inscription directe', source_detail: '',
    exp_annees: '8', langues: 'Français, Espagnol',
    permis: 'B', acompte: 'non', acompte_montant: '',
    notes: 'Excellent maçon, très sérieux. Travaille bien en autonomie. Cherche du gros œuvre Paris/92.',
    mission: {
      client: '', adresse: '', contact: '', contact_tel: '',
      date_debut: '', date_fin: '', horaires: '7h-16h', cp_chantier: '', ville_chantier: ''
    },
    checks: {
      doc_id: true, doc_id_date: '2024-01-15',
      doc_titre_sejour: false,
      doc_rib: true, doc_rib_date: '2024-01-15',
      doc_ss: true, doc_ss_date: '2024-01-15',
      doc_attestation_urssaf: true, doc_attestation_urssaf_date: '2024-03-01',
      doc_visite_med: true, doc_visite_med_date: '2023-11-20',
      hab_carte_btp: true, hab_carte_btp_date: '2022-06-01',
      hab_travail_hauteur: true, hab_travail_hauteur_date: '2023-04-12',
      epi_chaussures: true, taille_chaussures_epi: '43',
      epi_casque: true, epi_gilet_hv: true
    },
    habilitations_detail: [
      { id: 'caces_r482_a', label: 'CACES R482 cat. A', num: 'R482-001234', date_obtention: '2021-05-10', date_expiration: '2026-05-10', organisme: 'APAVE Paris', valide: true }
    ],
    visite_medicale: { aptitude: 'apte', date: '2023-11-20', expiration: '2025-11-20', medecin: 'SSTI IDF', prochain_rdv: '2025-11-15' },
    notation: { fiabilite: 5, qualite: 4, relationnel: 5, commentaire: 'Candidat modèle, jamais de défaut' },
    historique_missions: [
      { client: 'BATIPRO 93', qualif: 'Maçon N2', date_debut: '2023-02-01', date_fin: '2023-07-31', nb_semaines: 26, taux_client: 24.50, taux_brut: 15.80, ca: 33124, marge: 7644, note: 'Très bon retour client' },
      { client: 'SOLIBAT', qualif: 'Maçon N2', date_debut: '2022-09-05', date_fin: '2022-12-16', nb_semaines: 15, taux_client: 23.00, taux_brut: 15.00, ca: 17940, marge: 4740, note: '' }
    ],
    competences: {}, journal: [
      { id: 'j1', type: 'appel', date: '2025-03-05', texte: 'Appel candidat — dispo dès lundi, OK gros œuvre Paris/92' },
      { id: 'j2', type: 'note', date: '2025-02-20', texte: 'CACES R482 à renouveler dans 14 mois — prévenir' }
    ]
  },
  {
    id: 'int_002',
    nom: 'DUBOIS', prenom: 'Franck',
    qualif: 'Électricien courants forts', niveau: 'N3', taux: '18.00', pretention: '18.50',
    tel: '06 23 45 67 89', email: 'f.dubois@gmail.com',
    cp: '75019', ville: 'Paris 19',
    mobilite: 'Paris + 15km', vehicule: 'non',
    dispo: 'mission', dispo_date: '2025-04-30',
    source: 'Indeed', source_detail: '',
    exp_annees: '12', langues: 'Français',
    permis: '', acompte: 'oui', acompte_montant: '150',
    notes: 'Électricien confirmé N3. HTA B1V-H1V. Idéal tertiaire. Préavis fin avril.',
    mission: {
      client: 'FONCIA TERTIAIRE', adresse: '42 rue de la Paix, 75002 Paris',
      contact: 'Rémy GUICHARD', contact_tel: '01 42 00 12 34',
      date_debut: '2025-01-06', date_fin: '2025-04-30',
      horaires: '8h-17h', cp_chantier: '75002', ville_chantier: 'Paris 2'
    },
    checks: {
      doc_id: true, doc_id_date: '2024-06-01',
      doc_rib: true, doc_rib_date: '2024-06-01',
      doc_ss: true, doc_ss_date: '2024-06-01',
      doc_attestation_urssaf: true,
      doc_visite_med: true, doc_visite_med_date: '2024-09-10',
      hab_elec_b1v: true, hab_elec_b1v_date: '2024-01-15',
      hab_elec_h1v: true, hab_elec_h1v_date: '2024-01-15',
      hab_elec_br: true, hab_elec_br_date: '2024-01-15',
      epi_chaussures: true, taille_chaussures_epi: '42',
      epi_casque: true, epi_gilet_hv: true, epi_gilet_fourni: true,
      epi_gants_isolants: true
    },
    habilitations_detail: [
      { id: 'elec_b1v', label: 'Habilitation B1V', num: 'HAB-2024-0145', date_obtention: '2024-01-15', date_expiration: '2027-01-15', organisme: 'Bureau Veritas', valide: true },
      { id: 'elec_h1v', label: 'Habilitation H1V', num: 'HAB-2024-0146', date_obtention: '2024-01-15', date_expiration: '2027-01-15', organisme: 'Bureau Veritas', valide: true }
    ],
    visite_medicale: { aptitude: 'apte', date: '2024-09-10', expiration: '2026-09-10', medecin: 'SSTI Énergie', prochain_rdv: '2026-09-01' },
    notation: { fiabilite: 4, qualite: 5, relationnel: 3, commentaire: 'Excellent technicien, parfois peu communicatif mais résultats impeccables' },
    historique_missions: [
      { client: 'FONCIA TERTIAIRE', qualif: 'Élec CF N3', date_debut: '2025-01-06', date_fin: '2025-04-30', nb_semaines: 17, taux_client: 27.00, taux_brut: 18.00, ca: 23868, marge: 5508, note: 'En cours' }
    ],
    competences: {}, journal: [
      { id: 'j1', type: 'rdv', date: '2025-01-03', texte: 'Entretien agence — habilitations vérifiées, mission démarrée le 06/01' }
    ]
  },
  {
    id: 'int_003',
    nom: 'NGUESSAN', prenom: 'Kouassi',
    qualif: 'Technicien CVC', niveau: 'N3', taux: '19.00', pretention: '20.00',
    tel: '07 34 56 78 90', email: 'k.nguessan@hotmail.fr',
    cp: '92100', ville: 'Boulogne-Billancourt',
    mobilite: 'IDF', vehicule: 'oui',
    dispo: 'disponible', dispo_date: '',
    source: 'Candidature spontanée', source_detail: '',
    exp_annees: '10', langues: 'Français, Anglais technique',
    permis: 'B', acompte: 'non', acompte_montant: '',
    notes: 'Technicien CVC senior. Fluides cat. I. GTB maîtrisée. Idéal ITI tertiaire IDF.',
    mission: { client: '', adresse: '', contact: '', contact_tel: '', date_debut: '', date_fin: '', horaires: '8h-17h', cp_chantier: '', ville_chantier: '' },
    checks: {
      doc_id: true, doc_id_date: '2024-03-12',
      doc_rib: true, doc_rib_date: '2024-03-12',
      doc_ss: true, doc_ss_date: '2024-03-12',
      doc_attestation_urssaf: true,
      doc_visite_med: true, doc_visite_med_date: '2024-06-20',
      hab_fluides_i: true, hab_fluides_i_date: '2022-09-01',
      hab_elec_b1v: true, hab_elec_b1v_date: '2023-03-10',
      epi_chaussures: true, taille_chaussures_epi: '44',
      epi_casque: true, epi_gilet_hv: true, epi_gants_isolants: true
    },
    habilitations_detail: [
      { id: 'fluides_i', label: 'Attestation fluides cat. I', num: 'FL-2022-5678', date_obtention: '2022-09-01', date_expiration: '2027-09-01', organisme: 'QUALICER', valide: true },
      { id: 'elec_b1v', label: 'Habilitation B1V', num: 'HAB-2023-0890', date_obtention: '2023-03-10', date_expiration: '2026-03-10', organisme: 'DEKRA', valide: true }
    ],
    visite_medicale: { aptitude: 'apte', date: '2024-06-20', expiration: '2026-06-20', medecin: 'SSTI CVC', prochain_rdv: '2026-06-10' },
    notation: { fiabilite: 5, qualite: 5, relationnel: 4, commentaire: 'Profil rare — très recherché, à placer en priorité' },
    historique_missions: [
      { client: 'CLIMAPLUS IMMO', qualif: 'Tech CVC N3', date_debut: '2024-02-05', date_fin: '2024-08-30', nb_semaines: 29, taux_client: 28.50, taux_brut: 19.00, ca: 42804, marge: 9324, note: 'Client très satisfait, demande de renouvellement' }
    ],
    competences: {}, journal: [
      { id: 'j1', type: 'appel', date: '2025-03-08', texte: 'Disponible depuis fin mars — veut du tertiaire Paris intra' },
      { id: 'j2', type: 'note', date: '2025-02-28', texte: 'Attestation fluides à renouveler en sept 2027 — OK pour 2 ans' }
    ]
  },
  {
    id: 'int_004',
    nom: 'LEJEUNE', prenom: 'Bertrand',
    qualif: 'Plaquiste N2', niveau: 'N2', taux: '15.50', pretention: '16.00',
    tel: '06 45 67 89 01', email: 'b.lejeune@orange.fr',
    cp: '95300', ville: 'Pontoise',
    mobilite: '95 + Paris', vehicule: 'oui',
    dispo: 'indisponible', dispo_date: '2025-05-15',
    source: 'Recommandation', source_detail: 'Via Carlos Martinez',
    exp_annees: '5', langues: 'Français',
    permis: 'B', acompte: 'non', acompte_montant: '',
    notes: 'Plaquiste polyvalent. Faux plafonds + cloisons. En fin de mission, disponible mi-mai.',
    mission: {
      client: 'RÉNOV95 SARL', adresse: 'ZA Les Épluches 95310 Saint-Ouen-l\'Aumône',
      contact: 'Daniel PROST', contact_tel: '01 34 21 45 67',
      date_debut: '2025-02-03', date_fin: '2025-05-09',
      horaires: '7h30-16h30', cp_chantier: '95310', ville_chantier: 'Saint-Ouen-l\'Aumône'
    },
    checks: {
      doc_id: true, doc_id_date: '2024-11-10',
      doc_rib: true, doc_rib_date: '2024-11-10',
      doc_ss: true, doc_ss_date: '2024-11-10',
      doc_attestation_urssaf: true,
      doc_visite_med: true, doc_visite_med_date: '2023-08-15',
      hab_carte_btp: true, hab_carte_btp_date: '2021-09-01',
      hab_travail_hauteur: true, hab_travail_hauteur_date: '2022-11-20',
      epi_chaussures: true, taille_chaussures_epi: '41',
      epi_casque: true, epi_gilet_hv: true,
      epi_genouilleres: true, epi_masque_p2: true
    },
    habilitations_detail: [],
    visite_medicale: { aptitude: 'apte', date: '2023-08-15', expiration: '2025-08-15', medecin: 'SSTI Île-de-France', prochain_rdv: '2025-07-20' },
    notation: { fiabilite: 4, qualite: 4, relationnel: 4, commentaire: 'Bon profil régulier, solide sur les faux plafonds' },
    historique_missions: [
      { client: 'RÉNOV95 SARL', qualif: 'Plaquiste N2', date_debut: '2025-02-03', date_fin: '2025-05-09', nb_semaines: 14, taux_client: 23.00, taux_brut: 15.50, ca: 16744, marge: 3444, note: 'En cours' }
    ],
    competences: {}, journal: [
      { id: 'j1', type: 'appel', date: '2025-03-01', texte: 'Confirme dispo mi-mai — OK pour 95 et Paris' }
    ]
  },
  {
    id: 'int_005',
    nom: 'TRAORE', prenom: 'Mamadou',
    qualif: 'Maçon N2', niveau: 'N2P', taux: '15.00', pretention: '15.50',
    tel: '06 56 78 90 12', email: 'm.traore@gmail.com',
    cp: '93120', ville: 'La Courneuve',
    mobilite: '93 + Paris', vehicule: 'non',
    dispo: 'disponible', dispo_date: '',
    source: 'Agence Pôle Emploi', source_detail: 'PEC 93',
    exp_annees: '3', langues: 'Français, Bambara',
    permis: '', acompte: 'oui', acompte_montant: '100',
    notes: 'Maçon en progression. Autonome sur maçonnerie courante. Transport en commun uniquement.',
    mission: { client: '', adresse: '', contact: '', contact_tel: '', date_debut: '', date_fin: '', horaires: '7h30-17h', cp_chantier: '', ville_chantier: '' },
    checks: {
      doc_id: true, doc_id_date: '2025-01-08',
      doc_titre_sejour: true, doc_titre_sejour_date: '2025-01-08',
      doc_rib: true, doc_rib_date: '2025-01-08',
      doc_ss: true, doc_ss_date: '2025-01-08',
      doc_attestation_urssaf: false,
      doc_visite_med: false,
      epi_chaussures: true, taille_chaussures_epi: '44',
      epi_casque: true, epi_gilet_hv: true
    },
    habilitations_detail: [],
    visite_medicale: { aptitude: '', date: '', expiration: '', medecin: '', prochain_rdv: '2025-03-25' },
    notation: { fiabilite: 3, qualite: 3, relationnel: 4, commentaire: 'Profil junior, à accompagner. Bonne volonté.' },
    historique_missions: [],
    competences: {}, journal: [
      { id: 'j1', type: 'note', date: '2025-01-08', texte: 'Inscription agence — visite médicale à planifier avant placement' }
    ]
  },
  {
    id: 'int_006',
    nom: 'BENALI', prenom: 'Rachid',
    qualif: 'Plombier sanitaire N2', niveau: 'N3', taux: '17.50', pretention: '18.00',
    tel: '06 67 89 01 23', email: 'r.benali@sfr.fr',
    cp: '92200', ville: 'Neuilly-sur-Seine',
    mobilite: 'IDF', vehicule: 'oui',
    dispo: 'veille', dispo_date: '',
    source: 'LinkedIn', source_detail: '',
    exp_annees: '15', langues: 'Français, Arabe',
    permis: 'B', acompte: 'non', acompte_montant: '',
    notes: 'Plombier senior très expérimenté. Résidentiel haut de gamme + tertiaire. Actuellement en poste mais à l\'écoute.',
    mission: { client: '', adresse: '', contact: '', contact_tel: '', date_debut: '', date_fin: '', horaires: '8h-17h', cp_chantier: '', ville_chantier: '' },
    checks: {
      doc_id: true, doc_id_date: '2024-10-22',
      doc_rib: true, doc_rib_date: '2024-10-22',
      doc_ss: true, doc_ss_date: '2024-10-22',
      doc_attestation_urssaf: true,
      doc_visite_med: true, doc_visite_med_date: '2024-04-05',
      hab_carte_btp: true, hab_carte_btp_date: '2023-01-10',
      epi_chaussures: true, taille_chaussures_epi: '42',
      epi_casque: true, epi_gilet_hv: true, epi_gants: true
    },
    habilitations_detail: [],
    visite_medicale: { aptitude: 'apte', date: '2024-04-05', expiration: '2026-04-05', medecin: 'SSTI Paris', prochain_rdv: '2026-03-15' },
    notation: { fiabilite: 5, qualite: 5, relationnel: 5, commentaire: 'Profil exceptionnel — déjà plusieurs retours positifs clients' },
    historique_missions: [
      { client: 'RÉSID\'IMMO 92', qualif: 'Plombier N3', date_debut: '2023-06-01', date_fin: '2023-12-22', nb_semaines: 29, taux_client: 26.00, taux_brut: 17.50, ca: 39052, marge: 8352, note: 'Client demande Rachid en priorité pour prochaine mission' }
    ],
    competences: {}, journal: [
      { id: 'j1', type: 'appel', date: '2025-02-14', texte: 'À l\'écoute — veut du résidentiel haut de gamme Paris 16/17 ou 92 Hauts-de-Seine' }
    ]
  },
  {
    id: 'int_007',
    nom: 'PETIT', prenom: 'Thomas',
    qualif: 'Conducteur de travaux', niveau: 'Cadre', taux: '28.00', pretention: '30.00',
    tel: '06 78 90 12 34', email: 't.petit@gmail.com',
    cp: '75016', ville: 'Paris 16',
    mobilite: 'IDF', vehicule: 'oui',
    dispo: 'disponible', dispo_date: '',
    source: 'Cooptation', source_detail: 'Via client BATIPRO 93',
    exp_annees: '18', langues: 'Français, Anglais',
    permis: 'B', acompte: 'non', acompte_montant: '',
    notes: 'Conducteur travaux TCE très expérimenté. Chantiers >5M€. Maîtrise BIM/Revit. Cherche mission longue durée.',
    mission: { client: '', adresse: '', contact: '', contact_tel: '', date_debut: '', date_fin: '', horaires: '8h-18h', cp_chantier: '', ville_chantier: '' },
    checks: {
      doc_id: true, doc_id_date: '2023-12-05',
      doc_rib: true, doc_rib_date: '2023-12-05',
      doc_ss: true, doc_ss_date: '2023-12-05',
      doc_attestation_urssaf: true,
      doc_visite_med: true, doc_visite_med_date: '2024-01-18',
      hab_carte_btp: true, hab_carte_btp_date: '2020-05-01',
      hab_sst: true, hab_sst_date: '2024-02-28',
      epi_chaussures: true, taille_chaussures_epi: '43',
      epi_casque: true, epi_gilet_hv: true
    },
    habilitations_detail: [],
    visite_medicale: { aptitude: 'apte', date: '2024-01-18', expiration: '2026-01-18', medecin: 'SSTI BTP', prochain_rdv: '2025-12-20' },
    notation: { fiabilite: 5, qualite: 5, relationnel: 5, commentaire: 'Référence agence — profil à valoriser auprès des gros clients' },
    historique_missions: [
      { client: 'NEXITY CONSTRUCTION', qualif: 'CDT travaux TCE', date_debut: '2022-03-01', date_fin: '2024-02-29', nb_semaines: 104, taux_client: 42.00, taux_brut: 28.00, ca: 227136, marge: 49504, note: 'Mission longue durée — excellent bilan' }
    ],
    competences: {}, journal: [
      { id: 'j1', type: 'rdv', date: '2025-03-03', texte: 'Entretien agence — cherche mission TCE minimum 12 mois, refuse déplacements > IDF' }
    ]
  },
  {
    id: 'int_008',
    nom: 'GIRARD', prenom: 'Sophie',
    qualif: 'Technicien multi-services CVC', niveau: 'N3', taux: '18.50', pretention: '19.00',
    tel: '06 89 01 23 45', email: 's.girard@laposte.fr',
    cp: '78000', ville: 'Versailles',
    mobilite: '78 + 91 + 75', vehicule: 'oui',
    dispo: 'preavis', dispo_date: '2025-04-14',
    source: 'Bonjob', source_detail: '',
    exp_annees: '9', langues: 'Français, Anglais',
    permis: 'B', acompte: 'non', acompte_montant: '',
    notes: 'Technicienne multi-services CVC confirmée. ITI tertiaire 78/91/75. Fluides cat. I. GMAO Maximo.',
    mission: { client: '', adresse: '', contact: '', contact_tel: '', date_debut: '', date_fin: '', horaires: '8h-17h', cp_chantier: '', ville_chantier: '' },
    checks: {
      doc_id: true, doc_id_date: '2025-02-01',
      doc_rib: true, doc_rib_date: '2025-02-01',
      doc_ss: true, doc_ss_date: '2025-02-01',
      doc_attestation_urssaf: true,
      doc_visite_med: true, doc_visite_med_date: '2024-11-30',
      hab_fluides_i: true, hab_fluides_i_date: '2021-06-15',
      hab_elec_b1v: true, hab_elec_b1v_date: '2023-09-01',
      epi_chaussures: true, taille_chaussures_epi: '38',
      epi_casque: true, epi_gilet_hv: true, epi_gants_isolants: true
    },
    habilitations_detail: [
      { id: 'fluides_i', label: 'Attestation fluides cat. I', num: 'FL-2021-3344', date_obtention: '2021-06-15', date_expiration: '2026-06-15', organisme: 'QUALICER', valide: true }
    ],
    visite_medicale: { aptitude: 'apte', date: '2024-11-30', expiration: '2026-11-30', medecin: 'SSTI Yvelines', prochain_rdv: '2026-11-15' },
    notation: { fiabilite: 4, qualite: 4, relationnel: 5, commentaire: 'Très bonne communication client — profil rare féminin CVC' },
    historique_missions: [
      { client: 'SODEXO FM 78', qualif: 'Tech multiservices CVC', date_debut: '2024-04-01', date_fin: '2024-09-27', nb_semaines: 26, taux_client: 28.00, taux_brut: 18.50, ca: 37856, marge: 7696, note: 'Client enchanté, redemande' }
    ],
    competences: {}, journal: [
      { id: 'j1', type: 'appel', date: '2025-03-07', texte: 'Préavis posé — disponible 14 avril. Veut contrat longue durée.' }
    ]
  }
];

var DEMO_PROSPECTS = [
  {
    id: 'pro_001',
    statut: 'client', // prospect → client
    nom: 'BATIPRO 93', secteur: 'Gros œuvre / TP', taille: '50-200 salariés',
    adresse: '15 rue Auguste Blanqui, 93000 Bobigny', siret: '41234567800012',
    ca: '8', capital: 500000, age: 14,
    delai_pmt: 45, encours: 8000, cond_regl: 'fin_de_mois_le_10',
    acompte_client: 'non',
    procedure: 0, incidents: 0,
    contacts: [
      { nom: 'Patrick RENAUD', fonction: 'Gérant', tel: '01 48 12 34 56', email: 'p.renaud@batipro93.fr', site: '' },
      { nom: 'Isabelle MOREAU', fonction: 'DAF/Comptable', tel: '01 48 12 34 57', email: 'i.moreau@batipro93.fr', site: '' }
    ],
    qualifs_recherchees: ['Maçon N2', 'Coffreur N2', 'Conducteur de travaux'],
    notes: 'Client fidèle depuis 2022. Chantiers gros œuvre 93/75. Volumes réguliers. Paiement ponctuel.',
    placements: [
      { interimaire: 'Carlos MARTINEZ', qualif: 'Maçon N2', date_debut: '2023-02-01', date_fin: '2023-07-31', nb_semaines: 26, taux_client: 24.50, taux_brut: 15.80, ca: 33124, marge: 7644 }
    ],
    journal: [
      { id: 'j1', type: 'rdv', date: '2025-02-15', texte: 'RDV annuel — besoin 3 maçons pour chantier Bobigny mars-sept' },
      { id: 'j2', type: 'appel', date: '2025-01-10', texte: 'Appel bonne année — confirme volumes 2025 stables' }
    ]
  },
  {
    id: 'pro_002',
    statut: 'client',
    nom: 'CLIMAPLUS IMMO', secteur: 'CVC / Génie climatique', taille: '20-50 salariés',
    adresse: '78 avenue des Champs-Élysées, 75008 Paris', siret: '52345678900023',
    ca: '4', capital: 200000, age: 9,
    delai_pmt: 60, encours: 6000, cond_regl: 'net_60',
    acompte_client: 'non',
    procedure: 0, incidents: 1,
    contacts: [
      { nom: 'Jérôme BLANC', fonction: 'Directeur', tel: '01 56 23 45 67', email: 'j.blanc@climaplus.fr', site: '' },
      { nom: 'Nathalie SIMON', fonction: 'Responsable achats', tel: '01 56 23 45 68', email: 'n.simon@climaplus.fr', site: '' }
    ],
    qualifs_recherchees: ['Technicien CVC', 'Monteur CVC', 'Technicien frigoriste'],
    notes: 'Bon client CVC. Un incident de paiement en 2022 (réglé). Délai 60j souvent dépassé de 10j.',
    placements: [
      { interimaire: 'Kouassi NGUESSAN', qualif: 'Tech CVC N3', date_debut: '2024-02-05', date_fin: '2024-08-30', nb_semaines: 29, taux_client: 28.50, taux_brut: 19.00, ca: 42804, marge: 9324 }
    ],
    journal: [
      { id: 'j1', type: 'appel', date: '2025-03-05', texte: 'Besoin urgent technicien CVC dispo avril — profil ITI tertiaire Paris' }
    ]
  },
  {
    id: 'pro_003',
    statut: 'client',
    nom: 'RÉSID\'IMMO 92', secteur: 'Plomberie / Sanitaire', taille: '10-20 salariés',
    adresse: '3 allée des Marronniers, 92200 Neuilly-sur-Seine', siret: '63456789000034',
    ca: '2.5', capital: 100000, age: 22,
    delai_pmt: 30, encours: 4000, cond_regl: 'net_30',
    acompte_client: 'non',
    procedure: 0, incidents: 0,
    contacts: [
      { nom: 'Claude MORVAN', fonction: 'Gérant', tel: '01 47 45 23 45', email: 'c.morvan@residimmo92.fr', site: '' }
    ],
    qualifs_recherchees: ['Plombier sanitaire N2', 'Plombier N3'],
    notes: 'Excellent client. Paiement rubis sur ongle. Résidentiel haut de gamme 92. Demande Rachid en priorité.',
    placements: [
      { interimaire: 'Rachid BENALI', qualif: 'Plombier N3', date_debut: '2023-06-01', date_fin: '2023-12-22', nb_semaines: 29, taux_client: 26.00, taux_brut: 17.50, ca: 39052, marge: 8352 }
    ],
    journal: [
      { id: 'j1', type: 'appel', date: '2025-03-10', texte: 'Demande Rachid BENALI dès que disponible — chantier résidentiel Neuilly mai-nov' }
    ]
  },
  {
    id: 'pro_004',
    statut: 'client',
    nom: 'FONCIA TERTIAIRE', secteur: 'Électricité tertiaire', taille: '50-200 salariés',
    adresse: '42 rue de la Paix, 75002 Paris', siret: '74567890100045',
    ca: '12', capital: 800000, age: 18,
    delai_pmt: 45, encours: 10000, cond_regl: 'fin_de_mois',
    acompte_client: 'non',
    procedure: 0, incidents: 0,
    contacts: [
      { nom: 'Rémy GUICHARD', fonction: 'Conducteur de travaux', tel: '01 42 00 12 34', email: 'r.guichard@foncia.fr', site: '' },
      { nom: 'Anne-Lise MARTIN', fonction: 'DRH', tel: '01 42 00 12 35', email: 'al.martin@foncia.fr', site: '' }
    ],
    qualifs_recherchees: ['Électricien courants forts', 'Électricien courants faibles', 'Conducteur de travaux'],
    notes: 'Grand compte. Volumes importants tertiaire Paris. Procédures internes à respecter (badge chantier, etc.).',
    placements: [
      { interimaire: 'Franck DUBOIS', qualif: 'Élec CF N3', date_debut: '2025-01-06', date_fin: '2025-04-30', nb_semaines: 17, taux_client: 27.00, taux_brut: 18.00, ca: 23868, marge: 5508 }
    ],
    journal: [
      { id: 'j1', type: 'rdv', date: '2025-01-03', texte: 'RDV commercial — bon passage avec Rémy GUICHARD, mission lancée' }
    ]
  },
  {
    id: 'pro_005',
    statut: 'prospect',
    nom: 'THERMO SERVICES IDF', secteur: 'CVC / Chauffage', taille: '10-20 salariés',
    adresse: '12 rue des Entrepreneurs, 75015 Paris', siret: '',
    ca: '1.8', capital: 80000, age: 4,
    delai_pmt: 45, encours: 0, cond_regl: '',
    acompte_client: 'non',
    procedure: 0, incidents: 0,
    contacts: [
      { nom: 'Hervé DESCHAMPS', fonction: 'Gérant', tel: '06 11 22 33 44', email: 'h.deschamps@thermoidf.fr', site: '' }
    ],
    qualifs_recherchees: ['Technicien chauffagiste', 'Technicien CVC'],
    notes: 'Prospect identifié via salon BIM World. Besoin chauffagiste urgent. À rappeler semaine 12.',
    placements: [],
    journal: [
      { id: 'j1', type: 'appel', date: '2025-03-06', texte: 'Premier contact — confirme besoin 1 chauffagiste dès que possible. RDV à planifier.' }
    ]
  },
  {
    id: 'pro_006',
    statut: 'prospect',
    nom: 'RENOVPRO GRAND PARIS', secteur: 'Gros œuvre / Rénovation', taille: '5-10 salariés',
    adresse: '8 impasse des Lilas, 94200 Ivry-sur-Seine', siret: '85678901200056',
    ca: '0.9', capital: 30000, age: 2,
    delai_pmt: 30, encours: 0, cond_regl: '',
    acompte_client: 'oui_30pct',
    procedure: 1, incidents: 2,
    contacts: [
      { nom: 'Samir OUELHADJ', fonction: 'Gérant', tel: '07 22 33 44 55', email: 's.ouelhadj@renovpro.fr', site: '' }
    ],
    qualifs_recherchees: ['Maçon N2', 'Plaquiste N2'],
    notes: 'ATTENTION : entreprise jeune, procédure collective ouverte en 2023 (terminée). 2 incidents paiement retardé. Exiger acompte + plafonner exposition.',
    placements: [],
    journal: [
      { id: 'j1', type: 'note', date: '2025-02-20', texte: 'Vérification Infogreffe : procédure sauvegarde terminée janv 2024. À surveiller.' }
    ]
  }
];

var DEMO_MISSIONS = [
  {
    id: 'mis_001',
    statut: 'active',
    titre: 'Maçon N2 — Chantier Bobigny',
    client_id: 'pro_001', client_nom: 'BATIPRO 93',
    interimaire_id: 'int_001', interimaire_nom: 'Carlos MARTINEZ',
    qualif: 'Maçon N2',
    adresse_chantier: '15 rue de la Solidarité, 93000 Bobigny',
    cp_chantier: '93000', ville_chantier: 'Bobigny',
    contact_client: 'Patrick RENAUD', contact_tel: '01 48 12 34 56',
    date_debut: '2025-03-10', date_fin: '2025-09-30',
    horaires: '7h-16h Lundi-Vendredi',
    taux_client: 24.50, taux_brut: 16.50, coeff: 2.12,
    notes: 'Gros œuvre — dalles + murs. EPI fourni par le client sur ce chantier.',
    historique: []
  },
  {
    id: 'mis_002',
    statut: 'active',
    titre: 'Élec CF N3 — Rénovation tertiaire Paris 2',
    client_id: 'pro_004', client_nom: 'FONCIA TERTIAIRE',
    interimaire_id: 'int_002', interimaire_nom: 'Franck DUBOIS',
    qualif: 'Électricien courants forts',
    adresse_chantier: '42 rue de la Paix, 75002 Paris',
    cp_chantier: '75002', ville_chantier: 'Paris 2',
    contact_client: 'Rémy GUICHARD', contact_tel: '01 42 00 12 34',
    date_debut: '2025-01-06', date_fin: '2025-04-30',
    horaires: '8h-17h Lundi-Vendredi',
    taux_client: 27.00, taux_brut: 18.00, coeff: 2.15,
    notes: 'Rénovation électrique plateau tertiaire. Badge chantier obligatoire (fourni par FONCIA).',
    historique: []
  },
  {
    id: 'mis_003',
    statut: 'a_pourvoir',
    titre: 'Technicien CVC — Besoin urgent Paris',
    client_id: 'pro_002', client_nom: 'CLIMAPLUS IMMO',
    interimaire_id: '', interimaire_nom: '',
    qualif: 'Technicien CVC',
    adresse_chantier: '78 avenue des Champs-Élysées, 75008 Paris',
    cp_chantier: '75008', ville_chantier: 'Paris 8',
    contact_client: 'Jérôme BLANC', contact_tel: '01 56 23 45 67',
    date_debut: '2025-04-07', date_fin: '2025-10-31',
    horaires: '8h-17h',
    taux_client: 28.50, taux_brut: 0, coeff: 0,
    notes: 'Profil ITI. Fluides cat. I obligatoire. Idéalement GTB. Kouassi NGUESSAN à proposer.',
    historique: []
  },
  {
    id: 'mis_004',
    statut: 'cloturee',
    titre: 'Tech multiservices CVC — FM Versailles',
    client_id: '', client_nom: 'SODEXO FM 78',
    interimaire_id: 'int_008', interimaire_nom: 'Sophie GIRARD',
    qualif: 'Technicien multi-services CVC',
    adresse_chantier: 'Site clients Yvelines, 78000 Versailles',
    cp_chantier: '78000', ville_chantier: 'Versailles',
    contact_client: 'Marc LEFEBVRE', contact_tel: '01 39 45 67 89',
    date_debut: '2024-04-01', date_fin: '2024-09-27',
    horaires: '8h-17h ITI',
    taux_client: 28.00, taux_brut: 18.50, coeff: 2.16,
    notes: 'Mission FM ITI multi-sites Yvelines. Bilan très positif.',
    historique: []
  }
];

/* ── Fonctions d'aide ── */
function demoLoad(key, fallback) {
  try {
    var stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return fallback;
}

function demoInject() {
  if (!localStorage.getItem('jtp_interimaires')) {
    localStorage.setItem('jtp_interimaires', JSON.stringify(DEMO_INTERIMAIRES));
  }
  if (!localStorage.getItem('jtp_prospects')) {
    localStorage.setItem('jtp_prospects', JSON.stringify(DEMO_PROSPECTS));
  }
  if (!localStorage.getItem('jtp_missions')) {
    localStorage.setItem('jtp_missions', JSON.stringify(DEMO_MISSIONS));
  }
}
