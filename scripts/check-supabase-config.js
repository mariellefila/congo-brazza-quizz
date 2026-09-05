#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { checkProductionContent } from './lib/supabaseConfig.js';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const checkRef = ref => checkProductionContent(execFileSync('git', ['show', `${ref}:supabase-config.js`], { encoding: 'utf8' }));
try {
  const [mode, ...args] = process.argv.slice(2);
  if (mode === '--pre-commit') {
    if (git('symbolic-ref', '--short', 'HEAD') === 'main') checkRef('');
  } else if (mode === '--pre-push') {
    for (const line of fs.readFileSync(0, 'utf8').trim().split('\n').filter(Boolean)) {
      const [, localOid, remoteRef] = line.split(/\s+/);
      if (remoteRef === 'refs/heads/main' && !/^0+$/.test(localOid)) checkRef(localOid);
    }
  } else if (mode === '--ref' && args.length === 1) {
    checkRef(args[0]);
  } else if (mode === undefined) {
    checkProductionContent(fs.readFileSync(new URL('../supabase-config.js', import.meta.url), 'utf8'));
  } else throw new Error('Arguments de vérification invalides.');
} catch (error) {
  console.error(`Contrôle Supabase : ${error.message}`);
  process.exitCode = 1;
}
