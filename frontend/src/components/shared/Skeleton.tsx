"use client";

type Props = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
};

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style
}: Props) {
  return (
    <div
      aria-hidden
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease-in-out infinite",
        ...style
      }}
    />
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        background: "white",
        padding: "0.9rem",
        display: "grid",
        gap: 10
      }}
    >
      <Skeleton width="40%" height={14} />
      <Skeleton width="75%" height={20} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={`${60 + Math.random() * 30}%`} height={14} />
      ))}
    </div>
  );
}

export function StatsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
        gap: 10,
        marginBottom: 18
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            background: "white",
            padding: "0.9rem",
            display: "grid",
            gap: 8
          }}
        >
          <Skeleton width="50%" height={13} />
          <Skeleton width="30%" height={24} />
        </div>
      ))}
    </div>
  );
}
