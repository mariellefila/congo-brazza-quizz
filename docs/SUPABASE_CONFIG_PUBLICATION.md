# Configuration Supabase publiée

GitHub Pages continue à publier la racine de `main`. `supabase-config.js` est
versionné et doit toujours contenir PROD sur cette branche.

## Génération

Le mode est obligatoire. Le script lit uniquement les variables du processus :
il ne charge pas automatiquement de fichier `.env`.

```bash
SUPABASE_URL=https://dhmkhogszktonyuynpns.supabase.co \
SUPABASE_ANON_KEY='<clé publique PROD>' \
npm run prepare-supabase-config -- --env production

SUPABASE_URL=https://xbsequfhjqdcarsidxxa.supabase.co \
SUPABASE_ANON_KEY='<clé publique DEV>' \
npm run prepare-supabase-config -- --env development
```

Une seule source est autorisée, sans aucune priorité implicite :

- `SUPABASE_URL` et `SUPABASE_ANON_KEY` ensemble (recommandé) ;
- OU `SUPER_CONCTION_STRING='https://projet.supabase.co;clé'` ;
- OU `SUPABASE_CONNECTIONSTRING='https://projet.supabase.co;clé'`.

Les deux chaînes acceptent aussi `|` comme séparateur. Tout mélange est refusé,
même avec des valeurs identiques. Les anciens alias sont refusés explicitement :
`super_conction_string`, `SUPABASE_CONNECTION_STRING`, `SUPER_CONCTION`,
`super_conction`, `SUPABASE_PROJECT_URL`, `SUPABASE_PROJECTURL`, `SUPABASE_PUBLISHKEY`.
Supprimer ces variables du processus avant de lancer la génération.

L’URL doit être exactement celle du mode demandé. En production, toute variable
Supabase non vide dont le nom contient le segment DEV/DEVELOPMENT ou dont la
valeur contient la référence du projet DEV bloque la génération. Les clés
secrètes sont refusées. Un JWT doit être de rôle `anon`, correspondre au projet
et ne pas être expiré. Les clés `sb_publishable_…` sont acceptées.

Avant toute écriture, le script vérifie la clé auprès de `/auth/v1/settings`
avec l’en-tête `apikey`. Une erreur réseau, un refus ou une réponse inattendue
laisse le fichier existant intact. Ne jamais fournir de clé `service_role`.

## Protection locale de main

`npm install` (ou `npm ci`) installe les hooks via le script `prepare`.
Pour un clone existant : `npm run prepare`.

- `pre-commit` contrôle le fichier dans l’index sur `main`, pas la copie de travail.
- `pre-push` contrôle le fichier du commit envoyé vers `refs/heads/main`, même
  lorsque la branche locale porte un autre nom.
- Les contrôles refusent la référence DEV, une URL autre que PROD, une clé
  manquante/non publique et un format autre que celui généré.

```bash
npm run check-supabase-config
npm run test:supabase-config
```

Les hooks sont locaux : ils peuvent être contournés avec `--no-verify` et ne
s’appliquent pas aux éditions via GitHub. Ce changement n’ajoute aucune règle
serveur ni aucun workflow de déploiement. Régénérer PROD avant de commiter sur
`main`, puis vérifier le fichier public après la publication Pages.
