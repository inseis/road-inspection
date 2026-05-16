import { S } from "../../styles/theme";
import { Icon } from "../common/Icons";
import { Logo } from "../common/Logo";

function Header({
  onLogoClick,
  onStartClick,
  onLogout,
  showStartButton = true,
  showLogoutButton = true,
  children,
}) {
  return (
    <div style={S.topbar} className="no-print">
      <button
        onClick={onLogoClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <Logo />
      </button>

      {children ? (
        children
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {showStartButton && (
            <button
              onClick={onStartClick}
              style={{
                ...S.btn("primary"),
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 800,
              }}
              className="btn-h"
            >
              분석 시작하기 <Icon.arrow width={14} height={14} />
            </button>
          )}

          {showLogoutButton && (
            <button
              onClick={onLogout}
              style={{
                ...S.btn("ghost"),
                padding: "8px 14px",
                fontSize: 12,
              }}
              className="btn-h"
            >
              로그아웃
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { Header };
