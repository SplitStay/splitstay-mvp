import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { type UserAction } from "./research-schema";

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
  
  // Safety Verification Fields
  phoneNumber: text("phone_number"),
  phoneVerified: boolean("phone_verified").default(false),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  
  // Social Media Verification
  linkedinProfile: text("linkedin_profile"),
  linkedinVerified: boolean("linkedin_verified").default(false),
  facebookProfile: text("facebook_profile"),
  facebookVerified: boolean("facebook_verified").default(false),
  socialVerifiedAt: timestamp("social_verified_at"),
  
  // Emergency Contact
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  
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

// Souvenirs
export const souvenirs = pgTable("souvenirs", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull(),
  userId: integer("user_id").notNull(),
  photoUrl: text("photo_url").notNull(),
  reviewText: text("review_text"),
  rating: integer("rating").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Souvenirs relations
export const souvenirsRelations = relations(souvenirs, ({ one }) => ({
  booking: one(bookings, {
    fields: [souvenirs.tripId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [souvenirs.userId],
    references: [users.id],
  }),
}));

// Schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  phoneVerified: true,
  phoneVerifiedAt: true,
  linkedinVerified: true,
  facebookVerified: true,
  socialVerifiedAt: true,
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

export const insertSouvenirSchema = createInsertSchema(souvenirs).omit({
  id: true,
  timestamp: true,
});

// User References/Travel Reviews for Safety
export const userReferences = pgTable("user_references", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User being referenced
  referenceType: text("reference_type").notNull(), // "travel_buddy", "hotel_staff", "host", "roommate"
  referrerName: text("referrer_name").notNull(),
  referrerEmail: text("referrer_email"),
  referrerPhone: text("referrer_phone"),
  relationship: text("relationship").notNull(), // How they know the user
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment").notNull(),
  verificationStatus: text("verification_status").default("pending"), // "pending", "verified", "rejected"
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Phone Verification Codes (for SMS verification)
export const phoneVerificationCodes = pgTable("phone_verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(), // 6-digit verification code
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User References relations
export const userReferencesRelations = relations(userReferences, ({ one }) => ({
  user: one(users, {
    fields: [userReferences.userId],
    references: [users.id],
  }),
}));

// Safety verification schemas
export const insertUserReferenceSchema = createInsertSchema(userReferences).omit({
  id: true,
  verifiedAt: true,
  createdAt: true,
});

export const insertPhoneVerificationSchema = createInsertSchema(phoneVerificationCodes).omit({
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

export type Souvenir = typeof souvenirs.$inferSelect;
export type InsertSouvenir = z.infer<typeof insertSouvenirSchema>;

export type UserReference = typeof userReferences.$inferSelect;
export type InsertUserReference = z.infer<typeof insertUserReferenceSchema>;
export type PhoneVerification = typeof phoneVerificationCodes.$inferSelect;
export type InsertPhoneVerification = z.infer<typeof insertPhoneVerificationSchema>;

// Extended types for frontend use
export type PreferredAccommodation = {
  name: string;
  platform: 'booking' | 'airbnb' | 'agoda' | string;
  url: string;
  isFlexible: boolean;
  roomType: string;
};

export type UserProfile = User & {
  matchPercentage?: number;
  matchLabel?: string;
  age?: string;
  gender?: string;
  languages?: string[];
  travelTraits?: string[];
  positiveReviews?: boolean;
  preferredAccommodation?: PreferredAccommodation;
};

export type BookingDetails = Booking & {
  hotel: Hotel;
  participants: (BookingParticipant & { user: User })[];
};




