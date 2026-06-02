"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications } from "./NotificationProvider";

export function NotificationBell() {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) fetchNotifications();
        }}
        aria-label="Notifications"
        style={{
          position: "relative",
          border: "1px solid #D1D5DB",
          borderRadius: 8,
          background: "white",
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 18
        }}
      >
        {"\u{1F514}"}
        {unreadCount > 0 ? (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#B91C1C",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 360,
            maxHeight: 420,
            overflowY: "auto",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            zIndex: 100
          }}
        >
          <div
            style={{
              padding: "0.7rem 0.9rem",
              borderBottom: "1px solid #E5E7EB",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Notifications
          </div>

          {loading ? (
            <p style={{ padding: "0.9rem", margin: 0, color: "#6B7280", fontSize: 13 }}>
              Loading...
            </p>
          ) : notifications.length === 0 ? (
            <p style={{ padding: "0.9rem", margin: 0, color: "#6B7280", fontSize: 13 }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.isRead) markAsRead(n.id);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.65rem 0.9rem",
                  border: "none",
                  borderBottom: "1px solid #F3F4F6",
                  background: n.isRead ? "white" : "#EFF6FF",
                  cursor: "pointer"
                }}
              >
                <p style={{ margin: 0, fontWeight: n.isRead ? 400 : 600, fontSize: 13 }}>
                  {n.title}
                </p>
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    color: "#4B5563",
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {n.message}
                </p>
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    color: "#9CA3AF",
                    fontSize: 11
                  }}
                >
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
