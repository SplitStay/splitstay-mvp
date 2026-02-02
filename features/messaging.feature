@messaging
Feature: Real-time Messaging
  As a SplitStay user
  I want to communicate with other users
  So that I can coordinate trip details and get to know potential partners

  Background:
    Given I am signed in
    And I have a complete profile

  # Starting Conversations
  Scenario: Start conversation from trip page
    Given I am viewing a trip hosted by another user
    When I click "Message Host"
    Then I should be taken to the messages page
    And I should be able to type my first message

  Scenario: Cannot message yourself
    Given I am viewing my own trip
    Then I should not see a "Message Host" button

  Scenario: Conversation reuses existing thread
    Given I already have a conversation with "Alice"
    When I click "Message Host" on one of Alice's trips
    Then I should be taken to our existing conversation
    And I should see our previous messages

  # Sending Messages
  @realtime
  Scenario: Send text message
    Given I am in a conversation with "Alice"
    When I type a message
    And I press Enter or click the send button
    Then my message should appear in the chat
    And Alice should receive the message in real-time

  Scenario: Send multiline message
    Given I am in a conversation
    When I press Shift+Enter while typing
    Then I should be able to add a new line to my message
    And the textarea should expand to fit the content

  @realtime
  Scenario: Send message with link preview
    Given I am in a conversation with "Alice"
    When I send a message containing a URL
    Then my message should display with a link preview card
    And the preview should show the page title and image

  Scenario: Send empty message is prevented
    Given I am in a conversation
    When the message input is empty
    Then the send button should be disabled
    And pressing Enter should not send anything

  Scenario: Add emoji to message while composing
    Given I am in a conversation
    When I click the emoji button in the message input
    Then I should see an emoji picker
    And I can select an emoji to add to my message

  # File Attachments
  Scenario: Send image attachment
    Given I am in a conversation
    When I click the attachment button
    And I select an image file
    Then the image should be uploaded
    And it should appear in the conversation as an image preview

  Scenario: Send file attachment
    Given I am in a conversation
    When I click the attachment button
    And I select a non-image file
    Then the file should be uploaded
    And it should appear as a file preview with name and size

  # Receiving Messages
  @realtime
  Scenario: Receive message in real-time
    Given I am in a conversation with "Alice"
    When Alice sends me a message
    Then the message should appear immediately
    And I should see Alice's avatar next to the message

  @realtime
  Scenario: Receive message notification when viewing different conversation
    Given I am viewing a conversation with "Bob"
    When "Alice" sends me a message
    Then Alice's conversation should show an unread count badge

  # Emoji Reactions
  Scenario: Add emoji reaction to message
    Given I am in a conversation with "Alice"
    And there is a message in the conversation
    When I click the "+" button on a message
    And I select an emoji
    Then the emoji reaction should appear on the message
    And I should see the count of users who added that reaction

  Scenario: Remove emoji reaction from message
    Given I have added a reaction to a message
    When I click on my reaction
    Then the reaction should be removed

  # Conversation List
  Scenario: View all conversations
    Given I have conversations with multiple users
    When I go to the messages page
    Then I should see a list of all my conversations
    And each conversation should show the other user's name
    And each conversation should show the last message preview
    And each conversation should show a timestamp
    And conversations with unread messages should show a badge

  Scenario: Conversations ordered by recent activity
    Given I have multiple conversations
    When a new message is received in an older conversation
    Then that conversation should move to the top of the list

  Scenario: Search conversations
    Given I have many conversations
    When I type in the search box
    Then I should see conversations matching by user name
    Or I should see conversations matching by email
    Or I should see conversations matching by message content

  # Read Status
  @read-status
  Scenario: Mark messages as read
    Given I have unread messages from "Alice"
    When I open the conversation with Alice
    Then the messages should be marked as read
    And the unread badge should disappear from the conversation list

  @read-status
  Scenario: See read receipts on sent messages
    Given I have sent a message to "Alice"
    Then I should see "Sent" below my message
    When Alice reads my message
    Then I should see "Read" below my message

  # Presence
  @presence
  Scenario: See user online status
    Given I am in a conversation with "Alice"
    When Alice is online
    Then I should see a green dot indicator for Alice
    And I should see "Online" text below Alice's name

  @presence
  Scenario: See user offline status
    Given I am in a conversation with "Alice"
    When Alice is offline
    Then I should see a gray dot indicator for Alice
    And I should see "Offline" text below Alice's name

  # Message Grouping
  Scenario: Messages grouped by date
    Given I have messages from different days
    When I view the conversation
    Then I should see date separators between message groups
    And today's messages should show "Today"
    And yesterday's messages should show "Yesterday"
    And older messages should show the full date

  # Loading States
  Scenario: Conversation loading state
    Given I am signed in
    When I navigate to the messages page
    And conversations are loading
    Then I should see a loading skeleton animation

  Scenario: Empty conversation state
    Given I have a conversation with no messages
    When I view the conversation
    Then I should see "Start a conversation"
    And I should see the other user's name

  # Guest Access
  @guest-mode
  Scenario: Guest user cannot access messages
    Given I am not signed in
    When I try to navigate to the messages page
    Then I should be redirected to the signin page
    And my intended destination should be preserved as "/messages"
