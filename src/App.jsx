import { useState, useRef, useCallback, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import { C, S } from "./styles/theme";
import { useHistory } from "./hooks/useHistory";
import { sev } from "./utils/severity";
import { MAX_FILE_MB, validateFile } from "./utils/file";
import { generateReport } from "./utils/report";

import { Icon } from "./components/common/Icons";
import { ErrorBanner } from "./components/common/ErrorBanner";
import { Stepper } from "./components/common/Stepper";
import { Logo } from "./components/common/Logo";

import { HistoryPanel } from "./components/layout/HistoryPanel";
import { ImageCompareSlider } from "./components/layout/ImageCompareSlider";
import { AnalyzingOverlay } from "./components/layout/AnalyzingOverlay";

import {
  MOCK_CLASS_STATS,
  MOCK_SUMMARY,
  DEMO_ORIGINAL,
  DEMO_SEGMENTED,
} from "./constants/mockData";

/* ─── Global CSS ─────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0A0E14 !important; color: #F0F6FC; font-family: 'Space Grotesk', sans-serif; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
::selection { background: rgba(34,211,238,0.2); color: #F0F6FC; }
@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
@keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
@keyframes glow    { 0%,100%{opacity:0.5} 50%{opacity:1} }
@keyframes slideR  { from{transform:translateX(100%)} to{transform:translateX(0)} }
@keyframes ping    { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2.2);opacity:0} }
.fade-up   { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
.fade-in   { animation: fadeIn 0.3s ease both; }
.slide-r   { animation: slideR 0.35s cubic-bezier(0.23,1,0.32,1) both; }
.skeleton  { background:linear-gradient(90deg,#111318 25%,#181C23 50%,#111318 75%); background-size:600px; animation:shimmer 1.6s infinite; border-radius:8px; }
.btn-h:hover { opacity: 0.82; transform: translateY(-1px); transition: all 0.15s; }
.card-h:hover { border-color: rgba(255,255,255,0.14) !important; }
input, textarea { color-scheme: dark; }
@media print { .no-print{display:none!important} body{background:white!important; color:black!important} }
`;

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

/* ─── Landing Page ───────────────────────────────────────────── */
function LandingPage({ onStart }) {
  const steps = [
    {
      Icon: Icon.upload,
      title: "도로 사진 업로드",
      desc: "JPG, PNG 형식의 도로 현장 사진을 드래그&드롭 또는 클릭으로 업로드합니다.",
      color: C.cyan,
    },
    {
      Icon: Icon.scan,
      title: "AI 자동 분석",
      desc: "LiteRaceSegNet 모델이 도로 손상 영역을 자동으로 탐지하고 세그멘테이션 결과를 생성합니다.",
      color: C.purple,
    },
    {
      Icon: Icon.chart,
      title: "손상 통계 확인",
      desc: "균열, 포트홀 등 손상 유형별 면적 비율과 심각도 점수를 직관적인 차트로 확인합니다.",
      color: C.amber,
    },
    {
      Icon: Icon.file,
      title: "AI 리포트 생성",
      desc: "분석 결과를 바탕으로 AI가 점검 리포트 초안을 자동 생성하여 보고서 작성을 보조합니다.",
      color: C.green,
    },
  ];
  const users = [
    {
      title: "지자체 도로 점검 담당자",
      desc: "현장 사진 → 분석 → 리포트 작성 보조",
      color: C.cyan,
    },
    {
      title: "도로 유지보수 업체",
      desc: "손상 영역 및 심각도 확인 → 보수 범위 판단",
      color: C.amber,
    },
    {
      title: "건설사 품질 관리 담당자",
      desc: "시공 후 표면 손상 여부 품질 점검",
      color: C.green,
    },
    {
      title: "AI/컴퓨터비전 팀",
      desc: "LiteRaceSegNet 모델 웹 서비스 시연",
      color: C.purple,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: C.bg,
          padding: "110px 32px 90px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(34,211,238,0.10) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}
          className="fade-up"
        >
          <div style={{ ...S.tag(), marginBottom: 28 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.cyan,
                animation: "glow 2s ease-in-out infinite",
              }}
            />
            LiteRaceSegNet 기반 AI 분석
          </div>
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.12,
              marginBottom: 22,
              letterSpacing: "-1.5px",
            }}
          >
            <span style={{ color: C.txtPri }}>도로 손상을</span>
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${C.cyan} 0%, #60A5FA 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI가 탐지합니다
            </span>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: C.txtSec,
              lineHeight: 1.8,
              maxWidth: 520,
              margin: "0 auto 40px",
              wordBreak: "keep-all",
            }}
          >
            현장 도로 사진을 업로드하면 LiteRaceSegNet 모델이 손상 영역을
            분석하고, 세그멘테이션 결과와 AI 점검 리포트를 자동으로 생성합니다.
          </p>
          <button
            onClick={onStart}
            style={{
              ...S.btn("primary"),
              padding: "15px 44px",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "-0.3px",
              boxShadow: `0 8px 32px ${C.cyanGlow}`,
            }}
            className="btn-h"
          >
            분석 시작하기 <Icon.arrow width={18} height={18} />
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 56,
              marginTop: 60,
              paddingTop: 40,
              borderTop: `1px solid ${C.bdr}`,
            }}
          >
            {[
              { val: "4가지", sub: "손상 클래스 탐지" },
              { val: "< 5초", sub: "평균 분석 시간" },
              { val: "AI", sub: "자동 리포트 생성" },
            ].map((s) => (
              <div key={s.sub} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: C.txtPri,
                    letterSpacing: "-0.5px",
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.txtMut,
                    marginTop: 5,
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Slider */}
      <section
        style={{
          padding: "72px 32px",
          background: C.bgCard,
          borderTop: `1px solid ${C.bdr}`,
          borderBottom: `1px solid ${C.bdr}`,
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ ...S.tag(), marginBottom: 14 }}>Preview</div>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: C.txtPri,
                letterSpacing: "-0.8px",
                marginBottom: 8,
              }}
            >
              원본과 분석 결과를 나란히 비교
            </h2>
            <p style={{ fontSize: 14, color: C.txtSec }}>
              슬라이더를 드래그해 세그멘테이션 결과를 확인해보세요
            </p>
          </div>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${C.cyanBdr}`,
              boxShadow: `0 0 48px rgba(34,211,238,0.07)`,
            }}
          >
            <ImageCompareSlider
              originalSrc={DEMO_ORIGINAL}
              resultSrc={DEMO_SEGMENTED}
            />
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section style={{ padding: "80px 32px", background: C.bg }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ ...S.tag(C.purple), marginBottom: 14 }}>Workflow</div>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: C.txtPri,
                letterSpacing: "-0.8px",
                marginBottom: 8,
              }}
            >
              4단계로 완성되는 도로 점검
            </h2>
            <p style={{ fontSize: 14, color: C.txtSec }}>
              사진 업로드부터 AI 리포트 생성까지, 하나의 플랫폼에서 처리됩니다.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {steps.map(({ Icon: Ic, title, desc, color }, i) => (
              <div
                key={i}
                className="card-h"
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 16,
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transition: "all 0.2s",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${color}15`,
                      border: `1px solid ${color}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ic width={19} height={19} stroke={color} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.txtMut,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.txtPri,
                      marginBottom: 7,
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: C.txtSec,
                      lineHeight: 1.7,
                      margin: 0,
                      wordBreak: "keep-all",
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Users */}
      <section
        style={{
          padding: "80px 32px",
          background: C.bgCard,
          borderTop: `1px solid ${C.bdr}`,
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ ...S.tag(C.green), marginBottom: 14 }}>Users</div>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: C.txtPri,
                letterSpacing: "-0.8px",
                marginBottom: 8,
              }}
            >
              누가 사용하나요?
            </h2>
            <p style={{ fontSize: 14, color: C.txtSec }}>
              다양한 현장 전문가를 위한 도로 점검 보조 서비스
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 14,
            }}
          >
            {users.map(({ title, desc, color }, i) => (
              <div
                key={i}
                className="card-h"
                style={{
                  background: C.bgEl,
                  border: `1px solid ${C.bdr}`,
                  borderRadius: 14,
                  padding: "20px 18px",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `${color}15`,
                      border: `1px solid ${color}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon.user width={15} height={15} stroke={color} />
                  </div>
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.txtPri,
                      lineHeight: 1.3,
                      margin: 0,
                      wordBreak: "keep-all",
                    }}
                  >
                    {title}
                  </h4>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: C.txtSec,
                    lineHeight: 1.7,
                    margin: 0,
                    wordBreak: "keep-all",
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 32px",
          background: C.bg,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(34,211,238,0.06) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.cyanBdr}`,
              borderRadius: 20,
              padding: "52px 40px",
              textAlign: "center",
              boxShadow: `0 0 60px rgba(34,211,238,0.06)`,
            }}
          >
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: C.txtPri,
                letterSpacing: "-0.6px",
                marginBottom: 10,
                wordBreak: "keep-all",
              }}
            >
              지금 바로 도로 사진을 분석해보세요
            </h2>
            <p
              style={{
                fontSize: 14,
                color: C.txtSec,
                lineHeight: 1.7,
                marginBottom: 32,
                wordBreak: "keep-all",
              }}
            >
              본 서비스는 점검 보조 도구로, 최종 판단은 담당자가 수행합니다.
            </p>
            <button
              onClick={onStart}
              style={{
                ...S.btn("primary"),
                padding: "13px 40px",
                fontSize: 15,
                fontWeight: 800,
                boxShadow: `0 6px 28px ${C.cyanGlow}`,
              }}
              className="btn-h"
            >
              분석 시작하기 <Icon.arrow width={17} height={17} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
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
            style={{ width: 22, height: 22, objectFit: "contain" }}
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
    </div>
  );
}

/* ─── Upload Page ────────────────────────────────────────────── */
function UploadPage({ onAnalyze }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [memo, setMemo] = useState("");
  const [drag, setDrag] = useState(false);
  const [progress, setProg] = useState(0);
  const [analyzing, setAn] = useState(false);
  const [error, setError] = useState(null);
  const [fileErr, setFErr] = useState(null);
  const inputRef = useRef();

  const applyFile = (f) => {
    const err = validateFile(f);
    if (err) {
      setFErr(err);
      return;
    }
    setFErr(null);
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    applyFile(e.dataTransfer.files[0]);
  }, []);

  const start = async () => {
    const err = validateFile(file);
    if (err) {
      setFErr(err);
      return;
    }
    try {
      setAn(true);
      setProg(0);
      const vals = [
        { d: 400, v: 18 },
        { d: 1300, v: 38 },
        { d: 2200, v: 57 },
        { d: 2800, v: 74 },
        { d: 3400, v: 90 },
        { d: 4000, v: 100 },
      ];
      await new Promise((resolve) => {
        vals.forEach(({ d, v }) =>
          setTimeout(() => {
            setProg(v);
            if (v === 100) setTimeout(resolve, 500);
          }, d),
        );
      });
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const fd = new FormData(); fd.append("image",file); fd.append("memo",memo);
      // const res = await fetch("/api/analyze",{method:"POST",body:fd});
      // if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
      // const data = await res.json();
      // ───────────────────────────────────────────────────────
      setAn(false);
      onAnalyze({
        original_image_url: preview ?? DEMO_ORIGINAL,
        result_image_url: DEMO_SEGMENTED,
        class_stats: MOCK_CLASS_STATS,
        summary: MOCK_SUMMARY,
        memo,
        file_name: file?.name ?? "demo_road.jpg",
        file_size: file?.size ?? 0,
        report_text: generateReport(MOCK_CLASS_STATS, MOCK_SUMMARY, memo),
        report_title: "도로 사진 분석 리포트",
      });
    } catch (e) {
      setAn(false);
      setError(e.message || "분석 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {analyzing && <AnalyzingOverlay progress={progress} />}
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "52px 20px" }}
        className="fade-up"
      >
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...S.tag(), marginBottom: 14 }}>Step 01</div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: C.txtPri,
              letterSpacing: "-0.6px",
              marginBottom: 8,
            }}
          >
            도로 사진 업로드
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.txtSec,
              lineHeight: 1.7,
              wordBreak: "keep-all",
            }}
          >
            점검할 도로 사진을 업로드하면 AI가 손상 영역을 분석합니다.
          </p>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        <div style={S.card}>
          {/* Drop zone */}
          <div
            onClick={() => !preview && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            style={{
              border: `1.5px dashed ${fileErr ? C.red : drag ? C.cyan : preview ? C.bdr : C.bdrMd}`,
              borderRadius: 12,
              background: drag ? C.cyanLt : preview ? "transparent" : C.bgEl,
              padding: preview ? 0 : "44px 24px",
              textAlign: "center",
              cursor: preview ? "default" : "pointer",
              transition: "all 0.15s",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: 260,
                    objectFit: "cover",
                    display: "block",
                    borderRadius: 10,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    right: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(10,14,20,0.82)",
                      borderRadius: 8,
                      padding: "5px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 180,
                      }}
                    >
                      {file?.name}
                    </span>
                    <span style={{ fontSize: 10, color: C.txtMut }}>
                      {file && `${(file.size / 1024).toFixed(0)}KB`}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setFErr(null);
                    }}
                    style={{
                      background: "rgba(10,14,20,0.82)",
                      border: "none",
                      borderRadius: 7,
                      padding: "5px 10px",
                      fontSize: 11,
                      cursor: "pointer",
                      color: C.txtSec,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Icon.x width={11} height={11} /> 제거
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: C.cyanLt,
                    border: `1px solid ${C.cyanBdr}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Icon.upload width={24} height={24} stroke={C.cyan} />
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.txtPri,
                    marginBottom: 6,
                  }}
                >
                  사진을 드래그하거나
                </div>
                <div
                  style={{ fontSize: 13, color: C.txtMut, marginBottom: 20 }}
                >
                  JPG, PNG 형식 · 최대 {MAX_FILE_MB}MB
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "9px 22px",
                    borderRadius: 9,
                    background: C.cyan,
                    color: "#080B10",
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: `0 4px 16px ${C.cyanGlow}`,
                  }}
                >
                  <Icon.upload width={14} height={14} /> 파일 선택
                </div>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: "none" }}
            onChange={(e) => applyFile(e.target.files[0])}
          />
          {fileErr && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
              }}
            >
              <Icon.info width={13} height={13} stroke={C.red} />
              <span style={{ fontSize: 12, color: C.red, fontWeight: 500 }}>
                {fileErr}
              </span>
            </div>
          )}

          {/* Demo hint */}
          {!file && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: C.bgEl,
                borderRadius: 9,
                border: `1px solid ${C.bdr}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon.info
                width={13}
                height={13}
                stroke={C.txtMut}
                style={{ flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: C.txtSec }}>
                사진이 없어도{" "}
                <button
                  onClick={() => {
                    setFile(
                      new File([], "demo_road.jpg", { type: "image/jpeg" }),
                    );
                    setPreview(DEMO_ORIGINAL);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: C.cyan,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  데모 이미지로 체험
                </button>
                해볼 수 있습니다.
              </span>
            </div>
          )}

          {/* Memo */}
          <div style={{ marginTop: 20 }}>
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
              현장 메모{" "}
              <span
                style={{
                  color: C.txtMut,
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: "normal",
                  fontSize: 11,
                }}
              >
                · 선택사항, 리포트에 반영됩니다
              </span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 우측 차선 주변 균열 확인, 민원 접수 건"
              maxLength={300}
              style={{
                width: "100%",
                minHeight: 80,
                border: `1px solid ${C.bdrMd}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 13,
                color: C.txtPri,
                background: C.bgEl,
                resize: "vertical",
                outline: "none",
                fontFamily: "'Space Grotesk',sans-serif",
                lineHeight: 1.7,
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 11,
                color: C.txtMut,
                marginTop: 4,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {memo.length}/300
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: C.bgEl,
              borderRadius: 9,
              border: `1px solid ${C.bdr}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
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
              본 서비스는 점검 보조 목적으로만 제공됩니다. 최종 판단은 담당자가
              직접 수행해 주세요.
            </p>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={start}
              disabled={!file || !!fileErr}
              style={{
                ...S.btn("primary", !file || !!fileErr),
                padding: "11px 28px",
              }}
              className="btn-h"
            >
              <Icon.search width={15} height={15} /> AI 분석 시작
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Result Page ────────────────────────────────────────────── */
function ResultPage({ result, onReport, onReset }) {
  const [tab, setTab] = useState("compare");
  const [mode, setMode] = useState("slider");
  const [filter, setFilter] = useState(null);
  const [repLoading, setRepL] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const { original_image_url, result_image_url, class_stats, summary, memo } =
    result;
  const damaged = class_stats.filter((c) => c.class_name !== "normal");
  const maxR = Math.max(...damaged.map((c) => c.area_ratio));

  const ChartTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div
        style={{
          background: C.bgCard,
          border: `1px solid ${C.bdrMd}`,
          borderRadius: 8,
          padding: "8px 12px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.txtPri,
            marginBottom: 2,
          }}
        >
          {d.label}
        </div>
        <div style={{ fontSize: 11, color: C.txtSec }}>{d.area_ratio}%</div>
      </div>
    );
  };

  const handleReport = async () => {
    try {
      setRepL(true);
      await new Promise((r) => setTimeout(r, 1200));
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const res = await fetch("/api/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({class_stats,summary,user_memo:memo})});
      // if (!res.ok) throw new Error(`리포트 생성 오류 (${res.status})`);
      // const data = await res.json(); onReport(data);
      // ───────────────────────────────────────────────────────
      onReport({
        report_title: "도로 사진 분석 리포트",
        report_text: result.report_text,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      setError(e.message || "리포트 생성 중 오류가 발생했습니다.");
    } finally {
      setRepL(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "48px 20px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s",
      }}
    >
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ ...S.tag(), marginBottom: 12 }}>Step 02</div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: C.txtPri,
              letterSpacing: "-0.5px",
              marginBottom: 6,
            }}
          >
            분석 결과
          </h1>
          <p style={{ fontSize: 14, color: C.txtSec }}>
            LiteRaceSegNet 세그멘테이션 분석이 완료되었습니다.
          </p>
        </div>
        <button
          onClick={onReset}
          style={{ ...S.btn("ghost"), fontSize: 13 }}
          className="btn-h no-print"
        >
          새 분석
        </button>
      </div>

      <ErrorBanner message={error} onClose={() => setError(null)} />

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "전체 손상 비율",
            value: `${summary.total_damage_ratio}%`,
            color: C.red,
          },
          {
            label: "추정 심각도",
            value: sev(summary.estimated_severity).label,
            color: sev(summary.estimated_severity).color,
          },
          {
            label: "주요 손상 유형",
            value: summary.main_damage_type,
            color: C.cyan,
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.bdr}`,
              borderRadius: 14,
              padding: "18px 20px",
              borderTop: `2px solid ${color}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                background: `radial-gradient(ellipse 80% 100% at 50% -20%, ${color}18 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.txtMut,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color,
                letterSpacing: "-0.5px",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 20,
          background: C.bgEl,
          borderRadius: 11,
          padding: 4,
          border: `1px solid ${C.bdr}`,
          width: "fit-content",
        }}
      >
        {[
          { k: "compare", l: "이미지 비교" },
          { k: "stats", l: "손상 통계" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              background: tab === t.k ? C.bgCard : "transparent",
              color: tab === t.k ? C.txtPri : C.txtMut,
              boxShadow: tab === t.k ? `0 1px 6px rgba(0,0,0,0.4)` : "",
            }}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Compare Tab */}
      {tab === "compare" && (
        <div className="fade-in">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
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
              비교 모드
            </span>
            <div
              style={{
                display: "flex",
                gap: 2,
                background: C.bgEl,
                borderRadius: 8,
                padding: 3,
                border: `1px solid ${C.bdr}`,
              }}
            >
              {[
                { k: "slider", l: "슬라이더" },
                { k: "side", l: "나란히" },
              ].map((m) => (
                <button
                  key={m.k}
                  onClick={() => setMode(m.k)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    background: mode === m.k ? C.bgCard : "transparent",
                    color: mode === m.k ? C.txtPri : C.txtMut,
                  }}
                >
                  {m.l}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              ...S.card,
              padding: 0,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            {mode === "slider" ? (
              <ImageCompareSlider
                originalSrc={original_image_url}
                resultSrc={result_image_url}
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {[
                  { label: "원본", src: original_image_url, c: C.txtSec },
                  { label: "AI 분석", src: result_image_url, c: C.cyan },
                ].map(({ label, src, c }) => (
                  <div key={label}>
                    <div
                      style={{
                        padding: "10px 16px",
                        background: C.bgEl,
                        borderBottom: `1px solid ${C.bdr}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: c,
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: c }}>
                        {label}
                      </span>
                    </div>
                    <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                      <img
                        src={src}
                        alt={label}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {tab === "stats" && (
        <div className="fade-in">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
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
              클래스 필터
            </span>
            <button
              onClick={() => setFilter(null)}
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                border: `1px solid ${!filter ? C.cyanBdr : C.bdr}`,
                background: !filter ? C.cyanLt : "transparent",
                color: !filter ? C.cyan : C.txtMut,
                cursor: "pointer",
              }}
            >
              전체
            </button>
            {damaged.map((cls) => (
              <button
                key={cls.class_name}
                onClick={() =>
                  setFilter(filter === cls.class_name ? null : cls.class_name)
                }
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  border: `1px solid ${filter === cls.class_name ? cls.color + "60" : C.bdr}`,
                  background:
                    filter === cls.class_name
                      ? cls.color + "18"
                      : "transparent",
                  color: filter === cls.class_name ? cls.color : C.txtMut,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    background: cls.color,
                  }}
                />
                {cls.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Donut */}
            <div style={S.card}>
              <div style={S.secLabel}>클래스별 면적 비율</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie
                        data={class_stats}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={70}
                        dataKey="area_ratio"
                        nameKey="label"
                        paddingAngle={2}
                      >
                        {class_stats.map((d, i) => (
                          <Cell
                            key={i}
                            fill={d.color}
                            opacity={
                              filter &&
                              d.class_name !== filter &&
                              d.class_name !== "normal"
                                ? 0.2
                                : 1
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: C.txtPri,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {summary.total_damage_ratio}%
                      </div>
                      <div style={{ fontSize: 10, color: C.txtMut }}>
                        총 손상
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {class_stats.map((cls) => (
                    <div
                      key={cls.class_name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                        opacity:
                          filter &&
                          cls.class_name !== filter &&
                          cls.class_name !== "normal"
                            ? 0.2
                            : 1,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: cls.color,
                          }}
                        />
                        <span style={{ fontSize: 12, color: C.txtSec }}>
                          {cls.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.txtPri,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {cls.area_ratio}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div style={S.card}>
              <div style={S.secLabel}>손상 유형별 면적</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={damaged} barSize={24}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: C.txtMut, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: C.txtMut, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="area_ratio" radius={[4, 4, 0, 0]}>
                    {damaged.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.color}
                        opacity={filter && d.class_name !== filter ? 0.2 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: `1px solid ${C.bdr}`,
                }}
              >
                {damaged.map((cls) => (
                  <div
                    key={cls.class_name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                      opacity: filter && cls.class_name !== filter ? 0.2 : 1,
                    }}
                  >
                    <span style={{ fontSize: 12, color: C.txtSec }}>
                      {cls.label}
                    </span>
                    <span style={{ ...S.badge(cls.severity) }}>
                      {sev(cls.severity).label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribution bar */}
          <div style={S.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={S.secLabel}>전체 손상 분포</div>
              <span
                style={{
                  fontSize: 11,
                  color: C.txtMut,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                총 손상 {summary.total_damage_ratio}%
              </span>
            </div>
            <div
              style={{
                display: "flex",
                height: 26,
                borderRadius: 6,
                overflow: "hidden",
                gap: 1.5,
              }}
            >
              {class_stats.map((cls) => (
                <div
                  key={cls.class_name}
                  title={`${cls.label}: ${cls.area_ratio}%`}
                  style={{
                    width: `${cls.area_ratio}%`,
                    background: cls.color,
                    transition: "all 0.5s",
                    opacity:
                      filter &&
                      cls.class_name !== filter &&
                      cls.class_name !== "normal"
                        ? 0.15
                        : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cls.area_ratio > 7 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color:
                          cls.class_name === "normal"
                            ? C.txtMut
                            : "rgba(0,0,0,0.7)",
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {cls.area_ratio}%
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 10,
              }}
            >
              {class_stats.map((cls) => (
                <div
                  key={cls.class_name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    opacity:
                      filter &&
                      cls.class_name !== filter &&
                      cls.class_name !== "normal"
                        ? 0.2
                        : 1,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: cls.color,
                    }}
                  />
                  <span style={{ fontSize: 11, color: C.txtMut }}>
                    {cls.label} {cls.area_ratio}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {memo && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: C.bgEl,
                borderRadius: 10,
                borderLeft: `2px solid ${C.cyan}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.txtMut,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                현장 메모
              </div>
              <div style={{ fontSize: 13, color: C.txtSec }}>{memo}</div>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 20,
        }}
        className="no-print"
      >
        <button onClick={onReset} style={S.btn("ghost")} className="btn-h">
          새 분석
        </button>
        <button
          onClick={handleReport}
          disabled={repLoading}
          style={S.btn("primary", repLoading)}
          className="btn-h"
        >
          {repLoading ? (
            <>
              <div
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  border: `2px solid rgba(8,11,16,0.3)`,
                  borderTop: `2px solid #080B10`,
                  animation: "spin 0.8s linear infinite",
                }}
              />{" "}
              생성 중...
            </>
          ) : (
            <>
              <Icon.file width={15} height={15} /> 리포트 생성
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Report Page ────────────────────────────────────────────── */
function ReportPage({ report, result, onReset }) {
  const [pdfL, setPdfL] = useState(false);
  const [editMode, setEdit] = useState(false);
  const [editText, setET] = useState(report.report_text);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const { report_title, created_at } = report;
  const dateStr = new Date(created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleTxt = () => {
    const blob = new Blob(
      [`${report_title}\n생성일시: ${dateStr}\n\n${editText}`],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `도로점검_리포트_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePdf = async () => {
    try {
      setPdfL(true);
      await new Promise((r) => setTimeout(r, 800));
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const res = await fetch("/api/report/pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...})});
      // ───────────────────────────────────────────────────────
      throw new Error("PDF 다운로드는 백엔드 API 연동 후 활성화됩니다.");
    } catch (e) {
      setError(e.message);
    } finally {
      setPdfL(false);
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(editText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const handleSave = () => {
    setSaved(true);
    setEdit(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }}
      className="fade-up"
    >
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
        className="no-print"
      >
        <div>
          <div style={{ ...S.tag(), marginBottom: 12 }}>Step 03</div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: C.txtPri,
              letterSpacing: "-0.5px",
              marginBottom: 6,
            }}
          >
            점검 리포트
          </h1>
          <p style={{ fontSize: 14, color: C.txtSec, wordBreak: "keep-all" }}>
            AI가 생성한 점검 리포트 초안입니다. 검토 후 활용하세요.
          </p>
        </div>
        <button
          onClick={onReset}
          style={{ ...S.btn("ghost"), fontSize: 13 }}
          className="btn-h"
        >
          처음으로
        </button>
      </div>

      <ErrorBanner message={error} onClose={() => setError(null)} />

      <div
        className="report-doc"
        style={{
          ...S.card,
          marginBottom: 20,
          borderTop: `2px solid ${C.cyan}`,
          boxShadow: `0 0 40px rgba(34,211,238,0.05)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: 20,
            marginBottom: 20,
            borderBottom: `1px solid ${C.bdr}`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: C.cyan,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Road Inspection Report
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: C.txtPri,
                letterSpacing: "-0.4px",
                marginBottom: 5,
              }}
            >
              {report_title}
            </h2>
            <div
              style={{
                fontSize: 11,
                color: C.txtMut,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              생성일시: {dateStr}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.txtMut, marginBottom: 5 }}>
              분석 엔진
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.txtSec,
                marginBottom: 8,
              }}
            >
              LiteRaceSegNet v11
            </div>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                background: C.cyanLt,
                color: C.cyan,
                border: `1px solid ${C.cyanBdr}`,
              }}
            >
              초안
            </span>
          </div>
        </div>

        {/* Stat pills */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "손상 비율",
              value: `${result.summary.total_damage_ratio}%`,
              color: C.red,
            },
            {
              label: "심각도 추정",
              value: sev(result.summary.estimated_severity).label,
              color: sev(result.summary.estimated_severity).color,
            },
            {
              label: "주요 유형",
              value: result.summary.main_damage_type,
              color: C.cyan,
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: C.bgEl,
                borderRadius: 10,
                padding: "12px 14px",
                borderLeft: `2px solid ${color}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: C.txtMut,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Report text */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={S.secLabel}>종합 소견</div>
            <div style={{ display: "flex", gap: 6 }} className="no-print">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEdit(false)}
                    style={{
                      ...S.btn("ghost"),
                      fontSize: 11,
                      padding: "5px 12px",
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      ...S.btn("primary"),
                      fontSize: 11,
                      padding: "5px 14px",
                    }}
                  >
                    <Icon.check width={12} height={12} />
                    {saved ? "저장됨" : "저장"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCopy}
                    style={{
                      ...S.btn("secondary"),
                      fontSize: 11,
                      padding: "5px 12px",
                      gap: 5,
                    }}
                  >
                    <Icon.copy width={12} height={12} />
                    {copied ? "복사됨" : "복사"}
                  </button>
                  <button
                    onClick={() => setEdit(true)}
                    style={{
                      ...S.btn("secondary"),
                      fontSize: 11,
                      padding: "5px 12px",
                      gap: 5,
                    }}
                  >
                    <Icon.edit width={12} height={12} />
                    편집
                  </button>
                </>
              )}
            </div>
          </div>
          {editMode ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setET(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 200,
                  border: `1px solid ${C.cyanBdr}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontSize: 13,
                  color: C.txtPri,
                  lineHeight: 1.85,
                  background: C.bgEl,
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "'Space Grotesk',sans-serif",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 5,
                }}
              >
                <span style={{ fontSize: 11, color: C.txtMut }}>
                  리포트 내용을 직접 수정할 수 있습니다.
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: C.txtMut,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {editText.length}자
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: C.txtSec,
                lineHeight: 1.9,
                whiteSpace: "pre-line",
                padding: "16px 18px",
                background: C.bgEl,
                borderRadius: 10,
                border: `1px solid ${C.bdr}`,
              }}
            >
              {editText}
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ marginBottom: 20 }}>
          <div style={S.secLabel}>손상 클래스별 상세</div>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: C.bgEl }}>
                {["손상 유형", "면적 비율", "심각도", "조치 권고"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      color: C.txtMut,
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${C.bdr}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.class_stats
                .filter((c) => c.class_name !== "normal")
                .map((cls, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.bdr}` }}>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontWeight: 600,
                        color: C.txtPri,
                      }}
                    >
                      {cls.label || cls.class_name}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: C.txtSec,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {cls.area_ratio}%
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={S.badge(cls.severity)}>
                        {sev(cls.severity).label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 12,
                        color: cls.severity === "high" ? C.red : C.txtMut,
                        fontWeight: cls.severity === "high" ? 600 : 400,
                      }}
                    >
                      {cls.severity === "high"
                        ? "우선 점검 필요"
                        : cls.severity === "medium"
                          ? "경과 관찰 권장"
                          : "정기 점검 유지"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "12px 16px",
            background: "rgba(251,191,36,0.07)",
            borderRadius: 10,
            borderLeft: `2px solid rgba(251,191,36,0.4)`,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "rgba(251,191,36,0.7)",
              lineHeight: 1.6,
              margin: 0,
              wordBreak: "keep-all",
            }}
          >
            본 리포트는 AI 점검 보조 도구가 생성한 초안입니다. 자율주행 차량
            제어, 실시간 도로 관제, 도로 안전 등급 자동 판정에 사용할 수 없으며,
            최종 판단은 담당자가 수행합니다.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="no-print"
      >
        <button
          onClick={onReset}
          style={{ ...S.btn("ghost"), fontSize: 13 }}
          className="btn-h"
        >
          처음으로
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.print()}
            style={{ ...S.btn("secondary"), fontSize: 13, gap: 6 }}
            className="btn-h"
          >
            <Icon.print width={14} height={14} />
            인쇄
          </button>
          <button
            onClick={handleTxt}
            style={{ ...S.btn("secondary"), fontSize: 13, gap: 6 }}
            className="btn-h"
          >
            <Icon.file width={14} height={14} />
            TXT 저장
          </button>
          <button
            onClick={handlePdf}
            disabled={pdfL}
            style={{ ...S.btn("primary", pdfL), gap: 6 }}
            className="btn-h"
          >
            {pdfL ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: `2px solid rgba(8,11,16,0.3)`,
                    borderTop: `2px solid #080B10`,
                    animation: "spin 0.8s linear infinite",
                  }}
                />{" "}
                생성 중...
              </>
            ) : (
              <>
                <Icon.dl width={15} height={15} />
                PDF 다운로드
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────────── */
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("landing");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [report, setReport] = useState(null);
  const [histOpen, setHist] = useState(false);
  const { records, saveRecord, removeRecord, clearAll } = useHistory();

  const handleAnalyze = (res) => {
    saveRecord({ ...res });
    setResult(res);
    setStep(1);
  };
  const handleReport = (rep) => {
    setReport(rep);
    setStep(2);
  };
  const handleReset = () => {
    setStep(0);
    setResult(null);
    setReport(null);
  };
  const handleLogout = () => {
    setAuthed(false);
    setPage("landing");
    setStep(0);
    setResult(null);
    setReport(null);
  };
  const handleLoadRec = (rec) => {
    setResult({ ...rec });
    setStep(1);
    setHist(false);
  };

  if (!authed)
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <LoginPage onLogin={() => setAuthed(true)} />
      </>
    );

  if (page === "landing")
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={S.page}>
          <div style={S.topbar} className="no-print">
            <button
              onClick={() => setPage("landing")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Logo />
            </button>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => setPage("main")}
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
              <button
                onClick={handleLogout}
                style={{ ...S.btn("ghost"), padding: "8px 14px", fontSize: 12 }}
                className="btn-h"
              >
                로그아웃
              </button>
            </div>
          </div>
          <LandingPage onStart={() => setPage("main")} />
        </div>
      </>
    );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={S.page}>
        <HistoryPanel
          open={histOpen}
          onClose={() => setHist(false)}
          records={records}
          onSelect={handleLoadRec}
          onDelete={removeRecord}
          onClear={clearAll}
        />
        <div style={S.topbar} className="no-print">
          <button
            onClick={() => setPage("landing")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Logo />
          </button>
          <Stepper current={step} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setHist(true)}
              style={{
                ...S.btn("secondary"),
                fontSize: 12,
                padding: "6px 14px",
                gap: 6,
              }}
              className="btn-h"
            >
              <Icon.clock width={13} height={13} />
              분석 이력
              {records.length > 0 && (
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 10,
                    background: C.cyanLt,
                    color: C.cyan,
                    fontSize: 10,
                    fontWeight: 800,
                    border: `1px solid ${C.cyanBdr}`,
                  }}
                >
                  {records.length}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              style={{ ...S.btn("ghost"), fontSize: 12, padding: "6px 14px" }}
              className="btn-h"
            >
              로그아웃
            </button>
          </div>
        </div>
        {step === 0 && <UploadPage onAnalyze={handleAnalyze} />}
        {step === 1 && result && (
          <ResultPage
            result={result}
            onReport={handleReport}
            onReset={handleReset}
          />
        )}
        {step === 2 && report && (
          <ReportPage report={report} result={result} onReset={handleReset} />
        )}
      </div>
    </>
  );
}
