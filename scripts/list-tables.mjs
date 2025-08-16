import dotenv from 'dotenv'
import { Client } from 'pg'

dotenv.config({ path: '.env.local' })

let dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
if (!dbUrl && process.env.VITE_SUPABASE_URL) {
  try {
    const u = new URL(process.env.VITE_SUPABASE_URL)
    const hostParts = u.host.split('.')
    const projectRef = hostParts[0]
    const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || process.env.SUPABASE_DB_PASSWORD
    if (!password) throw new Error('Missing DB password in PGPASSWORD/POSTGRES_PASSWORD/SUPABASE_DB_PASSWORD')
    dbUrl = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`
  } catch (e) {}
}

let useSsl = false
if (process.env.PGSSLMODE && /require|verify-ca|verify-full/i.test(process.env.PGSSLMODE)) useSsl = true
if (dbUrl) {
  try {
    const u = new URL(dbUrl)
    const sslmode = u.searchParams.get('sslmode')
    if (sslmode && /require|verify-ca|verify-full/i.test(sslmode)) useSsl = true
    if (/\.supabase\.co$/.test(u.hostname)) useSsl = true
  } catch {}
}

const baseConfig = dbUrl
  ? { connectionString: dbUrl }
  : {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD
    }
const client = new Client({ ...baseConfig, ssl: useSsl ? { rejectUnauthorized: false } : false })

async function main() {
  await client.connect()
  const r = await client.query("select table_schema, table_name from information_schema.tables where table_schema='public' order by table_name")
  for (const row of r.rows) console.log(`${row.table_schema}.${row.table_name}`)
  await client.end()
}

main().catch(async (e) => { console.error(e); try { await client.end() } catch {}; process.exit(1) })
