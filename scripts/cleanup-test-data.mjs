#!/usr/bin/env node

import dotenv from 'dotenv';
import pg from 'pg';
import readline from 'readline';

// Load environment variables
dotenv.config();

const { Client } = pg;

// Database connection config
const connectionConfig = {
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function cleanupTestData() {
  const client = new Client(connectionConfig);
  
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    
    // Start transaction
    await client.query('BEGIN');
    
    console.log('\n🔍 Analyzing problematic trips...');
    
    // Find trips with hosts that have no profile pictures
    const tripsWithoutImages = await client.query(`
      SELECT 
        t.id as trip_id,
        t.name as trip_name,
        t."hostId",
        u.email as host_email,
        u.name as host_name,
        u."imageUrl" as host_image,
        t."createdAt"
      FROM public.trip t
      LEFT JOIN public.user u ON t."hostId" = u.id
      LEFT JOIN auth.users au ON u.id = au.id
      WHERE u."imageUrl" IS NULL OR u."imageUrl" = ''
      ORDER BY t."createdAt" DESC
    `);
    
    console.log(`📊 Found ${tripsWithoutImages.rows.length} trips with hosts that have no profile pictures:`);
    tripsWithoutImages.rows.slice(0, 10).forEach(trip => {
      console.log(`   - ${trip.trip_name} (${trip.host_email}) - ${trip.created_at}`);
    });
    
    // Find orphaned trips
    const orphanedTrips = await client.query(`
      SELECT 
        t.id as trip_id,
        t.name as trip_name,
        t."hostId",
        t."createdAt"
      FROM public.trip t
      LEFT JOIN public.user u ON t."hostId" = u.id
      WHERE t."hostId" IS NOT NULL AND u.id IS NULL
    `);
    
    console.log(`\n🚨 Found ${orphanedTrips.rows.length} orphaned trips (no valid host):`);
    orphanedTrips.rows.forEach(trip => {
      console.log(`   - ${trip.trip_name} (hostId: ${trip.hostid})`);
    });
    
    // Find test trips
    const testTrips = await client.query(`
      SELECT 
        t.id as trip_id,
        t.name as trip_name,
        t.description,
        u.email as host_email,
        t."createdAt"
      FROM public.trip t
      LEFT JOIN public.user u ON t."hostId" = u.id
      LEFT JOIN auth.users au ON u.id = au.id
      WHERE LOWER(t.name) LIKE '%test%' 
         OR LOWER(t.description) LIKE '%test%'
         OR LOWER(t.name) LIKE '%sample%'
         OR LOWER(t.description) LIKE '%sample%'
      ORDER BY t."createdAt" DESC
    `);
    
    console.log(`\n🧪 Found ${testTrips.rows.length} trips with test-like content:`);
    testTrips.rows.forEach(trip => {
      console.log(`   - ${trip.trip_name} (${trip.host_email})`);
    });
    
    console.log('\n🗑️  Starting cleanup...');
    
    // Delete orphaned trips
    const deleteOrphaned = await client.query(`
      DELETE FROM public.trip 
      WHERE "hostId" NOT IN (SELECT id FROM public.user WHERE id IS NOT NULL)
    `);
    console.log(`   ✓ Deleted ${deleteOrphaned.rowCount} orphaned trips`);
    
    // Delete test trips
    const deleteTest = await client.query(`
      DELETE FROM public.trip 
      WHERE LOWER(name) LIKE '%test%' 
         OR LOWER(description) LIKE '%test%'
         OR LOWER(name) LIKE '%sample%'
         OR LOWER(description) LIKE '%sample%'
    `);
    console.log(`   ✓ Deleted ${deleteTest.rowCount} test trips`);
    
    // Delete trips from suspicious users
    const deleteSuspiciousTrips = await client.query(`
      DELETE FROM public.trip 
      WHERE "hostId" IN (
        SELECT u.id 
        FROM public.user u 
        LEFT JOIN auth.users au ON u.id = au.id
        WHERE (u."imageUrl" IS NULL OR u."imageUrl" = '')
        AND (
          au.email LIKE '%test%' 
          OR au.email LIKE '%limaj.sulejman%'
          OR au.email LIKE '%elijah%'
          OR au.email LIKE '%sample%'
          OR au.email LIKE '%demo%'
        )
      )
    `);
    console.log(`   ✓ Deleted ${deleteSuspiciousTrips.rowCount} trips from suspicious users`);
    
    // Delete suspicious users
    const deleteSuspiciousUsers = await client.query(`
      DELETE FROM auth.users 
      WHERE email LIKE '%limaj.sulejman%'
         OR email LIKE '%elijah%@%'
         OR email LIKE '%test%'
         OR email LIKE '%sample%'
         OR email LIKE '%demo%'
    `);
    console.log(`   ✓ Deleted ${deleteSuspiciousUsers.rowCount} suspicious users`);
    
    // Final verification
    const remainingTrips = await client.query('SELECT COUNT(*) as count FROM public.trip');
    const remainingUsers = await client.query('SELECT COUNT(*) as count FROM auth.users');
    
    console.log(`\n📊 Final counts:`);
    console.log(`   - Remaining trips: ${remainingTrips.rows[0].count}`);
    console.log(`   - Remaining users: ${remainingUsers.rows[0].count}`);
    
    // Show sample of remaining trips
    const sampleTrips = await client.query(`
      SELECT 
        t.id,
        t.name,
        u.email as host_email,
        CASE WHEN u."imageUrl" IS NOT NULL AND u."imageUrl" != '' THEN 'Yes' ELSE 'No' END as has_image,
        t."createdAt"
      FROM public.trip t
      LEFT JOIN public.user u ON t."hostId" = u.id
      LEFT JOIN auth.users au ON u.id = au.id
      ORDER BY t."createdAt" DESC
      LIMIT 10
    `);
    
    console.log(`\n📋 Sample of remaining trips:`);
    sampleTrips.rows.forEach(trip => {
      console.log(`   - ${trip.name} (${trip.host_email}) - Image: ${trip.has_image}`);
    });
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Cleanup completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    await client.query('ROLLBACK');
    console.log('🔄 Transaction rolled back');
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Safety confirmation prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🧹 Starting comprehensive test data cleanup...');
console.log('\n⚠️  WARNING: This will permanently delete test trips and users!');
console.log('   This action cannot be undone.\n');

rl.question('Type "CLEANUP" to confirm deletion: ', (answer) => {
  if (answer === 'CLEANUP') {
    rl.close();
    cleanupTestData().catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  } else {
    console.log('\n❌ Cleanup cancelled. No changes were made.');
    rl.close();
    process.exit(0);
  }
});
