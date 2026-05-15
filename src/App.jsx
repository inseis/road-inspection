import { useState, useRef, useCallback, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Design tokens (Dark Mode) ─────────────────────────────── */
const C = {
  // Accent
  cyan: "#22D3EE",
  cyanDk: "#0E7490",
  cyanLt: "rgba(34,211,238,0.12)",
  cyanBdr: "rgba(34,211,238,0.25)",
  blue: "#3B82F6",
  blueLt: "rgba(59,130,246,0.12)",
  // Semantic
  red: "#F87171",
  redLt: "rgba(248,113,113,0.12)",
  amber: "#FBBF24",
  amberLt: "rgba(251,191,36,0.12)",
  green: "#34D399",
  greenLt: "rgba(52,211,153,0.12)",
  // Backgrounds
  bg: "#0D1117",
  bgCard: "#161B22",
  bgEl: "#1C2128",
  bgHover: "#21262D",
  // Borders
  bdr: "rgba(255,255,255,0.08)",
  bdrMd: "rgba(255,255,255,0.14)",
  bdrHi: "rgba(255,255,255,0.22)",
  // Text
  txtPri: "#F0F6FC",
  txtSec: "#8B949E",
  txtMut: "#484F58",
  white: "#FFFFFF",
  // Legacy aliases for compat
  gray50: "#161B22",
  gray100: "#1C2128",
  gray200: "rgba(255,255,255,0.08)",
  gray300: "rgba(255,255,255,0.14)",
  gray400: "#8B949E",
  gray500: "#6E7681",
  gray700: "#C9D1D9",
  gray900: "#F0F6FC",
};

const DAMAGE_COLORS = {
  crack: "#F59E0B",
  pothole: "#EF4444",
  surface_damage: "#8B5CF6",
  normal: "#D1D5DB",
};

/* ─── Mock data ──────────────────────────────────────────────── */
const MOCK_CLASS_STATS = [
  { class_name: "crack", label: "균열", area_ratio: 12.4, severity: "medium", color: DAMAGE_COLORS.crack },
  { class_name: "pothole", label: "포트홀", area_ratio: 4.8, severity: "high", color: DAMAGE_COLORS.pothole },
  { class_name: "surface_damage", label: "표면 손상", area_ratio: 8.3, severity: "medium", color: DAMAGE_COLORS.surface_damage },
  { class_name: "normal", label: "정상", area_ratio: 74.5, severity: "low", color: DAMAGE_COLORS.normal },
];

const MOCK_SUMMARY = {
  main_damage_type: "균열",
  total_damage_ratio: 25.5,
  estimated_severity: "medium",
};

const DEMO_ORIGINAL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663607555234/cHkCeKBVdpB68fyrJM9SFf/road-damage-original-T6ndwJPVFUJX6FzULre6D5.webp";
const DEMO_SEGMENTED = "https://d2xsxph8kpxj0f.cloudfront.net/310519663607555234/cHkCeKBVdpB68fyrJM9SFf/road-damage-segmented-hcKfQ4YohySe7zerWmmoLa.webp";

/* ─── Helpers ────────────────────────────────────────────────── */
const SEV_MAP = {
  high: { label: "높음", bg: "rgba(248,113,113,0.15)", color: "#F87171" },
  medium: { label: "보통", bg: "rgba(251,191,36,0.15)", color: "#FBBF24" },
  low: { label: "낮음", bg: "rgba(52,211,153,0.15)", color: "#34D399" },
};
const sev = (k) => SEV_MAP[k] ?? SEV_MAP.low;

const MAX_FILE_MB = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const STORAGE_KEY = "roadscan_history";
const MAX_RECORDS = 20;

function validateFile(f) {
  if (!f) return "파일을 선택해주세요.";
  if (!ALLOWED_TYPES.includes(f.type)) return "JPG 또는 PNG 파일만 업로드 가능합니다.";
  if (f.size > MAX_FILE_MB * 1024 * 1024) return `파일 크기는 ${MAX_FILE_MB}MB 이하여야 합니다.`;
  return null;
}

function generateReport(stats, summary, memo) {
  const damaged = stats.filter(s => s.class_name !== "normal");
  const sevLabel = { low: "낮음", medium: "중간", high: "높음" };
  return [
    "[분석 개요]",
    `업로드된 도로 사진 분석 결과, 주요 손상 유형은 ${damaged[0]?.label ?? "균열"}으로 확인되었습니다. 전체 도로 면적 대비 총 손상 비율은 약 ${summary.total_damage_ratio}%로 추정되며, 전반적인 손상 심각도는 ${sevLabel[summary.estimated_severity]} 수준으로 평가됩니다.`,
    "",
    "[손상 유형별 분석]",
    ...damaged.map(c =>
      `• ${c.label}: 전체 면적의 ${c.area_ratio}% — 심각도 ${sevLabel[c.severity]}\n  ${c.class_name === "crack" ? "도로 표면에 다수의 선형 균열이 확인됩니다. 균열의 폭과 깊이에 따라 조기 보수가 필요할 수 있습니다." :
        c.class_name === "pothole" ? "복수의 포트홀이 탐지되었습니다. 차량 손상 및 교통 안전에 직접적인 영향을 미칠 수 있으므로 우선적인 보수 조치가 필요합니다." :
          "아스팔트 표면의 노화 및 박리 현상이 관찰됩니다. 방치 시 균열 및 포트홀로 진행될 수 있습니다."
      }`
    ),
    "",
    "[종합 의견]",
    `전체 손상 비율이 ${summary.total_damage_ratio}%로 ${summary.total_damage_ratio > 20 ? "상당한" : "일부"} 수준이며, 특히 ${damaged.find(d => d.severity === "high")?.label ?? damaged[0]?.label} 부분은 ${damaged.find(d => d.severity === "high") ? "즉각적인 보수가 권고됩니다" : "단기 내 보수 계획 수립을 검토하시기 바랍니다"}.`,
    memo ? `\n[현장 메모]\n${memo}` : "",
    "",
    "[주의 사항]",
    "본 분석 결과는 LiteRaceSegNet 모델 기반 점검 보조 자료이며, 최종 판단 및 보수 결정은 담당자가 현장 확인 후 수행하시기 바랍니다.",
  ].filter(Boolean).join("\n");
}

/* ─── localStorage history ───────────────────────────────────── */
function useHistory() {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) setRecords(JSON.parse(r)); } catch { }
  }, []);
  const saveRecord = useCallback((data) => {
    const rec = { ...data, id: `r_${Date.now()}`, created_at: new Date().toISOString() };
    setRecords(prev => {
      const next = [rec, ...prev].slice(0, MAX_RECORDS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { }
      return next;
    });
    return rec;
  }, []);
  const removeRecord = useCallback((id) => {
    setRecords(prev => { const next = prev.filter(r => r.id !== id); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { } return next; });
  }, []);
  const clearAll = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { } setRecords([]);
  }, []);
  return { records, saveRecord, removeRecord, clearAll };
}

