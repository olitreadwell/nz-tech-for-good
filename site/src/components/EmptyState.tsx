import { url } from "../lib/url";

export default function EmptyState({
  icon = "🔍",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="prose" style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{icon}</div>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ color: "var(--text-muted)", maxWidth: "28rem", margin: "0 auto 1rem" }}>
        {description}
      </p>
      {action && (
        <a href={url(action.href)} className="button">
          {action.label}
        </a>
      )}
    </div>
  );
}
