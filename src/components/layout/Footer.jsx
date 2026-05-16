import { C } from "../../styles/theme";

function Footer() {
  return (
    <footer
      style={{
        padding: "22px 32px",
        borderTop: `1px solid ${C.bdr}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: C.bg,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/logo.png"
          alt="logo"
          style={{ width: 50, height: 50, objectFit: "contain" }}
        />
        <span style={{ fontSize: 12, color: C.txtMut, fontWeight: 500 }}>
          도로 손상 탐지 및 분석 플랫폼
        </span>
      </div>
      <span
        style={{
          fontSize: 11,
          color: C.txtMut,
          maxWidth: 500,
          textAlign: "right",
          wordBreak: "keep-all",
          lineHeight: 1.5,
        }}
      >
        본 서비스는 자율주행 차량 제어, 실시간 도로 관제, 도로 안전 등급 자동
        판정을 목적으로 하지 않습니다.
      </span>
    </footer>
  );
}

export { Footer };
