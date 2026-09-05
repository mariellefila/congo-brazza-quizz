#!/usr/bin/env node
import fs from 'node:fs';
import { resolveConfig, verifyPublicKey, renderConfig } from './lib/supabaseConfig.js';

try {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--env') throw new Error('Usage : npm run prepare-supabase-config -- --env production|development');
  const mode = args[1];
  const config = resolveConfig(process.env, mode);
  await verifyPublicKey(config);
  fs.writeFileSync(new URL('../supabase-config.js', import.meta.url), renderConfig(config, mode), 'utf8');
  console.log(`supabase-config.js généré en ${mode} ; clé publique vérifiée auprès de ${config.url}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
