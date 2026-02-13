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

3. Set edge function secrets. Either use the dashboard (Edge Functions > Secrets) or the CLI:
   ```bash
   npx supabase secrets set \
     GROQ_API_KEY=your-key \
     TWILIO_AUTH_TOKEN=your-token \
     LLM_BASE_URL=https://api.groq.com/openai/v1 \
     LLM_MODEL=llama-3.1-8b-instant \
     "WHATSAPP_ADMIN_NUMBERS=whatsapp:+18005551234,whatsapp:+18005555678"
   ```

   | Secret | Source |
   |--------|--------|
   | `GROQ_API_KEY` | [Groq console](https://console.groq.com) |
   | `TWILIO_AUTH_TOKEN` | Twilio console |
   | `LLM_BASE_URL` | OpenAI-compatible API base URL (e.g. `https://api.groq.com/openai/v1`) |
   | `LLM_MODEL` | Model identifier (e.g. `llama-3.1-8b-instant`) |
   | `WHATSAPP_ADMIN_NUMBERS` | Comma-separated list, e.g. `whatsapp:+18005551234` |

   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase.

4. Build and deploy the edge function:
   ```bash
   npm run edge:build
   npx supabase functions deploy whatsapp-webhook
   ```

5. Configure the Twilio webhook URL in the Twilio console to point to:
   ```
   https://api.splitstay.travel/functions/v1/whatsapp-webhook
   ```

6. Push to `main` to trigger the Vercel UI deploy (independent of the above, but listed last because the UI doesn't depend on the other layers being deployed first).

## PostgreSQL Extensions

The supplier intake migration (`20260212000000_supplier_intake.sql`) enables the `pg_trgm` extension for fuzzy event name matching. This runs automatically via `CREATE EXTENSION IF NOT EXISTS pg_trgm` — no manual setup is needed.

## Migration Hygiene

**The production database contains real user data. Treat it accordingly.**

- Never run `db reset` against production — it drops and recreates everything.
- Never run destructive DDL (`DROP TABLE`, `TRUNCATE`, `DELETE FROM`) without a reviewed migration and a backup plan.
- Always check `supabase migration list` before pushing to confirm what will run.
- `supabase db push` applies migrations in order and is not reversible. There is no `db rollback`. If a migration breaks production, you must write a new migration to undo it.

Migrations are **not** automatically applied to production. Vercel auto-deploys the UI immediately on push to `main`, but database schema changes require a separate manual step. If you merge code that depends on new tables or columns without running `npx supabase db push`, the app will break.

> **TODO:** Set up CI/CD to atomically deploy UI and migrations together.

### All schema changes go through migration files

Never run ad-hoc SQL against production using the Supabase dashboard SQL editor or `psql`. Every change — including one-off data inserts like seeding admin users — must be a migration file in `supabase/migrations/`. This keeps local and remote migration histories in sync.

If local and remote histories diverge, `supabase db push` and `supabase db pull` will both refuse to run. Fixing the mismatch requires manually marking migrations as `reverted` or `applied` with `supabase migration repair`, which is error-prone and risky on a production database with real data.

### Checking migration status

Before pushing, verify that local and remote histories match:

```bash
npx supabase migration list
```

The output shows local and remote columns. Every row should have entries in both columns. If a migration appears in only one column:

- **Remote only (not local):** Someone ran SQL directly in the dashboard or from another machine. Inspect the migration content before taking action. If it contains schema changes, pull it into a local file. If it was a one-off data insert that is no longer needed, mark it reverted:
  ```bash
  npx supabase migration repair --status reverted <version>
  ```

- **Local only (not remote):** The migration hasn't been deployed yet. Review the SQL carefully, then run `npx supabase db push`. Read the confirmation prompt — it lists every migration that will be applied.

### Writing safe migrations

- Use `IF NOT EXISTS` / `IF EXISTS` for `CREATE` and `DROP` statements.
- Add new columns as nullable or with defaults — never add a `NOT NULL` column without a default to a table that already has rows.
- Test migrations locally with `npx supabase db reset` before pushing to production.
- Keep migrations small and focused. One concern per file.

### Seeding data

Use `supabase/seed.sql` for data that should exist in every environment (local dev, staging, production). The seed file runs on `npx supabase db reset` but not on `npx supabase db push`. For production-only seed data (like initial admin users), create a migration file.

## Twilio Webhook Configuration

The WhatsApp bot receives messages via a Twilio webhook. Configure this in the Twilio console:

1. Go to **Messaging > Try it out > Send a WhatsApp message** (or your Twilio WhatsApp Sender settings).
2. Set the webhook URL for incoming messages to:
   ```
   https://dhqvohruecmttgfkfdeb.supabase.co/functions/v1/whatsapp-webhook
   ```
3. Set the HTTP method to **POST**.

### Signature Verification

The edge function validates incoming Twilio requests using HMAC-SHA1 signature verification against `request.url`. The URL the function sees is the **internal** URL assigned by the Supabase edge runtime, not the public-facing URL. In local development this is `http://supabase_edge_runtime_client:8081/whatsapp-webhook`; in production it is whatever URL the Supabase infrastructure passes to the Deno runtime.

The webhook URL configured in Twilio must match what `request.url` resolves to inside the function. If there is a mismatch (e.g., after deploying to a new domain or placing the function behind a different reverse proxy), all requests will fail with HTTP 403 because the signature computation uses a different URL than Twilio used when signing.

To diagnose signature failures, check the edge function logs for `validation` stage entries.
