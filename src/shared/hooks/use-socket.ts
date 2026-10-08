"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

export type SocketStatus = "connecting" | "connected" | "disconnected" | "error";

const SOCKET_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://nextvibe-nest-backend.onrender.com"
).replace(/\/$/, "");

export function useSocket(
  namespace: "messaging" | "notifications",
  { enabled = true }: { enabled?: boolean } = {}
) {
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Try both cookie names — regular users use "accessToken", admins use "admin_accessToken"
    const token = Cookies.get("accessToken") ?? Cookies.get("admin_accessToken");
    if (!token) {
      setStatus("error");
      return;
    }

    console.log(`[socket/${namespace}] connecting to ${SOCKET_BASE}/${namespace}`);

    const socket = io(`${SOCKET_BASE}/${namespace}`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;
    setStatus("connecting");

    socket.on("connect", () => {
      console.log(`[socket/${namespace}] ✅ connected  id=${socket.id}`);
      setStatus("connected");
    });
    socket.on("connect_error", (err) => {
      console.error(`[socket/${namespace}] ❌ connect_error:`, err.message);
      setStatus("error");
    });
    socket.on("disconnect", (reason) => {
      console.warn(`[socket/${namespace}] 🔌 disconnected  reason=${reason}`);
      setStatus("disconnected");
    });
    socket.on("reconnect", (attempt) => {
      console.log(`[socket/${namespace}] 🔄 reconnected after ${attempt} attempt(s)`);
    });

    return () => {
      console.log(`[socket/${namespace}] cleanup — disconnecting`);
      socket.disconnect();
      socketRef.current = null;
      setStatus("disconnected");
    };
  }, [namespace, enabled]);

  const emit = useCallback((event: string, ...args: any[]) => {
    socketRef.current?.emit(event, ...args);
  }, []);

  return { socketRef, status, isConnected: status === "connected", emit };
}
