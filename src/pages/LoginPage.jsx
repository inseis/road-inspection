import { useEffect, useRef, useState } from "react";

import { C, S } from "../styles/theme";
import { Icon } from "../components/common/Icons";
import { ErrorBanner } from "../components/common/ErrorBanner";

/* ─── Login Page ─────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("초대 코드를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 900));
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const res = await fetch("/api/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({invite_code:code.trim()})});
      // if (!res.ok) throw new Error("유효하지 않은 초대 코드입니다.");
      // ───────────────────────────────────────────────────────
      if (code.trim().toUpperCase() === "ROAD2026") onLogin();
      else throw new Error("유효하지 않은 초대 코드입니다.");
    } catch (e) {
      setError(e.message);
      setCode("");
      ref.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Space Grotesk',sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(34,211,238,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src="/logo.png"
            alt="logo"
            style={{
              width: 64,
              height: 64,
              objectFit: "contain",
              marginBottom: 18,
            }}
          />
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: C.txtPri,
              letterSpacing: "-0.5px",
              marginBottom: 5,
            }}
          >
            도로 점검 플랫폼
          </h1>
          <p style={{ fontSize: 13, color: C.txtMut }}>
            Road Inspection Assistant
          </p>
        </div>

        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.bdrMd}`,
            borderRadius: 20,
            padding: "32px 28px",
            boxShadow: `0 0 60px rgba(34,211,238,0.06)`,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.txtPri,
                marginBottom: 6,
              }}
            >
              초대 코드로 입장
            </h2>
            <p
              style={{
                fontSize: 13,
                color: C.txtSec,
                lineHeight: 1.6,
                userSelect: "none",
              }}
            >
              담당자로부터 발급받은 초대 코드를 입력하세요.
            </p>
          </div>

          <ErrorBanner message={error} onClose={() => setError(null)} />

          <form onSubmit={handleLogin}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: C.txtMut,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              초대 코드
            </label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                ref={ref}
                type={show ? "text" : "password"}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                placeholder="초대 코드를 입력하세요"
                autoComplete="off"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 16px",
                  border: `1px solid ${error ? C.red : C.bdrMd}`,
                  borderRadius: 10,
                  fontSize: 15,
                  color: C.txtPri,
                  background: C.bgEl,
                  outline: "none",
                  fontFamily: "'JetBrains Mono',monospace",
                  letterSpacing: show ? "normal" : "0.18em",
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.txtMut,
                  display: "flex",
                }}
                tabIndex={-1}
              >
                {show ? (
                  <Icon.eyeOff width={16} height={16} />
                ) : (
                  <Icon.eye width={16} height={16} />
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              style={{
                ...S.btn("primary", loading || !code.trim()),
                width: "100%",
                padding: "13px",
                fontSize: 15,
              }}
              className="btn-h"
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: `2px solid rgba(8,11,16,0.3)`,
                      borderTop: `2px solid #080B10`,
                      animation: "spin 0.8s linear infinite",
                    }}
                  />{" "}
                  확인 중...
                </>
              ) : (
                <>
                  입장하기 <Icon.arrow width={16} height={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: C.bgEl,
              borderRadius: 8,
              border: `1px solid ${C.bdr}`,
            }}
          >
            <Icon.info
              width={13}
              height={13}
              stroke={C.txtMut}
              style={{ flexShrink: 0 }}
            />
            <p
              style={{
                fontSize: 11,
                color: C.txtMut,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              허가된 담당자만 이용할 수 있습니다. 코드가 없는 경우 관리자에게
              문의하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LoginPage };
