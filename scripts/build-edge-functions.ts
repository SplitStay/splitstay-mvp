import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

await build({
  entryPoints: [resolve(root, 'supabase/functions/whatsapp-webhook/_src.ts')],
  outfile: resolve(root, 'supabase/functions/whatsapp-webhook/index.ts'),
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'neutral',
  external: ['https://esm.sh/*'],
  allowOverwrite: true,
});

console.log('Built: supabase/functions/whatsapp-webhook/index.ts');
