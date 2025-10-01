import { useEffect, useRef, useState, useCallback } from "react";
import { type RealtimeEvent } from "@shared/schema";

interface UseRealtimeConnectionOptions {
  role: "remote" | "stage";
  onMessage?: (event: RealtimeEvent) => void;
}

export function useRealtimeConnection({
  role,
  onMessage,
}: UseRealtimeConnectionOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ WebSocket connected as ${role}`);
      setIsConnected(true);

      // Identify client role
      const identifyEvent: RealtimeEvent = {
        type: "client_identify",
        role,
      };
      ws.send(JSON.stringify(identifyEvent));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;
        console.log(`📩 Received event:`, data);
        onMessage?.(data);
      } catch (error) {
        console.error("❌ Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setIsConnected(false);

      // Attempt to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Attempting to reconnect...");
        connect();
      }, 2000);
    };
  }, [role, onMessage]);

  // Send event to server
  const sendEvent = useCallback((event: RealtimeEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
      console.log(`📤 Sent event:`, event);
    } else {
      console.error("❌ WebSocket not connected, cannot send event:", event);
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    sendEvent,
  };
}
