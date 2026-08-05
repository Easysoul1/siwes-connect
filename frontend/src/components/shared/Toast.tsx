"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
  duration?: number;
}

const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "#ECFDF5", border: "#6EE7B7", text: "#065F46", icon: "\u2713" },
  error: { bg: "#FEF2F2", border: "#FCA5A5", text: "#991B1B", icon: "\u2717" },
  info: { bg: "#EFF6FF", border: "#93C5FD", text: "#1E40AF", icon: "\u2139" }
};

export default function Toast({ message, type = "success", onDismiss, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onDismiss]);

  const s = styles[type] || styles.info;

  return (
    <div
      style={{
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        minWidth: 280,
        maxWidth: 420,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 10,
        padding: "0.85rem 1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 2rem))",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease"
      }}
    >
      <span
        style={{
          fontSize: 16,
          lineHeight: 1,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: s.text,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        {s.icon}
      </span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: s.text, lineHeight: 1.4 }}>
        {message}
      </span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: s.text,
          fontSize: 16,
          padding: 2,
          lineHeight: 1,
          opacity: 0.6,
          flexShrink: 0
        }}
      >
        \u00D7
      </button>
    </div>
  );
}
