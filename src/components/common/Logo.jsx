import { C } from "../../styles/theme";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img
      src="/logo.png"
      alt="logo"
      style={{ width: 100, height: 100, objectFit: "contain", flexShrink: 0 }}
    />
    <div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: C.txtPri,
          letterSpacing: "-0.3px",
          lineHeight: 1.3,
        }}
      >
        도로 점검 플랫폼
      </div>
      <div style={{ fontSize: 12, color: C.txtMut, lineHeight: 1.3 }}>
        Road Inspection Assistant
      </div>
    </div>
  </div>
);

export { Logo };
