import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { realtimeEventSchema, type RealtimeEvent } from "@shared/schema";

// Installation state stored on server
let installationState = {
  currentScene: 1,
  volume: 0.8,
  scene1AutoEnabled: false,
};

// Track connected clients by role
const clients: Map<WebSocket, { role: "remote" | "stage" }> = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🔌 New WebSocket connection");

    // Send initial state when client connects
    const syncMessage: RealtimeEvent = {
      type: "state_sync",
      state: installationState,
    };
    ws.send(JSON.stringify(syncMessage));

    ws.on("message", (rawData: Buffer) => {
      try {
        const data = JSON.parse(rawData.toString());
        const event = realtimeEventSchema.parse(data);

        // Handle different event types
        switch (event.type) {
          case "client_identify":
            clients.set(ws, { role: event.role });
            console.log(`✅ Client identified as: ${event.role}`);
            break;

          case "scene_change":
            installationState.currentScene = event.sceneId;
            if (event.sceneId !== 1) {
              installationState.scene1AutoEnabled = false;
            }
            broadcast(event, ws);
            broadcastState();
            console.log(`🎬 Scene changed to: ${event.sceneId}`);
            break;

          case "phrase_trigger":
            broadcast(event, ws);
            console.log(`💬 Phrase triggered: "${event.phraseText}"`);
            break;

          case "scene1_complete":
            installationState.scene1AutoEnabled = true;
            broadcast(event, ws);
            broadcastState();
            console.log(`🎉 Scene 1 complete! Auto-mode enabled`);
            break;

          case "volume_change":
            installationState.volume = event.volume;
            broadcast(event, ws);
            broadcastState();
            console.log(`🔊 Volume changed to: ${event.volume}`);
            break;

          case "heartbeat":
            ws.send(JSON.stringify({ type: "heartbeat" }));
            break;

          default:
            console.log("⚠️ Unknown event type:", data);
        }
      } catch (error) {
        console.error("❌ WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("🔌 WebSocket connection closed");
    });

    ws.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });
  });

  // Broadcast event to all connected clients except sender
  function broadcast(event: RealtimeEvent, sender?: WebSocket) {
    const message = JSON.stringify(event);
    wss.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Broadcast current state to all connected clients
  function broadcastState() {
    const syncMessage: RealtimeEvent = {
      type: "state_sync",
      state: installationState,
    };
    const message = JSON.stringify(syncMessage);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Heartbeat to keep connections alive
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30000); // Ping every 30 seconds

  return httpServer;
}
