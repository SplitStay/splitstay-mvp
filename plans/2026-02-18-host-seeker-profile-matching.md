# Feature: Host/Seeker Profile Matching

**Created**: 2026-02-18
**Goal**: Enable two-way, event-scoped matching between hosts and seekers with user-defined compatibility preferences, accessible via both web UI and WhatsApp bot.

## User Requirements

### Event Registration

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Unauthenticated user browses upcoming events
  When I navigate to the events page without signing in
  Then I see a list of upcoming events with name, dates, and location
  And past events are not shown
  But I must sign in to register for an event

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User registers for an event
  Given I am signed in
  And I am viewing an upcoming event
  When I click "Register"
  Then I am registered for the event
  And I see the event's profile discovery page

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User views their registered events
  Given I am signed in
  And I have registered for one or more events
  When I view my registered events
  Then I see each event I am registered for with its name, dates, and location

### Trip-Event Linking

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: System suggests linking existing trip when registering for an event
  Given I have a trip whose dates overlap with an event's dates
  When I register for that event
  Then I see a dismissible suggestion to link my trip to the event
  And I can accept or dismiss the suggestion

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: System suggests linking to event when creating a trip with overlapping dates
  Given I am registered for an event
  When I create a trip whose dates overlap with that event
  Then I see a dismissible suggestion to link the trip to the event
  And accepting the suggestion sets the trip's event link

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User creates trip from event page with pre-filled context
  Given I am viewing an event I am registered for
  When I choose to post accommodation from the event page
  Then the trip creation form is pre-filled with the event's location and date range
  And the trip is automatically linked to the event on creation

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User manually links a trip to an event
  Given I have a trip whose dates overlap with an event I am registered for
  When I use the "Link to event" action on my trip
  Then the trip is linked to that event
  And I appear as a host to other attendees

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User is warned when editing trip dates breaks event overlap
  Given my trip is linked to an event
  When I edit the trip's dates so they no longer overlap with the event
  Then I see a warning that the trip will be unlinked from the event
  And I can confirm the unlink or cancel the edit

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Host cannot unlink trip from event when trip has members
  Given my trip is linked to an event
  And one or more seekers have joined my trip
  When I attempt to unlink the trip from the event
  Then the unlink is blocked
  And I see a message explaining why

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Multiple overlapping trips are shown when linking
  Given I have two trips whose dates overlap with an event
  When the system suggests linking a trip to the event
  Then I see both trips listed and can choose which to link

### Matching Preferences

# Living: features/user-profile.feature::Complete profile creation wizard - Step 4 Preferences
# Action: extends
# Status: DONE
# Living updated: YES
Scenario: User sets matching preferences on their profile
  Given I am editing my profile preferences
  When I configure my matching preferences
  Then I can set each dimension to "Must match", "Prefer", or "Don't care":
    | Language overlap         |
    | Travel traits similarity |
    | Age proximity            |
    | Gender                   |

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User sets gender preferences as multi-select
  Given I am editing my matching preferences
  When I configure my gender preference
  Then I can select one or more genders I am open to matching with
  And the available options include Man, Woman, Trans man, Trans woman, Non-binary, and Prefer not to say

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User sets age range when age preference is active
  Given I am editing my matching preferences
  And I set age proximity to "Must match" or "Prefer"
  Then I see min and max age inputs
  And I can define my preferred age range between 18 and 120
  And the minimum age cannot exceed the maximum age

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User sees validation error for invalid age range
  Given I am editing my matching preferences
  When I set the minimum age higher than the maximum age
  Then I see a validation error explaining the range is invalid

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Matching preferences default to fully open
  Given I have not configured matching preferences
  Then all dimensions default to "Don't care"
  And I see all profiles at events without filtering

