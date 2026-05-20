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

    const token = Cookies.get("accessToken");
    if (!token) {
      setStatus("error");
      return;
    }

    const socket = io(`${SOCKET_BASE}/${namespace}`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;
    setStatus("connecting");

    socket.on("connect", () => setStatus("connected"));
    socket.on("connect_error", (err) => {
      console.error(`[socket/${namespace}] connect error:`, err.message);
      setStatus("error");
    });
    socket.on("disconnect", () => setStatus("disconnected"));

    return () => {
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
