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

async function cleanupFakeTrips() {
  const client = new Client(connectionConfig);
  
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    
    // Start transaction
    await client.query('BEGIN');
    
    console.log('\n🔍 Analyzing fake/test trips from Find Partner page...');
    
    // Find problematic trips
    const fakeTrips = await client.query(`
      SELECT 
        t.id as trip_id,
        t.name as trip_name,
        t.description,
        t.location,
        t."hostId",
        u.name as host_name,
        u.email as host_email,
        u."imageUrl" as host_image,
        t."createdAt"
      FROM public.trip t
      LEFT JOIN public.user u ON t."hostId" = u.id
      LEFT JOIN auth.users au ON u.id = au.id
      WHERE 
        -- Generic or fake descriptions
        (LOWER(t.description) LIKE '%lorem ipsum%' 
         OR LOWER(t.description) LIKE '%dfrvfs%'
         OR LOWER(t.description) LIKE '%mars%'
         OR LOWER(t.description) LIKE '%martians%'
         OR LOWER(t.description) LIKE '%asgard%'
         OR LOWER(t.description) LIKE '%thor%'
         OR LOWER(t.description) LIKE '%power rangers%'
         OR LOWER(t.description) LIKE '%goblins%'
         OR t.description = ''
         OR t.description IS NULL)
        -- OR hosts with no real profile info
        OR (u.name IS NULL OR u.name = '' OR u.name = 'Host')
        -- OR specific test accounts
        OR (u.name = 'Sarah Chen' OR u.name = 'Marco Rodriguez')
        -- OR hosts with no profile image
        OR (u."imageUrl" IS NULL OR u."imageUrl" = '')
        -- OR suspicious locations
        OR (LOWER(t.location) LIKE '%mars%' 
            OR LOWER(t.location) LIKE '%asgard%')
      ORDER BY t."createdAt" DESC
    `);
    
    console.log(`🚨 Found ${fakeTrips.rows.length} fake/test trips:`);
    fakeTrips.rows.slice(0, 15).forEach(trip => {
      const desc = trip.description ? trip.description.substring(0, 30) + '...' : 'No description';
      const hostName = trip.host_name || 'No name';
      const hasImage = trip.host_image ? 'Yes' : 'No';
      console.log(`   - "${trip.trip_name}" in ${trip.location}`);
      console.log(`     Host: ${hostName} (${trip.host_email}) - Image: ${hasImage}`);
      console.log(`     Description: ${desc}\n`);
    });
    
    console.log('\n🗑️  Starting cleanup of fake trips...');
    
    // Delete trips with fake content in descriptions
    const deleteFakeDescriptions = await client.query(`
      DELETE FROM public.trip 
      WHERE LOWER(description) LIKE '%lorem ipsum%' 
         OR LOWER(description) LIKE '%dfrvfs%'
         OR LOWER(description) LIKE '%mars%'
         OR LOWER(description) LIKE '%martians%'
         OR LOWER(description) LIKE '%asgard%'
         OR LOWER(description) LIKE '%thor%'
         OR LOWER(description) LIKE '%power rangers%'
         OR LOWER(description) LIKE '%goblins%'
         OR description = ''
         OR description IS NULL
    `);
    console.log(`   ✓ Deleted ${deleteFakeDescriptions.rowCount} trips with fake descriptions`);
    
    // Delete trips with fake locations
    const deleteFakeLocations = await client.query(`
      DELETE FROM public.trip 
      WHERE LOWER(location) LIKE '%mars%' 
         OR LOWER(location) LIKE '%asgard%'
         OR LOWER(location) LIKE '%middle earth%'
         OR LOWER(location) LIKE '%narnia%'
    `);
    console.log(`   ✓ Deleted ${deleteFakeLocations.rowCount} trips with fake locations`);
    
    // Delete trips with generic host names and specific test accounts
    const deleteGenericHosts = await client.query(`
      DELETE FROM public.trip 
      WHERE "hostId" IN (
        SELECT u.id 
        FROM public.user u 
        WHERE u.name IS NULL 
           OR u.name = '' 
           OR u.name = 'Host'
           OR u.name = 'Sarah Chen'
           OR u.name = 'Marco Rodriguez'
           OR LOWER(u.name) LIKE '%test%'
      )
    `);
    console.log(`   ✓ Deleted ${deleteGenericHosts.rowCount} trips with generic/test host names`);
    
    // Delete trips from incomplete profiles (no image + profile not created)
    const deleteIncompleteProfiles = await client.query(`
      DELETE FROM public.trip 
      WHERE "hostId" IN (
        SELECT u.id 
        FROM public.user u 
        LEFT JOIN auth.users au ON u.id = au.id
        WHERE (u."imageUrl" IS NULL OR u."imageUrl" = '')
        AND (u."profileCreated" = false OR u."profileCreated" IS NULL)
      )
    `);
    console.log(`   ✓ Deleted ${deleteIncompleteProfiles.rowCount} trips from incomplete profiles`);
    
    // Clean up users with incomplete profiles and specific test accounts
    const deleteIncompleteUsers = await client.query(`
      DELETE FROM auth.users 
      WHERE id IN (
        SELECT au.id 
        FROM auth.users au
        LEFT JOIN public.user u ON au.id = u.id
        WHERE (u.name IS NULL OR u.name = '' OR u.name = 'Host' OR u.name = 'Sarah Chen' OR u.name = 'Marco Rodriguez')
        AND (u."imageUrl" IS NULL OR u."imageUrl" = '' OR u."profileCreated" = false OR u."profileCreated" IS NULL)
      )
    `);
    console.log(`   ✓ Deleted ${deleteIncompleteUsers.rowCount} incomplete/test user accounts`);
    
    // Show remaining available trips (like Find Partner page)
    const remainingTrips = await client.query(`
      SELECT 
        t.id,
        t.name,
        LEFT(t.description, 50) as description_preview,
        t.location,
        u.name as host_name,
        u.email as host_email,
        CASE WHEN u."imageUrl" IS NOT NULL AND u."imageUrl" != '' THEN 'Yes' ELSE 'No' END as has_image,
        t."createdAt"
      FROM public.trip t
      LEFT JOIN public.user u ON t."hostId" = u.id
      LEFT JOIN auth.users au ON u.id = au.id
      WHERE t."joineeId" IS NULL  -- Only show available trips
      ORDER BY t."createdAt" DESC
      LIMIT 10
    `);
    
    const totalAvailable = await client.query(`
      SELECT COUNT(*) as count 
      FROM public.trip 
      WHERE "joineeId" IS NULL
    `);
    
    console.log(`\n📊 Remaining available trips: ${totalAvailable.rows[0].count}`);
    console.log('\n📋 Sample of remaining trips (what users will see):');
    
    if (remainingTrips.rows.length === 0) {
      console.log('   🎉 No trips remaining - Find Partner page will be clean!');
    } else {
      remainingTrips.rows.forEach(trip => {
        console.log(`   - "${trip.name}" in ${trip.location}`);
        console.log(`     Host: ${trip.host_name} (${trip.host_email}) - Image: ${trip.has_image}`);
        console.log(`     Description: ${trip.description_preview}...\n`);
      });
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Fake trip cleanup completed successfully!');
    console.log('🔄 The Find Partner page should now show only legitimate trips.');
    
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

console.log('🧹 Starting fake trip cleanup (based on Find Partner page issues)...');
console.log('\nThis will remove trips with:');
console.log('- Fake descriptions (Mars, Asgard, Lorem ipsum, dfrvfs, etc.)');
console.log('- Generic host names ("Host" or empty)');
console.log('- Specific test accounts (Sarah Chen, Marco Rodriguez)');
console.log('- No profile pictures');
console.log('- Incomplete user profiles');
console.log('\n⚠️  WARNING: This will permanently delete these trips and users!');

rl.question('\nType "CLEANUP" to confirm deletion: ', (answer) => {
  if (answer === 'CLEANUP') {
    rl.close();
    cleanupFakeTrips().catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
  } else {
    console.log('\n❌ Cleanup cancelled. No changes were made.');
    rl.close();
    process.exit(0);
  }
});