/* ─── Global CSS ─────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
@keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes fadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
@keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
@keyframes ping    { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
@keyframes glow    { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
* { box-sizing:border-box; }
body { background:#0D1117 !important; color:#F0F6FC; }
.skeleton { background:linear-gradient(90deg,#1C2128 25%,#21262D 50%,#1C2128 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:6px; }
.fade-in  { animation:fadeIn 0.35s ease both; }
.slide-in { animation:slideIn 0.3s cubic-bezier(0.23,1,0.32,1) both; }
.btn-h:hover { opacity:0.85; }
.cyan-glow { box-shadow:0 0 0 1px rgba(34,211,238,0.25), 0 4px 24px rgba(34,211,238,0.08); }
.card-hover:hover { border-color:rgba(255,255,255,0.18) !important; background:#1a2030 !important; }
input, textarea, select { color-scheme: dark; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:3px; }
::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.2); }
::selection { background:rgba(34,211,238,0.25); color:#F0F6FC; }
@media print {
  .no-print { display:none !important; }
  body { background:white !important; color:black !important; }
  .report-doc { box-shadow:none !important; }
}
`;

/* ─── Shared styles ──────────────────────────────────────────── */
const S = {
  page: { minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif", color: C.txtPri },
  topbar: { position: "sticky", top: 0, zIndex: 50, background: "rgba(13,17,23,0.90)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid rgba(255,255,255,0.06)`, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" },
  card: { background: C.bgCard, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 14, padding: "24px 28px" },
  btn: (v = "primary", disabled = false) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 22px", borderRadius: 8,
    fontSize: 14, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none", outline: "none",
    transition: "all 0.15s",
    opacity: disabled ? 0.5 : 1,
    ...(v === "primary" ? { background: C.cyan, color: "#0D1117" } :
      v === "ghost" ? { background: "transparent", color: C.txtSec, border: `1px solid ${C.bdrMd}` } :
        v === "danger" ? { background: C.redLt, color: C.red } :
          { background: C.bgEl, color: C.txtSec, border: `1px solid ${C.bdr}` }),
  }),
  badge: (severity) => ({ display: "inline-block", padding: "3px 9px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: sev(severity).bg, color: sev(severity).color }),
  secTitle: { fontSize: 12, fontWeight: 700, color: C.txtMut, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 },
};

/* ─── Stepper ────────────────────────────────────────────────── */
const STEPS = ["사진 업로드", "분석 결과", "점검 리포트"];
function Stepper({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {STEPS.map((label, i) => {
        const done = i < current, active = i === current;
        const col = done ? "#34D399" : active ? C.cyan : "rgba(255,255,255,0.15)";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 4px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${col}`, background: done ? C.green : active ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: done || active ? C.white : C.gray400, flexShrink: 0, transition: "all 0.25s" }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: done ? "rgba(52,211,153,0.7)" : active ? C.cyan : C.txtMut }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 24, height: 1, background: i < current ? "rgba(52,211,153,0.5)" : C.bdr, margin: "0 4px", transition: "background 0.3s" }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Error Banner ───────────────────────────────────────────── */
function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", marginBottom: 16, background: C.redLt, border: `1px solid #FECACA`, borderRadius: 8, borderLeft: `4px solid ${C.red}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>⚠️</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{message}</span>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.red }}>✕</button>
    </div>
  );
}

/* ─── Image Compare Slider (from Manus) ─────────────────────── */
function ImageCompareSlider({ originalSrc, resultSrc }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef();

  const update = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 2), 98);
    setPos(pct);
  }, []);

  useEffect(() => {
    const onMove = (e) => { if (dragging) update(e.clientX); };
    const onTouch = (e) => { if (dragging) update(e.touches[0].clientX); };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, update]);

  return (
    <div
      ref={containerRef}
      onClick={(e) => update(e.clientX)}
      style={{ position: "relative", userSelect: "none", overflow: "hidden", borderRadius: 10, cursor: "col-resize", aspectRatio: "16/9" }}
    >
      <img src={resultSrc} alt="분석 결과" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} draggable={false} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: `${pos}%` }}>
        <img src={originalSrc} alt="원본" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", minWidth: `${(100 / pos) * 100}%`, maxWidth: "none" }} draggable={false} />
      </div>
      {/* Divider */}
      <div style={{ position: "absolute", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.85)", left: `${pos}%`, transform: "translateX(-50%)", boxShadow: "0 0 8px rgba(255,255,255,0.5)" }}>
        <div
          onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
          onTouchStart={(e) => { setDragging(true); update(e.touches[0].clientX); }}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 36, height: 36, borderRadius: "50%", background: C.white, boxShadow: "0 2px 12px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "col-resize", border: `2px solid rgba(255,255,255,0.9)`, transition: "transform 0.1s", ...(dragging ? { transform: "translate(-50%,-50%) scale(1.1)" } : {}) }}>
          <span style={{ fontSize: 14, color: C.gray500, lineHeight: 1 }}>⇔</span>
        </div>
      </div>
      {/* Labels */}
      <div style={{ position: "absolute", top: 10, left: 10, padding: "3px 10px", borderRadius: 6, background: "rgba(0,0,0,0.6)", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>원본</div>
      <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 10px", borderRadius: 6, background: "rgba(26,86,219,0.7)", fontSize: 11, fontWeight: 600, color: C.white, border: `1px solid rgba(96,165,250,0.5)` }}>AI 분석</div>
      {!dragging && (
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", padding: "4px 14px", borderRadius: 20, background: "rgba(0,0,0,0.5)", fontSize: 11, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>← 드래그하여 비교 →</div>
      )}
    </div>
  );
}

/* ─── History Panel (from Manus) ────────────────────────────── */
function HistoryPanel({ open, onClose, records, onSelect, onDelete, onClear, activeId }) {
  return (
    <>
      {open && <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }} />}
      <div className={open ? "slide-in" : ""} style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50, width: 320, background: C.bgCard, borderLeft: `1px solid ${C.bdrMd}`, display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.bdr}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15 }}>🕐</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.gray900 }}>분석 이력</span>
            <span style={{ padding: "2px 7px", borderRadius: 20, background: C.blueLt, color: C.blue, fontSize: 11, fontWeight: 700 }}>{records.length}</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {records.length > 0 && (
              <button onClick={onClear} style={{ padding: "4px 8px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.gray400 }} title="전체 삭제">🗑 전체삭제</button>
            )}
            <button onClick={onClose} style={{ padding: "4px 8px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.gray400 }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {records.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>🕐</div>
              <p style={{ fontSize: 13, color: C.gray400 }}>분석 이력이 없습니다</p>
              <p style={{ fontSize: 11, color: C.gray300, marginTop: 4 }}>분석을 완료하면 여기에 저장됩니다</p>
            </div>
          ) : records.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelect(rec)}
              style={{ borderRadius: 10, border: `1px solid ${activeId === rec.id ? C.blue : C.gray200}`, background: activeId === rec.id ? C.blueLt : C.white, padding: 12, marginBottom: 8, cursor: "pointer", transition: "all 0.15s", position: "relative" }}
            >
              <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: 7, overflow: "hidden", marginBottom: 8, background: C.gray100 }}>
                <img src={rec.result_image_url} alt="결과" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.5),transparent)" }} />
                <span style={{ position: "absolute", bottom: 6, left: 6, ...S.badge(rec.summary.estimated_severity), fontSize: 10 }}>{sev(rec.summary.estimated_severity).label}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(rec.id); }}
                  style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.white }}
                >✕</button>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.gray900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{rec.file_name}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: C.gray400 }}>{new Date(rec.created_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.blue }}>손상 {rec.summary.total_damage_ratio}%</span>
              </div>
              {rec.memo && <p style={{ fontSize: 10, color: C.gray400, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📝 {rec.memo}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Analyzing Overlay ──────────────────────────────────────── */
function AnalyzingOverlay({ progress }) {
  const steps = [
    { label: "이미지 전처리 및 리사이즈", threshold: 18 },
    { label: "LiteRaceSegNet 추론 실행", threshold: 57 },
    { label: "손상 클래스 통계 계산", threshold: 74 },
    { label: "세그멘테이션 결과 이미지 생성", threshold: 90 },
    { label: "AI 리포트 초안 생성", threshold: 100 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(13,17,23,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 20px" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.blue}`, opacity: 0.2, animation: "ping 1.5s infinite" }} />
          <div style={{ position: "absolute", inset: 4, borderRadius: "50%", border: `2px solid ${C.blue}`, opacity: 0.3, animation: "ping 1.5s 0.4s infinite" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.blueLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>🔍</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.gray900, marginBottom: 4 }}>AI 분석 중...</div>
        <div style={{ fontSize: 13, color: C.gray400 }}>LiteRaceSegNet 모델이 도로 손상 영역을 탐지하고 있습니다.</div>
      </div>
      <div style={{ background: C.bgCard, borderRadius: 12, border: `1px solid ${C.bdrMd}`, padding: 24, minWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.gray400 }}>분석 진행률</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{progress}%</span>
        </div>
        <div style={{ height: 6, background: C.gray100, borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(to right,${C.blue},#60A5FA)`, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>
        {steps.map((step) => {
          const done = progress >= step.threshold;
          const running = progress > 0 && progress < step.threshold && progress >= step.threshold - 30;
          return (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? C.green : C.gray100, border: `1px solid ${done ? C.green : C.gray200}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, transition: "all 0.3s" }}>
                {done ? <span style={{ color: C.white }}>✓</span> : running ? <span style={{ animation: "spin 0.9s linear infinite", display: "inline-block", color: C.blue }}>⟳</span> : null}
              </div>
              <span style={{ fontSize: 12, color: done ? C.gray700 : running ? C.blue : C.gray300, transition: "color 0.3s" }}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Login Page ─────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const inputRef = useRef();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError("초대 코드를 입력해주세요."); return; }
    setLoading(true); setError(null);
    try {
      await new Promise(r => setTimeout(r, 800));
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const res = await fetch("/api/auth/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({invite_code:code.trim()}) });
      // if (!res.ok) throw new Error("유효하지 않은 초대 코드입니다.");
      // ───────────────────────────────────────────────────────
      if (code.trim().toUpperCase() === "ROAD2026") { onLogin(); }
      else throw new Error("유효하지 않은 초대 코드입니다.");
    } catch (e) { setError(e.message); setCode(""); inputRef.current?.focus(); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Inter','Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(34,211,238,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", marginBottom: 32, position: "relative" }}>
        <img src="/logo.png" alt="logo" style={{ width: 72, height: 72, objectFit: "contain", margin: "0 auto 14px", display: "block" }} />
        <div style={{ fontSize: 20, fontWeight: 700, color: C.txtPri }}>도로 점검 플랫폼</div>
        <div style={{ fontSize: 13, color: C.txtSec, marginTop: 4 }}>Road Inspection Assistant</div>
      </div>
      <div style={{ ...S.card, width: "100%", maxWidth: 400, borderTop: `2px solid ${C.cyan}` }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.gray900, marginBottom: 6 }}>초대 코드 입력</h2>
        <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.6, marginBottom: 20 }}>담당자로부터 발급받은 초대 코드를 입력하세요.</p>
        <ErrorBanner message={error} onClose={() => setError(null)} />
        <form onSubmit={handleLogin}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.txtSec, marginBottom: 8 }}>초대 코드</label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input
              ref={inputRef}
              type={showCode ? "text" : "password"}
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }}
              placeholder="초대 코드를 입력하세요"
              autoComplete="off"
              style={{ width: "100%", padding: "11px 44px 11px 14px", border: `1px solid ${error ? C.red : C.bdrMd}`, borderRadius: 8, fontSize: 15, color: C.txtPri, background: C.bgEl, outline: "none", boxSizing: "border-box", letterSpacing: showCode ? "normal" : "0.15em", fontFamily: "inherit" }}
            />
            <button type="button" onClick={() => setShowCode(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.gray400, padding: 0 }} tabIndex={-1}>
              {showCode ? "🙈" : "👁"}
            </button>
          </div>
          <button type="submit" disabled={loading || !code.trim()} style={{ ...S.btn("primary", loading || !code.trim()), width: "100%", justifyContent: "center", padding: "12px", fontSize: 15 }} className="btn-h">
            {loading ? <><span style={{ animation: "spin 0.9s linear infinite", display: "inline-block" }}>⟳</span> 확인 중...</> : "입장하기 →"}
          </button>
        </form>
        <div style={{ marginTop: 16, padding: "10px 14px", background: C.bgEl, borderRadius: 8, borderLeft: `2px solid ${C.bdrMd}` }}>
          <p style={{ fontSize: 11, color: C.txtSec, lineHeight: 1.6, margin: 0 }}>🔒 본 서비스는 허가된 담당자만 이용할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Landing Page ───────────────────────────────────────────── */
function LandingPage({ onStart }) {
  const UploadIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
  const ScanIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
  const ChartIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
  const FileIcon = ({ color, size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
  const steps = [
    { SvgIcon: UploadIcon, title: "도로 사진 업로드", desc: "JPG, PNG 형식의 도로 현장 사진을 드래그&드롭 또는 클릭으로 업로드합니다.", color: "#1A56DB" },
    { SvgIcon: ScanIcon, title: "AI 자동 분석", desc: "LiteRaceSegNet 모델이 도로 손상 영역을 자동으로 탐지하고 세그멘테이션 결과를 생성합니다.", color: "#7C3AED" },
    { SvgIcon: ChartIcon, title: "손상 통계 확인", desc: "균열, 포트홀 등 손상 유형별 면적 비율과 심각도 점수를 직관적인 차트로 확인합니다.", color: "#D97706" },
    { SvgIcon: FileIcon, title: "AI 리포트 생성", desc: "분석 결과를 바탕으로 AI가 점검 리포트 초안을 자동 생성하여 보고서 작성을 보조합니다.", color: "#15803D" },
  ];
  const users = [
    { label: "지자체 도로 점검 담당자", desc: "현장 사진 → 분석 → 리포트 작성 보조" },
    { label: "도로 유지보수 업체", desc: "손상 영역 및 심각도 확인 → 보수 범위 판단" },
    { label: "건설사 품질 관리 담당자", desc: "시공 후 표면 손상 여부 품질 점검" },
    { label: "AI/컴퓨터비전 팀", desc: "LiteRaceSegNet 모델 웹 서비스 시연" },
  ];
  return (
    <div style={{ fontFamily: "'Pretendard','Apple SD Gothic Neo','Noto Sans KR',sans-serif" }}>
      {/* Hero */}
      <section style={{ background: C.bg, padding: "100px 32px 80px", textAlign: "center", color: C.txtPri, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,211,238,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: C.cyanLt, border: `1px solid ${C.cyanBdr}`, borderRadius: 20, marginBottom: 28, fontSize: 11, fontWeight: 700, color: C.cyan, letterSpacing: "0.08em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.cyan, display: "inline-block", animation: "glow 2s ease-in-out infinite" }} />
            LiteRaceSegNet 기반 AI 분석
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: "-1px" }}>
            <span style={{ color: "#F0F6FC" }}>도로 손상을</span><br />
            <span style={{ background: "linear-gradient(135deg,#22D3EE,#3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI가 탐지합니다</span>
          </h1>
          <p style={{ fontSize: 16, color: C.txtSec, lineHeight: 1.9, maxWidth: 560, margin: "0 auto 40px", wordBreak: "keep-all" }}>
            현장 도로 사진을 업로드하면 LiteRaceSegNet 모델이 손상 영역을 분석하고, 세그멘테이션 결과와 AI 점검 리포트를 자동으로 생성합니다.
          </p>
          <button onClick={onStart} style={{ padding: "14px 36px", background: C.cyan, color: "#0D1117", borderRadius: 10, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 4px 24px rgba(34,211,238,0.3)` }} className="btn-h">
            분석 시작하기 →
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 56, marginTop: 56, paddingTop: 40, borderTop: `1px solid ${C.bdr}` }}>
            {[{ val: "4가지", label: "손상 클래스 탐지" }, { val: "< 5초", label: "평균 분석 시간" }, { val: "AI", label: "자동 리포트 생성" }].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.txtPri }}>{s.val}</div>
                <div style={{ fontSize: 12, color: C.txtMut, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo image comparison */}
      <section style={{ padding: "72px 32px", background: C.bgCard, borderTop: `1px solid ${C.bdr}`, borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: C.cyanLt, border: `1px solid ${C.cyanBdr}`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.cyan, letterSpacing: "0.06em", marginBottom: 14 }}>PREVIEW</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: C.txtPri, marginBottom: 8, letterSpacing: "-0.5px" }}>원본과 분석 결과를 나란히 비교</h2>
            <p style={{ fontSize: 14, color: C.txtSec }}>슬라이더를 드래그해 세그멘테이션 결과를 확인해보세요</p>
          </div>
          <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${C.cyanBdr}`, boxShadow: `0 0 40px rgba(34,211,238,0.08)` }}>
            <ImageCompareSlider originalSrc={DEMO_ORIGINAL} resultSrc={DEMO_SEGMENTED} />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: "72px 32px", background: C.bg }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: C.blueLt, border: `1px solid rgba(59,130,246,0.25)`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: "0.06em", marginBottom: 14 }}>WORKFLOW</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: C.txtPri, marginBottom: 8, letterSpacing: "-0.5px" }}>4단계로 완성되는 도로 점검</h2>
            <p style={{ fontSize: 14, color: C.txtSec }}>사진 업로드부터 AI 리포트 생성까지, 하나의 플랫폼에서 처리됩니다.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {steps.map((step, i) => (
              <div key={i} className="card-hover" style={{ background: C.bgCard, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "22px 20px 20px", position: "relative", display: "flex", flexDirection: "column", gap: 10, transition: "border-color 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: step.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <step.SvgIcon color="white" size={18} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.txtMut, letterSpacing: "0.08em" }}>0{i + 1}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.txtPri, marginBottom: 5, lineHeight: 1.3 }}>{step.title}</h3>
                  <p style={{ fontSize: 12, color: C.txtSec, lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Users */}
      <section style={{ padding: "72px 32px", background: C.bgCard, borderTop: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: C.greenLt, border: `1px solid rgba(52,211,153,0.25)`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: "0.06em", marginBottom: 14 }}>USERS</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: C.txtPri, marginBottom: 8, letterSpacing: "-0.5px" }}>누가 사용하나요?</h2>
            <p style={{ fontSize: 14, color: C.txtSec }}>다양한 현장 전문가를 위한 도로 점검 보조 서비스</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {users.map((u, i) => (
              <div key={i} className="card-hover" style={{ padding: "18px 16px", borderRadius: 12, background: C.bgEl, border: `1px solid ${C.bdr}`, transition: "border-color 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.cyanLt, border: `1px solid ${C.cyanBdr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: C.txtPri, lineHeight: 1.3, margin: 0 }}>{u.label}</h4>
                </div>
                <p style={{ fontSize: 11, color: C.txtSec, lineHeight: 1.65, margin: 0 }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 32px", background: C.bg, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(34,211,238,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ border: `1px solid ${C.cyanBdr}`, borderRadius: 20, padding: "52px 40px", background: C.bgCard }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: C.txtPri, marginBottom: 10, letterSpacing: "-0.5px" }}>지금 바로 도로 사진을 분석해보세요</h2>
            <p style={{ fontSize: 14, color: C.txtSec, marginBottom: 32, lineHeight: 1.7 }}>본 서비스는 점검 보조 도구로, 최종 판단은 담당자가 수행합니다.</p>
            <button onClick={onStart} style={{ padding: "13px 36px", background: C.cyan, color: "#0D1117", borderRadius: 10, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 4px 20px rgba(34,211,238,0.25)` }} className="btn-h">
              분석 시작하기 →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "22px 32px", borderTop: `1px solid ${C.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="logo" style={{ width: 24, height: 24, objectFit: "contain" }} />
          <span style={{ fontSize: 12, color: C.txtSec, fontWeight: 500 }}>도로 손상 탐지 및 분석 플랫폼</span>
        </div>
        <span style={{ fontSize: 11, color: C.txtMut, maxWidth: 480, textAlign: "right", wordBreak: "keep-all", lineHeight: 1.5 }}>본 서비스는 자율주행 차량 제어, 실시간 도로 관제, 도로 안전 등급 자동 판정을 목적으로 하지 않습니다.</span>
      </footer>
    </div>
  );
}

/* ─── Upload Page ────────────────────────────────────────────── */
function UploadPage({ onAnalyze }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [memo, setMemo] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [fileErr, setFileErr] = useState(null);
  const inputRef = useRef();

  const applyFile = (f) => {
    const err = validateFile(f);
    if (err) { setFileErr(err); return; }
    setFileErr(null); setError(null);
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); applyFile(e.dataTransfer.files[0]); }, []);

  const startAnalysis = async () => {
    const err = validateFile(file);
    if (err) { setFileErr(err); return; }
    try {
      setAnalyzing(true); setProgress(0);
      const vals = [{ d: 400, v: 18 }, { d: 900, v: 38 }, { d: 1500, v: 57 }, { d: 2100, v: 74 }, { d: 2700, v: 90 }, { d: 3300, v: 100 }];
      await new Promise((resolve) => {
        vals.forEach(({ d, v }) => setTimeout(() => { setProgress(v); if (v === 100) setTimeout(resolve, 500); }, d));
      });
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const fd = new FormData(); fd.append("image",file); fd.append("memo",memo);
      // const res = await fetch("/api/analyze",{method:"POST",body:fd});
      // if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
      // const data = await res.json();
      // ───────────────────────────────────────────────────────
      const reportText = generateReport(MOCK_CLASS_STATS, MOCK_SUMMARY, memo);
      setAnalyzing(false);
      onAnalyze({ original_image_url: preview ?? DEMO_ORIGINAL, result_image_url: DEMO_SEGMENTED, class_stats: MOCK_CLASS_STATS, summary: MOCK_SUMMARY, memo, file_name: file?.name ?? "demo_road.jpg", file_size: file?.size ?? 0, report_text: reportText, report_title: "도로 사진 분석 리포트" });
    } catch (e) { setAnalyzing(false); setError(e.message || "분석 중 오류가 발생했습니다."); }
  };

  return (
    <>
      {analyzing && <AnalyzingOverlay progress={progress} />}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px" }} className="fade-in">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.txtPri, marginBottom: 6 }}>도로 사진 업로드</h1>
          <p style={{ fontSize: 14, color: C.txtSec, lineHeight: 1.6 }}>점검할 도로 사진을 업로드하면 AI가 손상 영역을 분석합니다.</p>
        </div>
        <ErrorBanner message={error} onClose={() => setError(null)} />
        <div style={S.card}>
          {/* Drop zone */}
          <div
            onClick={() => !preview && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{ border: `1.5px dashed ${fileErr ? "#F87171" : dragging ? C.cyan : preview ? C.bdr : C.bdrMd}`, borderRadius: 12, background: dragging ? C.cyanLt : C.bgEl, padding: preview ? 0 : "48px 24px", textAlign: "center", cursor: preview ? "default" : "pointer", transition: "all 0.15s", overflow: "hidden", position: "relative" }}
          >
            {preview ? (
              <>
                <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block", borderRadius: 8 }} />
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{file?.name}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{file && `${(file.size / 1024).toFixed(0)} KB`}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setFileErr(null); }} style={{ background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: C.white }}>✕ 제거</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.txtSec, marginBottom: 6 }}>사진을 여기에 드래그하거나</div>
                <div style={{ fontSize: 13, color: C.txtMut, marginBottom: 16 }}>JPG, PNG 형식 지원 · 최대 {MAX_FILE_MB}MB</div>
                <div style={{ ...S.btn("primary"), margin: "0 auto" }}>📁 파일 선택</div>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={(e) => applyFile(e.target.files[0])} />
          {fileErr && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}><span style={{ fontSize: 13, color: C.red }}>⚠</span><span style={{ fontSize: 12, color: C.red, fontWeight: 500 }}>{fileErr}</span></div>}

          {/* Demo hint */}
          {!file && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: C.bgEl, borderRadius: 8, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: C.txtSec }}>ℹ️</span>
              <span style={{ fontSize: 12, color: C.txtSec }}>
                사진이 없어도{" "}
                <button onClick={() => { setFile(new File([], "demo_road.jpg", { type: "image/jpeg" })); setPreview(DEMO_ORIGINAL); }} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                  데모 이미지로 체험
                </button>
                해볼 수 있습니다.
              </span>
            </div>
          )}

          {/* Memo */}
          <div style={{ marginTop: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.gray700, marginBottom: 8 }}>
              현장 메모 <span style={{ fontSize: 12, fontWeight: 400, color: C.gray400 }}>(선택사항 · 리포트에 반영됩니다)</span>
            </label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 우측 차선 주변 균열 확인, 민원 접수 건" maxLength={300} style={{ width: "100%", minHeight: 72, border: `1px solid ${C.gray200}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.gray700, background: C.white, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6 }} />
            <div style={{ textAlign: "right", fontSize: 11, color: C.txtMut, marginTop: 3 }}>{memo.length}/300</div>
          </div>

          <div style={{ marginTop: 12, padding: "10px 14px", background: C.bgEl, borderRadius: 8, borderLeft: `2px solid ${C.bdrMd}` }}>
            <p style={{ fontSize: 11, color: C.txtSec, lineHeight: 1.6, margin: 0 }}>⚠️ 본 서비스는 점검 보조 목적으로만 제공됩니다. 최종 판단은 담당자가 직접 수행해 주세요.</p>
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={startAnalysis} disabled={!file || !!fileErr} style={{ ...S.btn("primary", !file || !!fileErr), minWidth: 140, justifyContent: "center" }} className="btn-h">
              🔍 AI 분석 시작
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Result Page ────────────────────────────────────────────── */
function ResultPage({ result, onReport, onReset, onSaveHistory }) {
  const [activeTab, setActiveTab] = useState("compare");
  const [compareMode, setCompareMode] = useState("slider");
  const [filteredCls, setFilteredCls] = useState(null);
  const [error, setError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  const { original_image_url, result_image_url, class_stats, summary, memo } = result;
  const displayed = filteredCls ? class_stats.filter(c => c.class_name === filteredCls || c.class_name === "normal") : class_stats;

  const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 8, padding: "7px 12px", fontSize: 12 }}><div style={{ fontWeight: 700, color: C.gray900 }}>{payload[0].payload.label}</div><div style={{ color: C.gray500 }}>{payload[0].value}%</div></div>;
  };

  const handleReport = async () => {
    try {
      setReportLoading(true);
      await new Promise(r => setTimeout(r, 1200));
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const res = await fetch("/api/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({class_stats,summary,user_memo:memo})});
      // if (!res.ok) throw new Error(`리포트 생성 오류 (${res.status})`);
      // const data = await res.json(); onReport(data);
      // ───────────────────────────────────────────────────────
      onReport({ report_title: "도로 사진 분석 리포트", report_text: result.report_text, created_at: new Date().toISOString() });
    } catch (e) { setError(e.message || "리포트 생성 중 오류가 발생했습니다."); }
    finally { setReportLoading(false); }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 16px", opacity: visible ? 1 : 0, transition: "opacity 0.35s" }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.txtPri, marginBottom: 6 }}>분석 결과</h1>
          <p style={{ fontSize: 14, color: C.txtSec }}>LiteRaceSegNet 세그멘테이션 분석이 완료되었습니다.</p>
        </div>
        <button onClick={onReset} style={{ ...S.btn("ghost"), fontSize: 13 }} className="btn-h no-print">← 새 분석</button>
      </div>

      <ErrorBanner message={error} onClose={() => setError(null)} />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "전체 손상 비율", value: `${summary.total_damage_ratio}%`, color: C.red },
          { label: "추정 심각도", value: sev(summary.estimated_severity).label, color: sev(summary.estimated_severity).color },
          { label: "주요 손상 유형", value: summary.main_damage_type, color: C.blue },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: C.bgCard, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 12, padding: "16px 20px", borderTop: `2px solid ${color}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: `radial-gradient(ellipse 80% 100% at 50% -20%, ${color}18 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 11, color: C.txtMut, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: C.bgEl, borderRadius: 10, padding: 4, border: `1px solid ${C.bdr}`, width: "fit-content" }}>
        {[{ key: "compare", label: "이미지 비교" }, { key: "stats", label: "손상 통계" }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "8px 20px", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.15s", background: activeTab === tab.key ? C.bgCard : "transparent", color: activeTab === tab.key ? C.txtPri : C.txtMut, boxShadow: activeTab === tab.key ? `0 1px 4px rgba(0,0,0,0.3)` : "" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Image Compare Tab */}
      {activeTab === "compare" && (
        <div className="fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: C.gray400 }}>비교 모드:</span>
            <div style={{ display: "flex", gap: 2, background: C.bgEl, borderRadius: 8, padding: 3, border: `1px solid ${C.bdr}` }}>
              {[{ key: "slider", label: "슬라이더" }, { key: "side", label: "나란히 보기" }].map(m => (
                <button key={m.key} onClick={() => setCompareMode(m.key)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: compareMode === m.key ? C.bgCard : "transparent", color: compareMode === m.key ? C.txtPri : C.txtMut }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...S.card, padding: 0, overflow: "hidden", marginBottom: 20 }}>
            {compareMode === "slider" ? (
              <ImageCompareSlider originalSrc={original_image_url} resultSrc={result_image_url} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                {[
                  { label: "원본", src: original_image_url, badge: { bg: C.gray100, color: C.gray700 } },
                  { label: "AI 분석", src: result_image_url, badge: { bg: C.blueLt, color: C.blue } },
                ].map(({ label, src, badge }) => (
                  <div key={label}>
                    <div style={{ padding: "10px 16px", background: badge.bg, borderBottom: `1px solid ${C.gray200}`, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: badge.color }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: badge.color }}>{label}</span>
                    </div>
                    <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                      <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="fade-in">
          {/* Class filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.gray400 }}>클래스 필터:</span>
            <button onClick={() => setFilteredCls(null)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${!filteredCls ? C.cyanBdr : C.bdr}`, background: !filteredCls ? C.cyanLt : "transparent", color: !filteredCls ? C.cyan : C.txtMut, cursor: "pointer" }}>전체</button>
            {class_stats.filter(c => c.class_name !== "normal").map(cls => (
              <button key={cls.class_name} onClick={() => setFilteredCls(filteredCls === cls.class_name ? null : cls.class_name)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${filteredCls === cls.class_name ? cls.color + "80" : C.gray200}`, background: filteredCls === cls.class_name ? cls.color + "20" : "transparent", color: filteredCls === cls.class_name ? cls.color : C.gray400, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: cls.color }} />
                {cls.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Donut */}
            <div style={{ ...S.card, background: C.bgCard }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.txtSec, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>클래스별 면적 비율</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={displayed} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="area_ratio" nameKey="label" paddingAngle={2}>
                        {displayed.map((d, i) => <Cell key={i} fill={d.color} opacity={filteredCls && d.class_name !== filteredCls && d.class_name !== "normal" ? 0.25 : 1} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.txtPri }}>{summary.total_damage_ratio}%</div>
                      <div style={{ fontSize: 10, color: C.txtMut }}>총 손상</div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {class_stats.map(cls => (
                    <div key={cls.class_name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, opacity: filteredCls && cls.class_name !== filteredCls && cls.class_name !== "normal" ? 0.25 : 1, transition: "opacity 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 2, background: cls.color }} />
                        <span style={{ fontSize: 12, color: C.txtSec }}>{cls.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.txtPri }}>{cls.area_ratio}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ ...S.card, background: C.bgCard }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.txtSec, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>손상 유형별 면적</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={class_stats.filter(c => c.class_name !== "normal")} barSize={28}>
                  <XAxis dataKey="label" tick={{ fill: C.gray400, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.gray300, fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="area_ratio" radius={[4, 4, 0, 0]}>
                    {class_stats.filter(c => c.class_name !== "normal").map((d, i) => <Cell key={i} fill={d.color} opacity={filteredCls && d.class_name !== filteredCls ? 0.25 : 1} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.gray100}` }}>
                {class_stats.filter(c => c.class_name !== "normal").map(cls => (
                  <div key={cls.class_name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, opacity: filteredCls && cls.class_name !== filteredCls ? 0.25 : 1 }}>
                    <span style={{ fontSize: 12, color: C.txtSec }}>{cls.label}</span>
                    <span style={S.badge(cls.severity)}>{sev(cls.severity).label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full damage bar */}
          <div style={{ ...S.card, background: C.bgCard }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.txtSec, textTransform: "uppercase", letterSpacing: "0.06em" }}>전체 손상 분포</span>
              <span style={{ fontSize: 12, color: C.txtMut }}>총 손상 {summary.total_damage_ratio}%</span>
            </div>
            <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden", gap: 1 }}>
              {class_stats.map(cls => (
                <div key={cls.class_name} title={`${cls.label}: ${cls.area_ratio}%`} style={{ width: `${cls.area_ratio}%`, background: cls.color, transition: "all 0.5s", opacity: filteredCls && cls.class_name !== filteredCls && cls.class_name !== "normal" ? 0.2 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cls.area_ratio > 8 && <span style={{ fontSize: 10, fontWeight: 700, color: cls.class_name === "normal" ? C.gray500 : "rgba(0,0,0,0.65)" }}>{cls.area_ratio}%</span>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              {class_stats.map(cls => (
                <div key={cls.class_name} style={{ display: "flex", alignItems: "center", gap: 5, opacity: filteredCls && cls.class_name !== filteredCls && cls.class_name !== "normal" ? 0.25 : 1 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: cls.color }} />
                  <span style={{ fontSize: 11, color: C.txtMut }}>{cls.label} {cls.area_ratio}%</span>
                </div>
              ))}
            </div>
          </div>

          {memo && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: C.gray50, borderRadius: 8, borderLeft: `3px solid ${C.blue}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gray400, marginBottom: 3 }}>현장 메모</div>
              <div style={{ fontSize: 13, color: C.gray700 }}>{memo}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }} className="no-print">
        <button onClick={onReset} style={S.btn("ghost")} className="btn-h">← 새 분석</button>
        <button onClick={handleReport} disabled={reportLoading} style={S.btn("primary", reportLoading)} className="btn-h">
          {reportLoading ? <><span style={{ animation: "spin 0.9s linear infinite", display: "inline-block" }}>⟳</span> 리포트 생성 중...</> : <>📄 리포트 생성 →</>}
        </button>
      </div>
    </div>
  );
}

/* ─── Report Page ────────────────────────────────────────────── */
function ReportPage({ report, result, onReset }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(report.report_text);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const { report_title, created_at } = report;
  const dateStr = new Date(created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleTxt = () => {
    const content = `도로 사진 분석 리포트\n생성일시: ${dateStr}\n\n${editText}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `도로점검_리포트_${new Date().toISOString().slice(0, 10)}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const handlePdf = async () => {
    try {
      setPdfLoading(true); await new Promise(r => setTimeout(r, 800));
      // ── 실제 API 연동 시 교체 ──────────────────────────────
      // const res = await fetch("/api/report/pdf",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...})});
      // ───────────────────────────────────────────────────────
      throw new Error("PDF 다운로드는 백엔드 API 연동 후 활성화됩니다.");
    } catch (e) { setError(e.message); }
    finally { setPdfLoading(false); }
  };

  const handleSave = () => { setSaved(true); setEditMode(false); setTimeout(() => setSaved(false), 2000); };
  const handleCopy = () => { navigator.clipboard.writeText(editText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px" }} className="fade-in">
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }} className="no-print">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.txtPri, marginBottom: 6 }}>점검 리포트</h1>
          <p style={{ fontSize: 14, color: C.txtSec }}>AI가 생성한 점검 리포트 초안입니다. 내용을 검토 후 활용하세요.</p>
        </div>
        <button onClick={onReset} style={{ ...S.btn("ghost"), fontSize: 13 }} className="btn-h">← 처음으로</button>
      </div>

      <ErrorBanner message={error} onClose={() => setError(null)} />

      <div className="report-doc" style={{ ...S.card, marginBottom: 20, borderTop: `2px solid ${C.cyan}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 18, marginBottom: 20, borderBottom: `1px solid ${C.bdr}` }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.blue, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>Road Inspection Report</div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: C.gray900, marginBottom: 4 }}>{report_title}</h2>
            <div style={{ fontSize: 12, color: C.gray400 }}>생성일시: {dateStr}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.txtMut, marginBottom: 4 }}>분석 엔진</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.txtSec }}>LiteRaceSegNet v11</div>
            <span style={{ marginTop: 8, display: "inline-block", padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: C.cyanLt, color: C.cyan, border: `1px solid ${C.cyanBdr}` }}>초안</span>
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
          {[
            { label: "손상 비율", value: `${result.summary.total_damage_ratio}%`, color: C.red },
            { label: "심각도 추정", value: sev(result.summary.estimated_severity).label, color: sev(result.summary.estimated_severity).color },
            { label: "주요 유형", value: result.summary.main_damage_type, color: C.blue },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: C.bgEl, borderRadius: 8, padding: "12px 14px", borderLeft: `2px solid ${color}` }}>
              <div style={{ fontSize: 11, color: C.gray400, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Report text */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.txtSec, textTransform: "uppercase", letterSpacing: "0.06em" }}>종합 소견</div>
            <div style={{ display: "flex", gap: 6 }} className="no-print">
              {editMode ? (
                <>
                  <button onClick={() => setEditMode(false)} style={{ ...S.btn("ghost"), fontSize: 11, padding: "5px 12px" }}>✕ 취소</button>
                  <button onClick={handleSave} style={{ ...S.btn("primary"), fontSize: 11, padding: "5px 12px" }}>{saved ? "✓ 저장됨" : "💾 저장"}</button>
                </>
              ) : (
                <>
                  <button onClick={handleCopy} style={{ ...S.btn("secondary"), fontSize: 11, padding: "5px 12px" }}>{copied ? "✓ 복사됨" : "📋 복사"}</button>
                  <button onClick={() => setEditMode(true)} style={{ ...S.btn("secondary"), fontSize: 11, padding: "5px 12px" }}>✏️ 편집</button>
                </>
              )}
            </div>
          </div>
          {editMode ? (
            <div>
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)} style={{ width: "100%", minHeight: 200, border: `1px solid ${C.blue}`, borderRadius: 8, padding: "14px 16px", fontSize: 13, color: C.gray700, lineHeight: 1.85, background: C.white, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: C.gray400 }}>리포트 내용을 직접 수정할 수 있습니다.</span>
                <span style={{ fontSize: 11, color: C.txtMut }}>{editText.length}자</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: C.gray700, lineHeight: 1.9, whiteSpace: "pre-line", padding: "16px 18px", background: C.gray50, borderRadius: 8, border: `1px solid ${C.gray200}` }}>
              {editText}
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.txtSec, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>손상 클래스별 상세</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.bgEl }}>
                {["손상 유형", "면적 비율", "심각도", "조치 권고"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.gray500, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${C.bdr}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.class_stats.filter(c => c.class_name !== "normal").map((cls, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.bdr}` }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: C.txtPri }}>{cls.label || cls.class_name}</td>
                  <td style={{ padding: "12px 14px", color: C.txtSec }}>{cls.area_ratio}%</td>
                  <td style={{ padding: "12px 14px" }}><span style={S.badge(cls.severity)}>{sev(cls.severity).label}</span></td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: cls.severity === "high" ? C.red : C.txtMut, fontWeight: cls.severity === "high" ? 600 : 400 }}>
                    {cls.severity === "high" ? "🔴 우선 점검 필요" : cls.severity === "medium" ? "🟡 경과 관찰 권장" : "🟢 정기 점검 유지"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "12px 14px", background: "rgba(251,191,36,0.08)", borderRadius: 8, borderLeft: `2px solid rgba(251,191,36,0.4)` }}>
          <p style={{ fontSize: 11, color: "rgba(251,191,36,0.8)", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            ⚠️ 본 리포트는 AI 점검 보조 도구가 생성한 초안입니다. 자율주행 차량 제어, 실시간 도로 관제, 도로 안전 등급 자동 판정에 사용할 수 없으며, 최종 판단은 담당자가 수행합니다.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
        <button onClick={onReset} style={{ ...S.btn("ghost"), fontSize: 13 }} className="btn-h">← 처음으로</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} style={{ ...S.btn("secondary"), fontSize: 13 }} className="btn-h">🖨 인쇄</button>
          <button onClick={handleTxt} style={{ ...S.btn("secondary"), fontSize: 13 }} className="btn-h">📄 TXT 저장</button>
          <button onClick={handlePdf} disabled={pdfLoading} style={S.btn("primary", pdfLoading)} className="btn-h">
            {pdfLoading ? <><span style={{ animation: "spin 0.9s linear infinite", display: "inline-block" }}>⟳</span> 생성 중...</> : <>⬇ PDF 다운로드</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────────── */
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("landing"); // landing | main
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [report, setReport] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { records, saveRecord, removeRecord, clearAll } = useHistory();

  const handleAnalyze = (res) => {
    saveRecord({ file_name: res.file_name, file_size: res.file_size, original_image_url: res.original_image_url, result_image_url: res.result_image_url, class_stats: res.class_stats, summary: res.summary, memo: res.memo, report_text: res.report_text, report_title: res.report_title });
    setResult(res); setStep(1);
  };
  const handleReport = (rep) => { setReport(rep); setStep(2); };
  const handleReset = () => { setStep(0); setResult(null); setReport(null); };
  const handleLogout = () => { setAuthed(false); setPage("landing"); setStep(0); setResult(null); setReport(null); };
  const handleLoadRec = (rec) => { setResult({ ...rec, original_image_url: rec.original_image_url, result_image_url: rec.result_image_url }); setStep(1); setHistoryOpen(false); };

  if (!authed) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <LoginPage onLogin={() => setAuthed(true)} />
    </>
  );

  if (page === "landing") return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={S.page}>
        <div style={{ ...S.topbar }} className="no-print">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: C.blue, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M3 12h3m12 0h3M12 3v3m0 12v3" /><path d="M6.34 6.34l2.12 2.12m7.08 7.08l2.12 2.12M6.34 17.66l2.12-2.12m7.08-7.08l2.12-2.12" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.gray900 }}>도로 점검 플랫폼</div>
              <div style={{ fontSize: 11, color: C.gray400, marginTop: 1 }}>Road Inspection Assistant</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setPage("main")} style={{ ...S.btn("primary"), padding: "8px 18px", fontSize: 13 }} className="btn-h">분석 시작하기 →</button>
            <button onClick={handleLogout} style={{ ...S.btn("ghost"), padding: "8px 14px", fontSize: 12 }} className="btn-h">로그아웃</button>
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
        <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} records={records} onSelect={handleLoadRec} onDelete={removeRecord} onClear={clearAll} activeId={result?.id} />
        <div style={{ ...S.topbar }} className="no-print">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <img src="/logo.png" alt="logo" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.txtPri, letterSpacing: "-0.3px", lineHeight: 1.25 }}>도로 점검 플랫폼</div>
                <div style={{ fontSize: 10, color: C.txtSec, lineHeight: 1.25, marginTop: 1 }}>Road Inspection Assistant</div>
              </div>
            </button>
          </div>
          <Stepper current={step} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setHistoryOpen(true)} style={{ ...S.btn("secondary"), fontSize: 12, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }} className="btn-h">
              🕐 이력 {records.length > 0 && <span style={{ padding: "1px 6px", borderRadius: 10, background: C.blueLt, color: C.blue, fontSize: 10, fontWeight: 700 }}>{records.length}</span>}
            </button>
            <button onClick={handleLogout} style={{ ...S.btn("ghost"), fontSize: 12, padding: "6px 12px" }} className="btn-h">로그아웃</button>
          </div>
        </div>
        {step === 0 && <UploadPage onAnalyze={handleAnalyze} />}
        {step === 1 && result && <ResultPage result={result} onReport={handleReport} onReset={handleReset} />}
        {step === 2 && report && <ReportPage report={report} result={result} onReset={handleReset} />}
      </div>
    </>
  );
}