### Profile Discovery Within an Event

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Seeker browses host profiles at an event ranked by compatibility
  Given I am registered for an event
  And I do not have a trip linked to this event
  When I view the event's profile discovery page
  Then I see host profiles ranked by compatibility score
  And each profile shows name, photo, compatibility score, shared languages, shared traits, and accommodation summary

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Host browses seeker profiles at an event ranked by compatibility
  Given I am registered for an event
  And I have a trip linked to this event
  When I view the event's profile discovery page
  Then I see seeker profiles ranked by compatibility score
  And each profile shows name, photo, compatibility score, shared languages, and shared traits

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Seekers only see hosts and hosts only see seekers
  Given I am registered for an event
  When I view the event's profile discovery page
  Then I only see profiles of hosts if I am a seeker
  Or I only see profiles of seekers if I am a host

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: "Must match" filters exclude non-qualifying profiles
  Given I have set language overlap to "Must match"
  And a host at my event shares no languages with me
  When I view the event's profile discovery page
  Then that host does not appear in my results

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Empty event shows notification promise
  Given I am registered for an event
  And no hosts or seekers (depending on my role) have registered
  When I view the event's profile discovery page
  Then I see a message indicating no matches are available yet
  And the message explains I will be notified when someone joins

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: All "must match" filters eliminate everyone
  Given my preferences filter out every registered user at an event
  When I view the event's profile discovery page
  Then I see a message suggesting I adjust my matching preferences
  And I see a link to my preference settings

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Host disappears from browse results when trip is full
  Given a host's trip has as many members as it has rooms
  When a seeker views the event's profile discovery page
  Then that host does not appear in the results

### Interest Expression & Matching

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User expresses interest in another profile
  Given I am viewing profiles at an event
  When I express interest in a profile
  Then I see a visual confirmation that my interest was recorded
  And the profile's interest action changes state to indicate I have already acted
  And the other user is not notified of my interest

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Mutual interest creates a match
  Given I have expressed interest in another user at an event
  And that user has also expressed interest in me
  Then we are matched
  And we are both notified of the match
  And a conversation is created between us

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Seeker joins host's trip directly after match
  Given I am a seeker matched with a host at an event
  When I choose to join their trip
  Then I am added to the trip as a member
  And I can see the trip details

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User undoes interest before mutual match
  Given I have expressed interest in a profile
  And the other user has not yet expressed interest in me
  When I undo my interest
  Then my interest is removed
  And no match can form from that pairing

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User undoes interest after match but before joining trip
  Given I have matched with another user
  And I have not yet joined their trip
  When I undo my interest
  Then the match is dissolved
  And the conversation between us remains

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Joined seeker does not see a leave trip option
  Given I have joined a host's trip through the matching flow
  When I view the trip
  Then I do not see a "Leave trip" option

### WhatsApp Bot — Event-Aware Matching

# Living: features/whatsapp-bot.feature::Host provides trip details through conversation
# Action: extends
# Status: DONE
# Living updated: YES
Scenario: Host path asks about event linking during trip creation
  Given I am creating a trip through the WhatsApp bot as a host
  When the bot has collected my accommodation details
  Then the bot asks if this trip is for a specific event
  And shows events whose dates overlap with my trip dates
  And I can choose to link my trip to an event or skip

# Living: features/whatsapp-bot.feature::Seeker provides trip details through conversation
# Action: extends
# Status: DONE
# Living updated: YES
Scenario: Seeker path offers event-scoped matching
  Given I am chatting with the WhatsApp bot as a seeker
  When the bot asks about my plans
  Then the bot asks if I am attending a specific event
  And I can select an event to see compatible hosts

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot presents top matches in batches of five
  Given I am a seeker registered for an event via the bot
  When the bot shows me matching hosts
  Then it presents up to 5 profiles one at a time with name, bio, shared traits, and accommodation summary
  And after 5 profiles it asks if I want to see more

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: User re-engages with bot to check new matches
  Given I have previously registered for an event via the bot
  When I message the bot asking to check my matches
  Then the bot shows which events I am registered for
  And I can pick an event to see new profiles I have not yet acted on

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot notifies user when new compatible profile registers
  Given I am registered for an event
  When a new host or seeker (depending on my role) registers for the same event
  And they pass my "must match" filters
  Then I receive a WhatsApp notification prompting me to check my matches

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Bot walks through matching preferences if not set
  Given I am in the matching flow via the bot
  And I have not configured my matching preferences
  When the bot detects missing preferences
  Then it asks about each dimension one at a time before showing matches

## Technical Specifications

