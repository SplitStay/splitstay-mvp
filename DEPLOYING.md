# Deploying SplitStay

The application has three independently deployed layers. There is no CI/CD pipeline — each layer is deployed manually.

- **UI:** [Vercel](https://vercel.com) (auto-deploys on push to `main`)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, Realtime)
- **Edge Functions:** [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno runtime)

## Deployment Order

Deploy in this order. Each step depends on the previous one.

1. Link to the Supabase project (one-time setup):
   ```bash
   npx supabase link --project-ref dhqvohruecmttgfkfdeb
   ```

2. Push database migrations:
   ```bash
   npx supabase db push
   ```

3. Set edge function secrets in the Supabase dashboard (Project Settings > Edge Functions > Secrets):

   | Secret | Source |
   |--------|--------|
   | `GROQ_API_KEY` | [Groq console](https://console.groq.com) |
   | `TWILIO_AUTH_TOKEN` | Twilio console |
   | `WHATSAPP_ADMIN_NUMBERS` | Comma-separated list, e.g. `whatsapp:+18005551234` |

   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase.

4. Build and deploy the edge function:
   ```bash
   npm run edge:build
   npx supabase functions deploy whatsapp-webhook
   ```

5. Configure the Twilio webhook URL in the Twilio console to point to:
   ```
   https://dhqvohruecmttgfkfdeb.supabase.co/functions/v1/whatsapp-webhook
   ```

6. Push to `main` to trigger the Vercel UI deploy (independent of the above, but listed last because the UI doesn't depend on the other layers being deployed first).

## Production Migrations

Migrations are **not** automatically applied to production. Vercel auto-deploys the UI immediately on push to `main`, but database schema changes require a separate manual step. If you merge code that depends on new tables or columns without running `npx supabase db push`, the app will break.

> **TODO:** Set up CI/CD to atomically deploy UI and migrations together.

## WhatsApp Webhook: Twilio Signature URL Mismatch

The `whatsapp-webhook` edge function validates incoming Twilio requests using HMAC-SHA1 signature verification against `request.url`. The URL the function sees is the **internal** URL assigned by the Supabase edge runtime, not the public-facing URL. In local development this is `http://supabase_edge_runtime_client:8081/whatsapp-webhook`; in production it will be whatever URL the Supabase infrastructure passes to the Deno runtime.

When configuring the webhook URL in the Twilio console, the URL must match what `request.url` resolves to inside the function. If there is a mismatch (e.g., after deploying to a new domain or placing the function behind a different reverse proxy), all requests will fail with HTTP 403 because the signature computation uses a different URL than Twilio used when signing.

To diagnose signature failures, check the edge function logs for `validation` stage entries.
