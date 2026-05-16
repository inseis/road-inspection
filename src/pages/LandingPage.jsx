import { C, S } from "../styles/theme";
import { Icon } from "../components/common/Icons";
import { ImageCompareSlider } from "../components/layout/ImageCompareSlider";

import { DEMO_ORIGINAL, DEMO_SEGMENTED } from "../constants/mockData";

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

export { LandingPage };
