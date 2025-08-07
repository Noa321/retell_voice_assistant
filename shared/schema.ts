import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const voiceSessions = pgTable("voice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  retellCallId: text("retell_call_id"),
  agentId: text("agent_id").notNull(),
  status: text("status").notNull().default("idle"), // idle, connecting, connected, ended, error
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: text("duration"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const widgetConfigs = pgTable("widget_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKey: text("api_key").notNull(),
  agentId: text("agent_id").notNull(),
  position: text("position").default("bottom-right"),
  primaryColor: text("primary_color").default("#2563EB"),
  buttonSize: text("button_size").default("medium"),
  enabled: boolean("enabled").default(true),
  domain: text("domain"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVoiceSessionSchema = createInsertSchema(voiceSessions).pick({
  retellCallId: true,
  agentId: true,
  status: true,
  metadata: true,
});

export const insertWidgetConfigSchema = createInsertSchema(widgetConfigs).pick({
  apiKey: true,
  agentId: true,
  position: true,
  primaryColor: true,
  buttonSize: true,
  domain: true,
});

export type InsertVoiceSession = z.infer<typeof insertVoiceSessionSchema>;
export type VoiceSession = typeof voiceSessions.$inferSelect;

export type InsertWidgetConfig = z.infer<typeof insertWidgetConfigSchema>;
export type WidgetConfig = typeof widgetConfigs.$inferSelect;

// WebSocket message types
export const voiceMessageSchema = z.object({
  type: z.enum(["audio_chunk", "start_session", "end_session", "state_change", "error"]),
  sessionId: z.string().optional(),
  data: z.any().optional(),
  timestamp: z.number(),
});

export type VoiceMessage = z.infer<typeof voiceMessageSchema>;
