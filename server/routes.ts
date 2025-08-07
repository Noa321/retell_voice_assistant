import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertVoiceSessionSchema, insertWidgetConfigSchema, voiceMessageSchema, type VoiceMessage } from "@shared/schema";
import { z } from "zod";

interface VoiceWebSocket extends WebSocket {
  sessionId?: string;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time voice communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active connections
  const activeConnections = new Map<string, VoiceWebSocket>();

  // Retell.AI API configuration
  const RETELL_API_KEY = process.env.RETELL_API_KEY || "";
  const RETELL_API_URL = "https://api.retellai.com";

  // Voice session endpoints
  app.post("/api/voice/session", async (req, res) => {
    try {
      const data = insertVoiceSessionSchema.parse(req.body);
      const session = await storage.createVoiceSession(data);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/voice/session/:id", async (req, res) => {
    try {
      const session = await storage.getVoiceSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/voice/session/:id", async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateVoiceSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Widget configuration endpoints
  app.post("/api/widget/config", async (req, res) => {
    try {
      const data = insertWidgetConfigSchema.parse(req.body);
      const config = await storage.createWidgetConfig(data);
      res.json(config);
    } catch (error) {
      res.status(400).json({ message: "Invalid config data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/widget/config/:apiKey", async (req, res) => {
    try {
      const config = await storage.getWidgetConfigByApiKey(req.params.apiKey);
      if (!config) {
        return res.status(404).json({ message: "Config not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to get config", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Retell.AI integration endpoints
  app.post("/api/retell/call", async (req, res) => {
    try {
      const { agentId, fromNumber, toNumber, metadata } = req.body;

      const response = await fetch(`${RETELL_API_URL}/create-web-call`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          metadata: metadata || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Retell API error: ${response.status}`);
      }

      const callData = await response.json();
      res.json(callData);
    } catch (error) {
      console.error("Failed to create Retell call:", error);
      res.status(500).json({ message: "Failed to create call", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: VoiceWebSocket, req) => {
    console.log('New WebSocket connection established');
    
    ws.isAlive = true;
    ws.sessionId = undefined;

    // Handle heartbeat
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as VoiceMessage;
        const validatedMessage = voiceMessageSchema.parse(message);

        switch (validatedMessage.type) {
          case 'start_session':
            if (validatedMessage.data?.agentId) {
              // Create new voice session
              const session = await storage.createVoiceSession({
                agentId: validatedMessage.data.agentId,
                status: "connecting",
                metadata: validatedMessage.data.metadata || {},
              });

              ws.sessionId = session.id;
              activeConnections.set(session.id, ws);

              // Initiate call with Retell.AI
              try {
                const callResponse = await fetch(`${RETELL_API_URL}/create-web-call`, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${RETELL_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    agent_id: validatedMessage.data.agentId,
                    metadata: validatedMessage.data.metadata || {},
                  }),
                });

                if (callResponse.ok) {
                  const callData = await callResponse.json();
                  
                  // Update session with call ID
                  await storage.updateVoiceSession(session.id, {
                    retellCallId: callData.call_id,
                    status: "connected",
                  });

                  // Send success response with access token
                  ws.send(JSON.stringify({
                    type: "state_change",
                    data: { 
                      status: "connected", 
                      callId: callData.call_id,
                      sessionId: session.id,
                      accessToken: callData.access_token
                    },
                    timestamp: Date.now(),
                  }));
                } else {
                  const errorText = await callResponse.text();
                  console.error(`Retell API error: ${callResponse.status} - ${errorText}`);
                  throw new Error(`Retell API error: ${callResponse.status}`);
                }
              } catch (error) {
                console.error("Failed to start Retell call:", error);
                await storage.updateVoiceSession(session.id, { status: "error" });
                
                ws.send(JSON.stringify({
                  type: "error",
                  data: { message: "Failed to connect to voice service" },
                  timestamp: Date.now(),
                }));
              }
            }
            break;

          case 'audio_chunk':
            if (ws.sessionId && validatedMessage.data) {
              // Forward audio chunk to Retell.AI
              // This would typically involve streaming the audio data
              console.log(`Received audio chunk for session ${ws.sessionId}`);
            }
            break;

          case 'end_session':
            if (ws.sessionId) {
              await storage.endVoiceSession(ws.sessionId, new Date());
              activeConnections.delete(ws.sessionId);
              
              ws.send(JSON.stringify({
                type: "state_change",
                data: { status: "ended" },
                timestamp: Date.now(),
              }));
            }
            break;

          default:
            console.log('Unknown message type:', validatedMessage.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: "error",
          data: { message: "Invalid message format" },
          timestamp: Date.now(),
        }));
      }
    });

    ws.on('close', async () => {
      console.log('WebSocket connection closed');
      if (ws.sessionId) {
        await storage.endVoiceSession(ws.sessionId, new Date());
        activeConnections.delete(ws.sessionId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Heartbeat to keep connections alive
  const interval = setInterval(() => {
    wss.clients.forEach((ws: VoiceWebSocket) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  // Get widget configuration
  app.get("/api/widget/demo-config", (req, res) => {
    res.json({
      apiKey: RETELL_API_KEY,
      agentId: process.env.RETELL_AGENT_ID || "",
    });
  });

  // Create web call endpoint for frontend
  app.post("/api/voice/create-web-call", async (req, res) => {
    try {
      const { agentId, apiKey: clientApiKey } = req.body;
      
      // Validate the request
      if (!agentId) {
        return res.status(400).json({ error: "Agent ID is required" });
      }

      // Use server API key for security
      const callResponse = await fetch(`${RETELL_API_URL}/v2/create-web-call`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          metadata: {},
        }),
      });

      if (!callResponse.ok) {
        const errorText = await callResponse.text();
        console.error(`Retell API error: ${callResponse.status} - ${errorText}`);
        return res.status(500).json({ error: "Failed to create web call" });
      }

      const callData = await callResponse.json();
      res.json({ accessToken: callData.access_token });
    } catch (error) {
      console.error("Create web call error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve the embeddable widget script
  app.get('/retell-widget.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile('retell-widget.js', { root: 'public' });
  });

  return httpServer;
}
