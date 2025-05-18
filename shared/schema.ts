import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Hotels
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  amenities: text("amenities").array(),
});

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

// Booking Participants
export const bookingParticipants = pgTable("booking_participants", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // "invited", "pending", "confirmed", "checked_in", "completed"
  cost: integer("cost"), // Individual cost in cents
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Extended types for frontend use
export type UserProfile = User & {
  matchPercentage?: number;
  matchLabel?: string;
};

export type BookingDetails = Booking & {
  hotel: Hotel;
  participants: (BookingParticipant & { user: User })[];
};
