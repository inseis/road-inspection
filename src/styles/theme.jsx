import { sev } from "../utils/severity";

/* ─── Design tokens ──────────────────────────────────────────── */
const C = {
  cyan: "#22D3EE",
  cyanLt: "rgba(34,211,238,0.10)",
  cyanBdr: "rgba(34,211,238,0.22)",
  cyanGlow: "rgba(34,211,238,0.30)",
  red: "#F87171",
  redLt: "rgba(248,113,113,0.12)",
  amber: "#FBBF24",
  amberLt: "rgba(251,191,36,0.12)",
  green: "#34D399",
  greenLt: "rgba(52,211,153,0.12)",
  purple: "#A78BFA",
  purpleLt: "rgba(167,139,250,0.12)",
  bg: "#0A0E14",
  bgCard: "#111318",
  bgEl: "#181C23",
  bgHover: "#1E2230",
  bdr: "rgba(255,255,255,0.06)",
  bdrMd: "rgba(255,255,255,0.11)",
  bdrHi: "rgba(255,255,255,0.20)",
  txtPri: "#F0F6FC",
  txtSec: "#7D8590",
  txtMut: "#3D444D",
};

/* ─── Shared styles ──────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'Space Grotesk',sans-serif",
    color: C.txtPri,
  },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    height: 80,
    background: "rgba(10,14,20,0.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: `1px solid ${C.bdr}`,
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  card: {
    background: C.bgCard,
    border: `1px solid ${C.bdr}`,
    borderRadius: 16,
    padding: "24px 28px",
  },
  tag: (color = C.cyan) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 20,
    background: `${color}15`,
    border: `1px solid ${color}28`,
    fontSize: 11,
    fontWeight: 700,
    color,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
  }),
  badge: (sv) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 9px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
    background: sev(sv).bg,
    color: sev(sv).color,
  }),
  secLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: C.txtMut,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 14,
  },
  btn: (v = "primary", dis = false) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "10px 22px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: dis ? "not-allowed" : "pointer",
    border: "none",
    outline: "none",
    transition: "all 0.15s",
    opacity: dis ? 0.45 : 1,
    flexShrink: 0,
    ...(v === "primary"
      ? {
          background: C.cyan,
          color: "#080B10",
          fontWeight: 700,
          boxShadow: `0 4px 20px ${C.cyanGlow}`,
        }
      : v === "ghost"
        ? {
            background: "transparent",
            color: C.txtSec,
            border: `1px solid ${C.bdrMd}`,
          }
        : v === "danger"
          ? { background: C.redLt, color: C.red }
          : {
              background: C.bgEl,
              color: C.txtSec,
              border: `1px solid ${C.bdr}`,
            }),
  }),
};

export { C, S };
