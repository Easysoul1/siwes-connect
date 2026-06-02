"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { getNotifications, getUnreadNotificationCount, markNotificationRead } from "@/lib/api";
import { NotificationItem } from "@/lib/types";

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

let socketInstance: Socket | null = null;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await getNotifications(session.accessToken);
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");

    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(baseUrl, {
        auth: { token: session.accessToken },
        transports: ["websocket", "polling"]
      });
    }
    socketRef.current = socketInstance;

    if (!socketInstance.hasListeners("notification")) {
      socketInstance.on("notification", (notification: NotificationItem) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners("notification");
        socketRef.current.disconnect();
        socketRef.current = null;
        socketInstance = null;
      }
    };
  }, [session?.accessToken, fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!session?.accessToken) return;
      try {
        await markNotificationRead(session.accessToken, id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silently fail
      }
    },
    [session?.accessToken]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, fetchNotifications, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
