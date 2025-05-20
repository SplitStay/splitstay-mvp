import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  profilePicture: text("profile_picture"),
  age: text("age").notNull(), // Age range like "21-25"
  gender: text("gender").notNull(),
  languages: text("languages").array().notNull(),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  preferences: jsonb("preferences"), // Store travel preferences as JSON
  createdAt: timestamp("created_at").defaultNow(),
});

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  bookingParticipants: many(bookingParticipants),
  sentMessages: many(messages, { relationName: "sender" }),
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
}));

// Hotels
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  amenities: text("amenities").array(),
});

// Hotels relations
export const hotelsRelations = relations(hotels, ({ many }) => ({
  bookings: many(bookings),
}));

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  hotelId: integer("hotel_id").notNull(),
  roomType: text("room_type").notNull(), // "twin", "separate", etc.
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  totalCost: integer("total_cost").notNull(), // In cents
  status: text("status").notNull(), // "pending", "confirmed", "completed", "cancelled"
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings relations
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  hotel: one(hotels, {
    fields: [bookings.hotelId],
    references: [hotels.id],
  }),
  participants: many(bookingParticipants),
  messages: many(messages),
  reviews: many(reviews),
}));

// Booking Participants
export const bookingParticipants = pgTable("booking_participants", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // "invited", "pending", "confirmed", "checked_in", "completed"
  cost: integer("cost"), // Individual cost in cents
});

// Booking Participants relations
export const bookingParticipantsRelations = relations(bookingParticipants, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingParticipants.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [bookingParticipants.userId],
    references: [users.id],
  }),
}));

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages relations
export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  revieweeId: integer("reviewee_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
}));

// Schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertBookingParticipantSchema = createInsertSchema(bookingParticipants).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertResearchSessionSchema = createInsertSchema(researchSessions).omit({
  createdAt: true,
});

export const insertResearchFeedbackSchema = createInsertSchema(researchFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertAudioRecordingSchema = createInsertSchema(audioRecordings).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type BookingParticipant = typeof bookingParticipants.$inferSelect;
export type InsertBookingParticipant = z.infer<typeof insertBookingParticipantSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ResearchSession = typeof researchSessions.$inferSelect;
export type InsertResearchSession = z.infer<typeof insertResearchSessionSchema>;

export type ResearchFeedback = typeof researchFeedback.$inferSelect;
export type InsertResearchFeedback = z.infer<typeof insertResearchFeedbackSchema>;

export type AudioRecording = typeof audioRecordings.$inferSelect;
export type InsertAudioRecording = z.infer<typeof insertAudioRecordingSchema>;

// Extended types for frontend use
export type UserProfile = User & {
  matchPercentage?: number;
  matchLabel?: string;
  age?: string;
  gender?: string;
  languages?: string[];
  travelTraits?: string[];
  positiveReviews?: boolean;
};

export type BookingDetails = Booking & {
  hotel: Hotel;
  participants: (BookingParticipant & { user: User })[];
};

// Research data schemas
export const researchSessions = pgTable("research_sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  recordedActions: jsonb("recorded_actions").$type<UserAction[]>(),
  hasAudioRecording: boolean("has_audio_recording").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const researchFeedback = pgTable("research_feedback", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => researchSessions.id),
  rating: integer("rating"),
  feedbackText: text("feedback_text"),
  wouldUse: boolean("would_use"),
  knowsOthersWhoWouldUse: boolean("knows_others_who_would_use"),
  contactEmail: text("contact_email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const audioRecordings = pgTable("audio_recordings", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => researchSessions.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UserAction = {
  type: 'click' | 'navigation' | 'input' | 'focus' | 'blur' | 'scroll';
  target: string;
  timestamp: number;
  path: string;
  metadata?: any;
};

export type ResearchSession = typeof researchSessions.$inferSelect;
export type InsertResearchSession = typeof researchSessions.$inferInsert;

export type ResearchFeedback = typeof researchFeedback.$inferSelect;
export type InsertResearchFeedback = typeof researchFeedback.$inferInsert;

export type AudioRecording = typeof audioRecordings.$inferSelect;
export type InsertAudioRecording = typeof audioRecordings.$inferInsert;
