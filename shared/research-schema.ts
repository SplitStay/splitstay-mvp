import { pgTable, serial, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Define action types for session recording
export type UserAction = {
  type: 'click' | 'navigation' | 'input' | 'focus' | 'blur' | 'scroll';
  target: string;
  timestamp: number;
  path: string;
  metadata?: any;
};

// Research data schema tables
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

// Create insert schemas
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

// Export types
export type ResearchSession = typeof researchSessions.$inferSelect;
export type InsertResearchSession = z.infer<typeof insertResearchSessionSchema>;

export type ResearchFeedback = typeof researchFeedback.$inferSelect;
export type InsertResearchFeedback = z.infer<typeof insertResearchFeedbackSchema>;

export type AudioRecording = typeof audioRecordings.$inferSelect;
export type InsertAudioRecording = z.infer<typeof insertAudioRecordingSchema>;