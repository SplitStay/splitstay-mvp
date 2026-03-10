import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Database } from '@/types/database.types';
import { TripWithRelationsSchema } from '../schemas/tripSchema';

/**
 * Integration tests for trip queries against a real local Supabase.
 *
 * These tests verify that PostgREST can resolve the FK joins we use
 * and that the returned data passes Zod schema validation, catching
 * the class of bug (PGRST200) that broke production.
 *
 * Requires: `npm run db:start && npm run db:reset`
 */

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

let testUserId: string;
let testTripId: string;

describe('trip query integration', () => {
  beforeAll(async () => {
    const { data: authUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email: `test-${crypto.randomUUID()}@example.com`,
        password: 'test-password-123',
        email_confirm: true,
      });
    if (authError)
      throw new Error(`Failed to create test user: ${authError.message}`);
    testUserId = authUser.user.id;

    // Insert public.user row (the auth trigger may not be configured locally)
    const { error: userError } = await adminClient.from('user').upsert({
      id: testUserId,
      email: authUser.user.email ?? '',
      name: 'Integration Test User',
    });
    if (userError)
      throw new Error(`Failed to create public user: ${userError.message}`);

    // Create a public test trip
    testTripId = crypto.randomUUID();
    const { error: tripError } = await adminClient.from('trip').insert({
      id: testTripId,
      name: 'Integration Test Trip',
      description: 'A trip for integration testing',
      location: 'Paris',
      hostId: testUserId,
      ispublic: true,
      flexible: false,
      startDate: '2026-06-01',
      endDate: '2026-06-07',
    });
    if (tripError)
      throw new Error(`Failed to create test trip: ${tripError.message}`);
  });

  afterAll(async () => {
    await adminClient.from('trip').delete().eq('id', testTripId);
    await adminClient.auth.admin.deleteUser(testUserId);
  });

  it('resolves host and trip_member FK joins on the trip table', async () => {
    const { data, error } = await supabase
      .from('trip')
      .select(
        `
        *,
        host:user!hostId(name, imageUrl),
        trip_member(user_id, user:user(name, imageUrl)),
        accommodation_type(name)
      `,
      )
      .eq('id', testTripId)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.host).toMatchObject({ name: 'Integration Test User' });
    expect(data?.trip_member).toEqual([]);
  });

  it('returns data from the trip table that passes Zod schema validation', async () => {
    const { data, error } = await supabase
      .from('trip')
      .select(
        `
        *,
        host:user!hostId(name, imageUrl),
        trip_member(user_id, user:user(name, imageUrl)),
        accommodation_type(name)
      `,
      )
      .eq('id', testTripId)
      .single();

    expect(error).toBeNull();

    const parsed = TripWithRelationsSchema.parse(data);
    expect(parsed.id).toBe(testTripId);
    expect(parsed.isPublic).toBe(true);
    // Verify transforms removed lowercase fields
    expect(parsed).not.toHaveProperty('ispublic');
    expect(parsed).not.toHaveProperty('estimatedmonth');
    // Verify trip_member → members rename
    expect(parsed.members).toEqual([]);
    expect(parsed).not.toHaveProperty('trip_member');
  });

  it('returns public trips through the searchable_trips view', async () => {
    const { data, error } = await supabase
      .from('searchable_trips')
      .select('id, name, ispublic')
      .eq('id', testTripId)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.name).toBe('Integration Test Trip');
  });
});
