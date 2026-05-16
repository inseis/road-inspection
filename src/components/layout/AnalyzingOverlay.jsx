import { C } from "../../styles/theme";
import { Icon } from "../common/Icons";

/* ─── Analyzing Overlay ──────────────────────────────────────── */
function AnalyzingOverlay({ progress }) {
  const steps = [
    { label: "이미지 전처리 및 리사이즈", t: 18 },
    { label: "LiteRaceSegNet 추론 실행", t: 57 },
    { label: "손상 클래스 통계 계산", t: 74 },
    { label: "세그멘테이션 결과 이미지 생성", t: 90 },
    { label: "AI 점검 리포트 초안 생성", t: 100 },
  ];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10,14,20,0.96)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(34,211,238,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            position: "relative",
            width: 72,
            height: 72,
            margin: "0 auto 20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.5px solid ${C.cyanBdr}`,
              animation: "ping 1.8s infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 6,
              borderRadius: "50%",
              border: `1.5px solid ${C.cyanBdr}`,
              animation: "ping 1.8s 0.5s infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${C.cyanBdr}`,
              borderTop: `2px solid ${C.cyan}`,
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon.scan width={24} height={24} stroke={C.cyan} />
          </div>
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: C.txtPri,
            marginBottom: 6,
            letterSpacing: "-0.5px",
          }}
        >
          AI 분석 중
        </div>
        <div style={{ fontSize: 13, color: C.txtSec }}>
          LiteRaceSegNet 모델이 손상 영역을 탐지하고 있습니다
        </div>
      </div>
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.bdrMd}`,
          borderRadius: 16,
          padding: "24px 28px",
          minWidth: 340,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: C.txtMut,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            진행률
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: C.cyan,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            {progress}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: C.bgEl,
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${C.cyan}, #60A5FA)`,
              borderRadius: 2,
              transition: "width 0.6s ease",
              boxShadow: `0 0 8px ${C.cyanGlow}`,
            }}
          />
        </div>
        {steps.map((s, i) => {
          const done = progress >= s.t;
          const running = !done && progress > (steps[i - 1]?.t ?? 0);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: i < steps.length - 1 ? 10 : 0,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.3s",
                  background: done ? C.greenLt : running ? C.cyanLt : C.bgEl,
                  border: `1px solid ${done ? "rgba(52,211,153,0.4)" : running ? C.cyanBdr : C.bdr}`,
                }}
              >
                {done ? (
                  <Icon.check width={10} height={10} stroke={C.green} />
                ) : running ? (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: C.cyan,
                      animation: "glow 1s infinite",
                    }}
                  />
                ) : null}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: done ? C.txtSec : running ? C.txtPri : C.txtMut,
                  fontWeight: running ? 600 : 400,
                  transition: "color 0.3s",
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { AnalyzingOverlay };
