# 🚀 SUPABASE SETUP — PHASE 1 COMPLETED

Pour la configuration frontend versionnée et publiée sur GitHub Pages, suivre
[la procédure DEV/PROD](docs/SUPABASE_CONFIG_PUBLICATION.md).

**Status: Server initialized and data imported (7 categories, 356 questions, 3 ads).**

---

## ✅ What's Ready

- ✅ Migration SQL file: `supabase/migrations/20260811_init_schema.sql`
- ✅ Setup script: `scripts/setup-supabase.js`
- ✅ npm dependencies: `npm install` completed
- ✅ Checkpoint file: `SUPABASE_CHECKPOINT.md`
- ✅ Configuration examples: `supabase-config.example.js`, `.env.example`

---

## 🔄 YOUR NEXT STEPS

### 1️⃣ Restart Codespace (Required)
To load GitHub Codespaces secrets:

1. Go to: https://github.com/codespaces
2. Find your codespace (congo-brazza-quizz)
3. Click **...** → **Stop codespace**
4. Wait 30 seconds
5. Click the codespace name to reopen it

**Why?** GitHub secrets only load on codespace start.

---

### 2️⃣ After Restart: Verify Secrets

```bash
env | grep -i supabase
```

Should output 3 variables:
- SUPABASE_ACCESS_TOKEN
- SUPABASE_SECRET_KEYS
- SUPABASE_PROJECT_URL

---

### 3️⃣ Run Complete Setup

```bash
npm run setup-supabase
```

Or manually:
```bash
SUPABASE_URL="https://dhmkhogszktonyuynpns.supabase.co" \
SUPABASE_SERVICE_KEY="$SUPABASE_SECRET_KEYS" \
node scripts/setup-supabase.js
```

---

## 📝 What the Setup Script Does

1. **Checks if migrations are applied**
   - If yes: skips to data import
   - If no: shows you how to apply them (2 options provided)

2. **Imports data** (if migrations exist):
   - Categories (~10 categories)
   - Questions (~100+ questions)
   - Advertisements (3 ads)

3. **Prints summary**
   - Counts of imported rows

---

## 🆘 Troubleshooting

### "Secrets not found after restart"
→ Check GitHub Settings > Secrets and variables > Codespaces
→ Make sure all 3 secrets are created:
  - SUPABASE_ACCESS_TOKEN
  - SUPABASE_SECRET_KEYS
  - SUPABASE_PROJECT_URL

### "Migrations not applied"
The script will show 2 ways to apply them:
- **Option A**: CLI (if you have the access token)
  ```bash
  supabase login --token "$SUPABASE_ACCESS_TOKEN"
  supabase link --project-ref dhmkhogszktonyuynpns
  supabase db push
  ```
- **Option B**: SQL Studio (manual, easiest)
  1. Go to: https://app.supabase.com/project/dhmkhogszktonyuynpns/sql
  2. Create new query
  3. Copy content of: `supabase/migrations/20260811_init_schema.sql`
  4. Execute

### "Import fails - permission denied"
→ Check that SUPABASE_SECRET_KEYS starts with `sb_secret_`
→ It should be the **service_role** key, not the anon key

---

## 📋 Full Documentation

See: **`SUPABASE_CHECKPOINT.md`** for complete details

---

## 🎯 Summary

**Current status:**
- ✅ All files in place
- ✅ Dependencies installed
- ✅ Migrations applied
- ✅ Data imported

**Safe rerun command:**
1. Verify secrets load
2. Run `npm run setup-supabase`
3. Script now performs idempotent upserts

**Then:**
- Phase 2: Auth UI (Google/Facebook login)
- Phase 3: Multiplayer (Realtime)
- Phase 4: Tests & Deployment

---

**Created:** 2026-08-11  
**Project:** congo-brazza-quizz  
**Supabase:** dhmkhogszktonyuynpns
