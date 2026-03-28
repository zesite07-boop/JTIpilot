# DÉPLOIEMENT tools.z3site.com — o2switch

## Structure à uploader

```
/home/clients/z3site/           ← HORS du public_html
    .htpasswd                   ← fichier mdp (jamais public)

/home/clients/z3site/public_html/tools/   ← OU sous-domaine dédié
    index.html                  ← shell principal (ouvrir ça)
    tdb.html                    ← tableau de bord
    crm.html                    ← CRM prospection
    candidats.html              ← base candidats
    marge.html                  ← fiche marge
    pl.html                     ← simulateur P&L
    clients.html                ← fiche lecture client
    juridique.html              ← guide juridique
    objections.html             ← objections direction
    .htaccess                   ← protection mot de passe
    gen_htpasswd.py             ← (optionnel, juste pour générer le .htpasswd)
```

---

## Étape 1 — Créer le sous-domaine sur o2switch

1. Se connecter au cPanel o2switch
2. Menu **Sous-domaines** (ou Subdomains)
3. Créer : `tools` → `tools.z3site.com`
4. Dossier racine : `/public_html/tools` (ou chemin équivalent sur votre compte)

---

## Étape 2 — Générer le fichier .htpasswd

Sur votre machine locale (Python 3 requis) :

```bash
python3 gen_htpasswd.py
```

Saisir le nom d'utilisateur et le mot de passe souhaités.
Le fichier `.htpasswd` est généré localement.

---

## Étape 3 — Uploader via FTP ou Gestionnaire de fichiers cPanel

**Option A — FTP (FileZilla recommandé)**

Hôte : `ftp.z3site.com` (ou l'IP FTP o2switch)
Login/Mdp : vos identifiants FTP o2switch

Uploader :
- Tous les fichiers `.html` + `.htaccess` dans `/public_html/tools/`
- Le fichier `.htpasswd` dans `/` (dossier racine du compte, HORS public_html)

**Option B — Gestionnaire de fichiers cPanel**

1. cPanel → Gestionnaire de fichiers
2. Naviguer vers `public_html/tools/`
3. Upload de tous les fichiers HTML + .htaccess
4. Naviguer vers `/` (root du compte)
5. Upload du `.htpasswd`

---

## Étape 4 — Ajuster le chemin .htpasswd dans .htaccess

Ouvrir `.htaccess` et vérifier la ligne :
```
AuthUserFile /home/clients/z3site/.htpasswd
```

Le chemin exact dépend de votre compte o2switch. Pour le trouver :
cPanel → Terminal (ou SSH) → `echo $HOME`
Remplacer `/home/clients/z3site` par le résultat.

---

## Étape 5 — Tester

Ouvrir `https://tools.z3site.com`
→ Une boîte de dialogue mot de passe doit apparaître
→ Entrer les identifiants créés à l'étape 2
→ L'outil s'ouvre

---

## Données & localStorage

Les données (CRM, candidats, clients) sont stockées dans le localStorage du navigateur,
**lié au domaine** `tools.z3site.com`.

- Si vous accédez depuis un autre navigateur/appareil : les données ne sont pas synchronisées automatiquement.
- Pour transférer : Menu **Export JSON complet** → récupérer le fichier → **Import → JSON Backup** sur le nouvel appareil.
- Pour une synchro multi-appareils, une future version pourra utiliser une base de données PHP/MySQL hébergée sur o2switch.

---

## Mise à jour d'un module

Pour mettre à jour un seul fichier (ex : crm.html) :
1. Ré-uploader uniquement ce fichier via FTP
2. Vider le cache du navigateur (Ctrl+Shift+R)
3. Les données localStorage ne sont pas affectées

---

## Support

En cas de problème : vérifier les logs d'erreur dans cPanel → Logs d'erreurs Apache.