### Compatibility Scoring

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Scoring RPC returns profiles ranked by compatibility
  Given user A is registered for an event
  When user A requests their match list
  Then the RPC returns host profiles if user A is a seeker, or seeker profiles if user A is a host
  And profiles are ordered by descending compatibility score

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: "Must match" dimensions act as hard filters
  Given user A has language set to "must_match"
  And user B shares no languages with user A
  When user A's match list is computed
  Then user B is excluded from the results

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: "Prefer" dimensions contribute to compatibility score
  Given user A has travel traits set to "prefer"
  And user B shares 3 of 5 travel traits with user A
  And user C shares 1 of 5 travel traits with user A
  When user A's match list is computed
  Then user B ranks higher than user C

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: "Don't care" dimensions are excluded from scoring
  Given user A has all dimensions set to "don't care"
  When user A's match list is computed
  Then all profiles of the other role appear with equal scores

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Scoring is asymmetric
  Given user A has language set to "must_match" and user B has language set to "don't care"
  And user A and user B share no languages
  When match lists are computed
  Then user B does not appear in user A's results
  But user A does appear in user B's results

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Language score is binary
  Given user A and user B share at least one language
  When the language dimension is scored
  Then the score is 1.0

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Language score is zero when no languages are shared
  Given user A and user B share no languages
  When the language dimension is scored
  Then the score is 0.0

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Age score uses the user-defined range with linear decay
  Given user A has age range 25-35
  And user B is 30 years old
  And user C is 40 years old
  When the age dimension is scored for "prefer"
  Then user B scores 1.0 (within range)
  And user C scores max(0, 1 - |40 - 35| / (35 - 25)) = 0.5

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Age score is 1.0 at range boundaries
  Given user A has age range 25-35
  And user B is exactly 25 years old
  When the age dimension is scored
  Then user B scores 1.0

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Age score floors at 0.0 for distant ages
  Given user A has age range 25-35 (range width = 10)
  And user B is 46 years old (11 beyond the range boundary)
  When the age dimension is scored
  Then user B scores 0.0

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Scoring excludes profiles already acted on
  Given user A has already expressed interest or disinterest in user B
  When user A's match list is computed
  Then user B does not appear in the results

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Scoring excludes hosts whose trips are full
  Given a host's trip has as many trip_member records as it has rooms
  When a seeker's match list is computed
  Then that host is excluded from the results

### Match Detection & Trip Joining

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Interest insert and mutual check are atomic
  Given user A expresses interest in user B
  When the match_interest row is inserted
  Then the reciprocal check runs in the same transaction
  And if mutual interest exists, both users are notified

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Trip join enforces room-based capacity
  Given a host's trip has N rooms and N-1 members
  When two seekers attempt to join simultaneously
  Then only one succeeds
  And the other receives an error indicating the trip is full

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Trip-event link validates date overlap
  Given a trip with dates June 5-10
  And an event with dates June 4-11
  When the trip is linked to the event
  Then the link succeeds because the dates overlap

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Trip-event link rejects non-overlapping dates
  Given a trip with dates July 1-5
  And an event with dates June 4-11
  When the trip is linked to the event
  Then the link is rejected because the dates do not overlap

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Unlinking trip from event is blocked when trip has members
  Given a trip is linked to an event
  And the trip has one or more trip_member records
  When an attempt is made to set event_id to null
  Then the update is rejected

### WhatsApp Bot Technical

# Living: features/whatsapp-bot.feature::Conversation history is stored in Supabase
# Action: extends
# Status: DONE
# Living updated: YES
Scenario: Event context is detected in user intake flow
  Given active events exist in the database
  And a user mentions an event name during host or seeker intake
  When the handler processes the message
  Then it detects the event reference and offers event linking or registration

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Scoring RPC is called for bot match presentation
  Given a seeker has registered for an event via the bot
  When the bot needs to present matches
  Then it calls the same scoring RPC as the web UI
  And formats the top results as WhatsApp messages

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: New registration triggers proactive notification check
  Given a new event_registration row is inserted
  When the trigger fires
  Then it computes compatibility against existing registrations of the other role
  And sends WhatsApp notifications to users whose hard filters the new user passes

# Living: none (initial implementation)
# Action: creates
# Status: DONE
# Living updated: YES
Scenario: Re-engagement command verifies phone identity before showing events
  Given a user messages the bot asking to check matches
  When the handler parses the intent
  Then it verifies the phone number maps to a registered user
  And presents their registered events for selection
  And unregistered phone numbers receive a registration prompt

