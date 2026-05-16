import { C } from "../../styles/theme";
import { Icon } from "./Icons";

/* ─── Error Banner ───────────────────────────────────────────── */
function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        marginBottom: 16,
        background: C.redLt,
        border: `1px solid rgba(248,113,113,0.25)`,
        borderRadius: 10,
        borderLeft: `3px solid ${C.red}`,
      }}
    >
      <Icon.info
        width={15}
        height={15}
        stroke={C.red}
        style={{ flexShrink: 0 }}
      />
      <span style={{ fontSize: 13, fontWeight: 500, color: C.red, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: C.red,
          display: "flex",
        }}
      >
        <Icon.x width={15} height={15} />
      </button>
    </div>
  );
}

export { ErrorBanner };
