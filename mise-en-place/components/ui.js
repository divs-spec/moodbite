"use client";

export function Section({ title, subtitle, children, faded = false }) {
  return (
    <div className="animate-fade-up" style={{
      marginBottom: 24,
      padding: "28px 32px",
      background: faded ? "transparent" : "var(--bg-card)",
      border: `1px solid ${faded ? "var(--border)" : "var(--border-hi)"}`,
      borderRadius: 14,
      opacity: faded ? 0.6 : 1,
      transition: "opacity 0.3s",
    }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
        {subtitle && (
          <p style={{ margin: "4px 0 0", color: "var(--text-mute)", fontStyle: "italic", fontSize: 13 }}>{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function Label({ children }) {
  return (
    <div style={{
      fontFamily: "var(--font-body)",
      fontSize: 11,
      color: "var(--text-mute)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      marginBottom: 10,
      fontWeight: 600,
    }}>{children}</div>
  );
}

export function Chip({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px",
      background: active ? "var(--gold)" : "var(--bg-inset)",
      border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
      borderRadius: 100,
      color: active ? "#0f0e0c" : "var(--text-mid)",
      fontSize: 13,
      fontFamily: "var(--font-body)",
      fontWeight: active ? 700 : 400,
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

export function PrimaryButton({ children, onClick, disabled, outline = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "13px 32px",
      background: outline ? "transparent" : disabled ? "#3a3025" : "var(--gold)",
      border: `1px solid ${outline ? "var(--gold)" : "transparent"}`,
      borderRadius: 8,
      color: outline ? "var(--gold)" : disabled ? "var(--text-mute)" : "#0f0e0c",
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "0.03em",
      display: "block",
      width: "100%",
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}>{children}</button>
  );
}

export function Badge({ children, gold = false }) {
  return (
    <span style={{
      padding: "3px 10px",
      borderRadius: 100,
      fontSize: 11,
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      background: gold ? "var(--gold-dim)" : "rgba(255,255,255,0.06)",
      color: gold ? "var(--gold)" : "var(--text-mute)",
      border: `1px solid ${gold ? "var(--gold-bdr)" : "rgba(255,255,255,0.08)"}`,
    }}>{children}</span>
  );
}

export function InfoCard({ label, text }) {
  return (
    <div style={{
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "12px 14px",
    }}>
      <div style={{
        fontSize: 11,
        fontFamily: "var(--font-body)",
        color: "var(--text-mute)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 6,
        fontWeight: 600,
      }}>{label}</div>
      <div style={{
        fontSize: 13,
        color: "var(--text-mid)",
        fontStyle: "italic",
        lineHeight: 1.6,
      }}>{text}</div>
    </div>
  );
}

export function SummaryRow({ label, value, last }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      paddingBottom: last ? 0 : 12,
      marginBottom: last ? 0 : 12,
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <span style={{ color: "var(--text-mute)", fontFamily: "var(--font-body)", fontSize: 13 }}>{label}</span>
      <span style={{ color: "var(--gold)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

export function StepDots({ current, total = 4 }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i < current - 1 ? 8 : i === current - 1 ? 10 : 6,
          height: i < current - 1 ? 8 : i === current - 1 ? 10 : 6,
          borderRadius: "50%",
          background: i < current - 1 ? "var(--gold)" : i === current - 1 ? "var(--text)" : "var(--border)",
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}