## Affected Documentation

- [ ] Update CLAUDE.md — document new tables (event_registration, trip_member, match_interest, user_gender_preference, gender), the joinee_id removal, and event_id on trips
- [ ] Update DEPLOYING.md — add migration steps for the matching feature, including the joinee_id data migration

## Notes

### Design Decisions
- **Event-scoped matching**: The pilot validates interest by matching hosts and seekers within specific events, not globally across the platform
- **User-defined preference weights**: Three-tier system (must_match/prefer/dont_care) across four dimensions (language, travel traits, age, gender) balances flexibility with simplicity
- **Tinder-style blind interest**: Neither party knows the other expressed interest unless it's mutual, removing social friction from the matching process
- **Role derivation**: Host/seeker is never stored — it's derived from whether a user has a trip linked to the event. This eliminates state synchronization bugs
- **trip_member replaces joinee_id**: Supports multiple seekers per trip. Existing joinee data is migrated in a single transaction. Both old request-flow and new matching-flow members end up in the same table
- **Room-based capacity**: Trip membership is capped at the number of rooms on the trip, enforced at the database level
- **Gender as lookup table**: Strict 3NF — gender values referenced by FK from both user.gender and user_gender_preference.gender, allowing new genders via INSERT rather than schema migration
- **No exit flows for pilot**: Seekers cannot leave trips, hosts cannot unlink trips with members. Simplifies the pilot; revisited later
- **Binary language scoring**: 1.0 if any shared language, 0.0 if none — simplest model for the pilot
- **Age scoring with linear decay**: Score is 1.0 within the user-defined range, decays linearly outside: `max(0, 1 - |age - nearest_range_boundary| / range_width)`. Floors at 0.0.
- **Naming convention**: New tables use snake_case column names. Legacy tables retain their existing camelCase conventions

### Constraints
- Events are admin-seeded for the pilot (users do not create events)
- Scoring runs server-side via Supabase RPC to avoid leaking preference data
- WhatsApp bot extends existing intake flows rather than creating parallel matching flows
- Proactive notifications require the scoring logic to run on new registrations

### Migration Implementation Specification

The following describes the database migration structure. These are implementation specifications, not behavioral tests.

**gender lookup table**: `id` text PK. Seeded with: `man`, `woman`, `trans_man`, `trans_woman`, `non_binary`, `prefer_not_to_say`.

**user table additions**:
- `match_pref_language`, `match_pref_travel_traits`, `match_pref_age`, `match_pref_gender`: text columns defaulting to `'dont_care'`, CHECK constraint: value IN (`'must_match'`, `'prefer'`, `'dont_care'`)
- `match_age_min`, `match_age_max`: nullable integers, CHECK: `match_age_min >= 18`, `match_age_max <= 120`, `match_age_min <= match_age_max`
- `gender` FK referencing gender table (existing column converted to FK)

**user_gender_preference table**: Composite PK (`user_id`, `gender`). `user_id` FK → user, `gender` FK → gender.

**event_registration table**: `user_id` FK → user, `event_id` FK → event, UNIQUE(`user_id`, `event_id`), `created_at`, `updated_at`.

**trip_member table**: `trip_id` FK → trip, `user_id` FK → user, UNIQUE(`trip_id`, `user_id`), `joined_at` timestamptz DEFAULT now(). Database-level trigger or constraint preventing member count from exceeding trip room count.

**match_interest table**: `event_id` FK → event, `user_id` FK → user, `target_user_id` FK → user, `interested` boolean. UNIQUE(`event_id`, `user_id`, `target_user_id`). CHECK(`user_id != target_user_id`). Composite index on (`event_id`, `target_user_id`, `user_id`, `interested`).

**trip table additions**: `event_id` nullable UUID FK → event. Index on `event_id`.

**joinee_id migration**: For each trip where `joinee_id IS NOT NULL`, insert into `trip_member(trip_id, user_id)`. Then drop the `joinee_id` column.

**RLS policies**:
- `event_registration`: Authenticated users read/write own rows
- `trip_member`: Authenticated users read rows for trips they host or are members of
- `match_interest`: Users can only read/write their own outbound rows (where `user_id = auth.uid()`). Mutual match detection via RPC, not direct table access
- `user_gender_preference`: Authenticated users read/write own rows
