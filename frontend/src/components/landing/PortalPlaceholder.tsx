type Props = {
  title: string;
  description: string;
};

export function PortalPlaceholder({ title, description }: Props) {
  return (
    <main style={{ maxWidth: 940, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 style={{ fontFamily: "Bricolage Grotesque, sans-serif", marginBottom: 8 }}>{title}</h1>
      <p style={{ color: "#4B5563", marginTop: 0 }}>{description}</p>
    </main>
  );
}
