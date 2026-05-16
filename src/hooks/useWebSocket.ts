import { useEffect, useRef, useCallback, useState } from "react";
import Cookies from "js-cookie";

export interface WebSocketMessage<T = any> {
  id?: string;
  type?: string;
  data?: T;
  [key: string]: any;
}

export interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  enabled?: boolean;
}

export type WebSocketStatus = "connecting" | "open" | "closed" | "error";

export interface UseWebSocketReturn {
  status: WebSocketStatus;
  send: (data: any) => void;
  close: () => void;
  reconnect: () => void;
  isConnected: boolean;
}

const WS_BASE = (
  process.env.NEXT_PUBLIC_WS_URL ?? "wss://nextvibe-nest-backend.onrender.com"
)
  .replace(/^http:/, "ws:")
  .replace(/^https:/, "wss:")
  .replace(/\/$/, "");

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    enabled = true,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const onOpenRef = useRef(onOpen);
  const onMessageRef = useRef(onMessage);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onOpenRef.current = onOpen;
    onMessageRef.current = onMessage;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  }, [onOpen, onMessage, onClose, onError]);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    cleanup();

    const token = Cookies.get("accessToken");
    if (!token) {
      setStatus("error");
      return;
    }

    // Build full WebSocket URL
    const fullUrl = url.startsWith("ws://") || url.startsWith("wss://")
      ? url
      : `${WS_BASE}${url.startsWith("/") ? url : `/${url}`}`;

    // Add token to URL if not already present
    const wsUrl = fullUrl.includes("?")
      ? `${fullUrl}&token=${token}`
      : `${fullUrl}?token=${token}`;

    setStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setStatus("open");
        onOpenRef.current?.();
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current?.(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        if (!mountedRef.current) return;
        setStatus("error");
        onErrorRef.current?.(error);
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus("closed");
        onCloseRef.current?.();

        // Auto-reconnect if enabled
        if (autoReconnect && mountedRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setStatus("error");
    }
  }, [
    enabled,
    url,
    autoReconnect,
    reconnectInterval,
    cleanup,
  ]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      wsRef.current.send(payload);
      return true;
    }
    return false;
  }, []);

  const closeConnection = useCallback(() => {
    cleanup();
    setStatus("closed");
  }, [cleanup]);

  const reconnect = useCallback(() => {
    cleanup();
    connect();
  }, [cleanup, connect]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [connect, cleanup]);

  return {
    status,
    send,
    close: closeConnection,
    reconnect,
    isConnected: status === "open",
  };
}
