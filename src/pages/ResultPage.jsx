import { useEffect, useState } from "react";
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

import { C, S } from "../styles/theme";
import { sev } from "../utils/severity";

import { Icon } from "../components/common/Icons";
import { ErrorBanner } from "../components/common/ErrorBanner";
import { ImageCompareSlider } from "../components/layout/ImageCompareSlider";

/* ─── 퍼센트 포맷 헬퍼 ──────────────────────────────────────── */
const DAMAGE_LABEL_MAP = {
  "crack": "균열",
  "pothole": "포트홀",
  "pothole or road damage": "포트홀 및 도로 손상",
  "road damage": "도로 손상",
  "surface damage": "표면 손상",
  "normal": "정상",
};
const toKor = (v) => {
  if (!v) return v;
  return DAMAGE_LABEL_MAP[v.toLowerCase()] ?? v;
};

const fmt = (v) => {
  const pct = v <= 1 ? v * 100 : v;
  return pct.toFixed(1);
};

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

  const { original_image_url, result_image_url, result_images, class_stats, summary, memo, analysis_id, location } =
    result;

  // 백엔드가 /media 상대경로로 주는 이미지에 base URL을 붙여 절대경로로 변환
  const API_BASE = "http://localhost:8000";
  const toAbs = (u) => {
    if (!u) return u;
    if (u.startsWith("http")) return u;       // 이미 절대경로
    return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
  };
  const originalAbs = toAbs(original_image_url);
  const overlayAbs  = toAbs(result_images?.overlay ?? result_image_url);
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
        <div style={{ fontSize: 11, color: C.txtSec }}>{fmt(d.area_ratio)}%</div>
      </div>
    );
  };

  const handleReport = async () => {
    try {
      setRepL(true);
      await new Promise((r) => setTimeout(r, 1200));

        try {
          const createRes = await fetch("http://localhost:8000/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ analysis_id: result.analysis_id }),
          });
          if (!createRes.ok) throw new Error("EC2 리포트 생성 실패");
          const createData = await createRes.json();
          const { report_id } = createData;
          const getRes = await fetch(`http://localhost:8000/api/reports/${report_id}`);
          if (!getRes.ok) throw new Error("EC2 리포트 조회 실패");
          const reportData = await getRes.json();
          onReport({
            report_id: reportData.report_id,
            analysis_id: reportData.analysis_id,
            report_title: reportData.report_title,
            report_text: reportData.report_text,
            created_at: reportData.created_at,
          });
          return;
        } catch {
          // EC2 실패 시 Mock으로 대체
        }

        // Mock fallback
        onReport({
          report_id: "rep_mock",
          analysis_id: result.analysis_id,
          report_title: "도로 사진 분석 리포트",
          report_text: result.report_text ?? "분석 결과를 기반으로 생성된 리포트입니다.",
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
        <div style={{ textAlign: "left" }}>
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
            value: `${fmt(summary.total_damage_ratio)}%`,
            color: C.red,
          },
          {
            label: "추정 심각도",
            value: sev(summary.estimated_severity).label,
            color: sev(summary.estimated_severity).color,
          },
          {
            label: "주요 손상 유형",
            value: toKor(summary.main_damage_type),
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
                originalSrc={originalAbs}
                resultSrc={overlayAbs}
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {[
                  { label: "원본", src: originalAbs, c: C.txtSec },
                  { label: "AI 분석", src: overlayAbs, c: C.cyan },
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
                        {fmt(summary.total_damage_ratio)}%
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
                        {fmt(cls.area_ratio)}%
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
                총 손상 {fmt(summary.total_damage_ratio)}%
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
                  title={`${cls.label}: ${fmt(cls.area_ratio)}%`}
                  style={{
                    width: `${fmt(cls.area_ratio)}%`,
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
                      {fmt(cls.area_ratio)}%
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
                    {toKor(cls.label || cls.class_name)} {fmt(cls.area_ratio)}%
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

export { ResultPage };