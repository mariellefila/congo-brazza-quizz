// Example configuration for Supabase on a static site (GitHub Pages).
// Generate the versioned supabase-config.js with npm run prepare-supabase-config -- --env production.
// See docs/SUPABASE_CONFIG_PUBLICATION.md; do not copy this placeholder onto main.

window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-public-key';

// In your app you can then do:
// import { initSupabase } from './src/lib/supabaseClient.js';
// await initSupabase(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
