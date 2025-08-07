import { type VoiceSession, type InsertVoiceSession, type WidgetConfig, type InsertWidgetConfig } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Voice sessions
  createVoiceSession(session: InsertVoiceSession): Promise<VoiceSession>;
  getVoiceSession(id: string): Promise<VoiceSession | undefined>;
  updateVoiceSession(id: string, updates: Partial<VoiceSession>): Promise<VoiceSession | undefined>;
  endVoiceSession(id: string, endTime: Date, duration?: string): Promise<VoiceSession | undefined>;

  // Widget configs
  createWidgetConfig(config: InsertWidgetConfig): Promise<WidgetConfig>;
  getWidgetConfig(id: string): Promise<WidgetConfig | undefined>;
  getWidgetConfigByApiKey(apiKey: string): Promise<WidgetConfig | undefined>;
}

export class MemStorage implements IStorage {
  private voiceSessions: Map<string, VoiceSession>;
  private widgetConfigs: Map<string, WidgetConfig>;

  constructor() {
    this.voiceSessions = new Map();
    this.widgetConfigs = new Map();
  }

  async createVoiceSession(insertSession: InsertVoiceSession): Promise<VoiceSession> {
    const id = randomUUID();
    const session: VoiceSession = {
      ...insertSession,
      id,
      status: insertSession.status || "idle",
      startTime: new Date(),
      endTime: null,
      duration: null,
      createdAt: new Date(),
      metadata: insertSession.metadata || {},
      retellCallId: insertSession.retellCallId || null,
    };
    this.voiceSessions.set(id, session);
    return session;
  }

  async getVoiceSession(id: string): Promise<VoiceSession | undefined> {
    return this.voiceSessions.get(id);
  }

  async updateVoiceSession(id: string, updates: Partial<VoiceSession>): Promise<VoiceSession | undefined> {
    const session = this.voiceSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.voiceSessions.set(id, updatedSession);
    return updatedSession;
  }

  async endVoiceSession(id: string, endTime: Date, duration?: string): Promise<VoiceSession | undefined> {
    const session = this.voiceSessions.get(id);
    if (!session) return undefined;

    const updatedSession = {
      ...session,
      status: "ended" as const,
      endTime,
      duration: duration || null,
    };
    this.voiceSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createWidgetConfig(insertConfig: InsertWidgetConfig): Promise<WidgetConfig> {
    const id = randomUUID();
    const config: WidgetConfig = {
      ...insertConfig,
      id,
      position: insertConfig.position || "bottom-right",
      primaryColor: insertConfig.primaryColor || "#2563EB",
      buttonSize: insertConfig.buttonSize || "medium",
      enabled: true,
      createdAt: new Date(),
      domain: insertConfig.domain || null,
    };
    this.widgetConfigs.set(id, config);
    return config;
  }

  async getWidgetConfig(id: string): Promise<WidgetConfig | undefined> {
    return this.widgetConfigs.get(id);
  }

  async getWidgetConfigByApiKey(apiKey: string): Promise<WidgetConfig | undefined> {
    return Array.from(this.widgetConfigs.values()).find(
      (config) => config.apiKey === apiKey,
    );
  }
}

export const storage = new MemStorage();
