import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { createAccessControl } from '../../../src/lib/bot/accessControl.ts';
import { createGroqClient } from '../../../src/lib/bot/groqClient.ts';
import { createHandler } from '../../../src/lib/bot/handler.ts';
import { createSupabaseDbClient } from '../../../src/lib/bot/supabaseDb.ts';
import { createTwilioValidator } from '../../../src/lib/bot/twilioValidator.ts';

const requireEnv = (name: string, ...fallbacks: string[]): string => {
  for (const key of [name, ...fallbacks]) {
    const value = Deno.env.get(key);
    if (value) return value;
  }
  throw new Error(`Missing required env var: ${name}`);
};

const supabaseUrl = requireEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseServiceKey = requireEnv(
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SUPABASE_ANON_KEY',
);
const groqApiKey = requireEnv('GROQ_API_KEY');
const twilioAuthToken = requireEnv('TWILIO_AUTH_TOKEN');
const adminNumbers = Deno.env.get('WHATSAPP_ADMIN_NUMBERS') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const llmBaseUrl = Deno.env.get('LLM_BASE_URL');
const llmModel = Deno.env.get('LLM_MODEL');
const llm = createGroqClient(groqApiKey, undefined, llmBaseUrl, llmModel);
const db = createSupabaseDbClient(supabase);
const accessControl = createAccessControl(adminNumbers);
const skipSignatureValidation =
  Deno.env.get('TWILIO_SKIP_SIGNATURE_VALIDATION') === 'true';
const twilioValidator = createTwilioValidator(
  twilioAuthToken,
  skipSignatureValidation,
);

const handler = createHandler({
  llm,
  db,
  accessControl,
  twilioValidator,
});

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        stage: 'validation',
        message: `Method ${req.method} rejected`,
      }),
    );
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    return await handler(req);
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        stage: 'response',
        message: 'Fatal error in handler',
        error: String(error),
      }),
    );
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, something went wrong. Please try again.</Message></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } },
    );
  }
});
