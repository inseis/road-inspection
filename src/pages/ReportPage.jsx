import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { C, S } from "../styles/theme";
import { sev } from "../utils/severity";
import { Icon } from "../components/common/Icons";
import { ErrorBanner } from "../components/common/ErrorBanner";

/* ─── 퍼센트 포맷 헬퍼 ──────────────────────────────────────── */
const fmt = (v) => {
  if (v == null) return "0.0";
  const pct = v <= 1 ? v * 100 : v;
  return pct.toFixed(1);
};

/* ─── 영어 손상 유형 한글 매핑 ──────────────────────────────── */
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

/* ─── 마크다운 컴포넌트 스타일 ──────────────────────────────── */
const mdComponents = {
  h1: ({ children }) => <h1 style={{ fontSize: 16, fontWeight: 800, color: C.txtPri, marginBottom: 10, marginTop: 20, paddingBottom: 6, borderBottom: `1px solid ${C.bdr}` }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: 14, fontWeight: 700, color: C.txtPri, marginBottom: 8, marginTop: 16 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: 13, fontWeight: 700, color: C.cyan, marginBottom: 6, marginTop: 14 }}>{children}</h3>,
  p:  ({ children }) => <p  style={{ fontSize: 13, color: C.txtSec, lineHeight: 1.85, marginBottom: 10 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: C.txtPri, fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: C.cyan, fontStyle: "normal", fontWeight: 600 }}>{children}</em>,
  ul: ({ children }) => <ul style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 18, marginBottom: 10 }}>{children}</ol>,
  li: ({ children }) => <li style={{ fontSize: 13, color: C.txtSec, lineHeight: 1.8, marginBottom: 4 }}>{children}</li>,
  table: ({ children }) => <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12, fontSize: 12 }}>{children}</table>,
  th: ({ children }) => <th style={{ padding: "8px 12px", textAlign: "left", color: C.txtMut, fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${C.bdr}`, background: C.bgEl }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: "8px 12px", color: C.txtSec, borderBottom: `1px solid ${C.bdr}` }}>{children}</td>,
  hr: () => <hr style={{ border: "none", borderTop: `1px solid ${C.bdr}`, margin: "16px 0" }} />,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: `3px solid ${C.cyan}`, paddingLeft: 14, margin: "12px 0", color: C.txtSec, fontStyle: "italic" }}>{children}</blockquote>,
  code: ({ children }) => <code style={{ background: C.bgEl, padding: "2px 6px", borderRadius: 4, fontSize: 12, color: C.cyan, fontFamily: "'JetBrains Mono',monospace" }}>{children}</code>,
};

/* ─── 인쇄 전용 CSS ─────────────────────────────────────────── */
const PRINT_CSS = `
@media print {
  body { background: white !important; color: #111 !important; }
  .no-print { display: none !important; }
  .print-doc {
    max-width: 100% !important;
    padding: 0 !important;
    box-shadow: none !important;
    border: none !important;
    background: white !important;
  }
  .print-doc * { color: #111 !important; background: transparent !important; border-color: #ddd !important; }
  .print-doc h1, .print-doc h2, .print-doc h3 { color: #000 !important; }
  .print-doc .print-header-label { color: #1A56DB !important; }
  .print-doc .stat-card { border: 1px solid #ddd !important; }
  .print-doc table { border-collapse: collapse !important; }
  .print-doc th, .print-doc td { border: 1px solid #ddd !important; }
  @page { margin: 20mm; }
}
`;

/* ─── Report Page ────────────────────────────────────────────── */
function ReportPage({ report, result, onReset }) {
  const [pdfL, setPdfL]     = useState(false);
  const [editMode, setEdit] = useState(false);
  const [editText, setET]   = useState(report.report_text);
  const [saved, setSaved]   = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError]   = useState(null);

  const { report_title, created_at, report_id } = report;
  const dateStr = new Date(created_at).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const handlePrint = () => window.print();

  const handleTxt = async () => {
    try {
      if (report_id && report_id !== "rep_mock") {
        const res = await fetch(`http://13.54.233.14:8000/api/reports/${report_id}/download?format=txt`);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `도로점검_리포트_${new Date().toISOString().slice(0, 10)}.txt`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
      }
      // Mock fallback
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
    } catch (e) {
      setError(e.message);
    }
  };

  const handlePdf = async () => {
    try {
      setPdfL(true);
      if (report_id && report_id !== "rep_mock") {
        const res = await fetch(`http://13.54.233.14:8000/api/reports/${report_id}/download?format=pdf`);
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `도로점검_리포트_${new Date().toISOString().slice(0, 10)}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
      }
      // Mock fallback: 인쇄로 대체
      window.print();
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

  const statItems = [
    { label: "손상 비율",   value: `${fmt(result.summary.total_damage_ratio)}%`, color: C.red   },
    { label: "심각도 추정", value: sev(result.summary.estimated_severity).label,  color: sev(result.summary.estimated_severity).color },
    { label: "주요 유형",   value: toKor(result.summary.main_damage_type),        color: C.cyan  },
  ];

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }} className="fade-up">

        {/* 상단 헤더 */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }} className="no-print">
          <div>
            <div style={{ ...S.tag(), marginBottom: 12 }}>Step 03</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.txtPri, letterSpacing: "-0.5px", marginBottom: 6 }}>점검 리포트</h1>
            <p style={{ fontSize: 14, color: C.txtSec, wordBreak: "keep-all" }}>AI가 생성한 점검 리포트 초안입니다. 검토 후 활용하세요.</p>
          </div>
          <button onClick={onReset} style={{ ...S.btn("ghost"), fontSize: 13 }} className="btn-h">처음으로</button>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        {/* 리포트 문서 */}
        <div className="print-doc report-doc" style={{ ...S.card, marginBottom: 20, borderTop: `2px solid ${C.cyan}`, boxShadow: `0 0 40px rgba(34,211,238,0.05)` }}>

          {/* 문서 헤더 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 20, marginBottom: 20, borderBottom: `1px solid ${C.bdr}` }}>
            <div>
              <div className="print-header-label" style={{ fontSize: 10, fontWeight: 700, color: C.cyan, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Road Inspection Report
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.txtPri, letterSpacing: "-0.4px", marginBottom: 5 }}>{report_title}</h2>
              <div style={{ fontSize: 11, color: C.txtMut, fontFamily: "'JetBrains Mono',monospace" }}>생성일시: {dateStr}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.txtMut, marginBottom: 5 }}>분석 엔진</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.txtSec, marginBottom: 8 }}>LiteRaceSegNet v11</div>
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: C.cyanLt, color: C.cyan, border: `1px solid ${C.cyanBdr}` }}>초안</span>
            </div>
          </div>

          {/* 통계 카드 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
            {statItems.map(({ label, value, color }) => (
              <div key={label} className="stat-card" style={{ background: C.bgEl, borderRadius: 10, padding: "12px 14px", borderLeft: `2px solid ${color}` }}>
                <div style={{ fontSize: 10, color: C.txtMut, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color, fontFamily: "'JetBrains Mono',monospace" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* 리포트 본문 */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={S.secLabel}>종합 소견</div>
              <div style={{ display: "flex", gap: 6 }} className="no-print">
                {editMode ? (
                  <>
                    <button onClick={() => setEdit(false)} style={{ ...S.btn("ghost"), fontSize: 11, padding: "5px 12px" }}>취소</button>
                    <button onClick={handleSave} style={{ ...S.btn("primary"), fontSize: 11, padding: "5px 14px" }}>
                      <Icon.check width={12} height={12} />{saved ? "저장됨" : "저장"}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleCopy} style={{ ...S.btn("secondary"), fontSize: 11, padding: "5px 12px", gap: 5 }}>
                      <Icon.copy width={12} height={12} />{copied ? "복사됨" : "복사"}
                    </button>
                    <button onClick={() => setEdit(true)} style={{ ...S.btn("secondary"), fontSize: 11, padding: "5px 12px", gap: 5 }}>
                      <Icon.edit width={12} height={12} />편집
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
                  style={{ width: "100%", minHeight: 240, border: `1px solid ${C.cyanBdr}`, borderRadius: 10, padding: "14px 16px", fontSize: 13, color: C.txtPri, lineHeight: 1.85, background: C.bgEl, resize: "vertical", outline: "none", fontFamily: "'Space Grotesk',sans-serif", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: C.txtMut }}>마크다운 형식으로 작성하면 렌더링됩니다.</span>
                  <span style={{ fontSize: 11, color: C.txtMut, fontFamily: "'JetBrains Mono',monospace" }}>{editText.length}자</span>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 20px", background: C.bgEl, borderRadius: 10, border: `1px solid ${C.bdr}` }}>
                <ReactMarkdown components={mdComponents}>{editText}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* 손상 클래스 테이블 */}
          <div style={{ marginBottom: 20 }}>
            <div style={S.secLabel}>손상 클래스별 상세</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bgEl }}>
                  {["손상 유형", "면적 비율", "심각도", "조치 권고"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.txtMut, fontWeight: 600, fontSize: 11, letterSpacing: "0.05em", borderBottom: `1px solid ${C.bdr}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.class_stats
                  .filter((c) => c.class_name !== "normal")
                  .map((cls, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.bdr}` }}>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: C.txtPri }}>{toKor(cls.label || cls.class_name)}</td>
                      <td style={{ padding: "12px 14px", color: C.txtSec, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(cls.area_ratio)}%</td>
                      <td style={{ padding: "12px 14px" }}><span style={S.badge(cls.severity)}>{sev(cls.severity).label}</span></td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: cls.severity === "high" ? C.red : C.txtMut, fontWeight: cls.severity === "high" ? 600 : 400 }}>
                        {cls.severity === "high" ? "우선 점검 필요" : cls.severity === "medium" ? "경과 관찰 권장" : "정기 점검 유지"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* 주의 문구 */}
          <div style={{ padding: "12px 16px", background: "rgba(251,191,36,0.07)", borderRadius: 10, borderLeft: `2px solid rgba(251,191,36,0.4)` }}>
            <p style={{ fontSize: 11, color: "rgba(251,191,36,0.7)", lineHeight: 1.6, margin: 0, wordBreak: "keep-all" }}>
              본 리포트는 AI 점검 보조 도구가 생성한 초안입니다. 자율주행 차량 제어, 실시간 도로 관제, 도로 안전 등급 자동 판정에 사용할 수 없으며, 최종 판단은 담당자가 수행합니다.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
          <button onClick={onReset} style={{ ...S.btn("ghost"), fontSize: 13 }} className="btn-h">처음으로</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handlePrint} style={{ ...S.btn("secondary"), fontSize: 13, gap: 6 }} className="btn-h">
              <Icon.print width={14} height={14} />인쇄
            </button>
            <button onClick={handleTxt} style={{ ...S.btn("secondary"), fontSize: 13, gap: 6 }} className="btn-h">
              <Icon.file width={14} height={14} />TXT 저장
            </button>
            <button onClick={handlePdf} disabled={pdfL} style={{ ...S.btn("primary", pdfL), gap: 6 }} className="btn-h">
              {pdfL ? (
                <><div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid rgba(8,11,16,0.3)`, borderTop: `2px solid #080B10`, animation: "spin 0.8s linear infinite" }} /> 생성 중...</>
              ) : (
                <><Icon.dl width={15} height={15} />PDF 저장</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export { ReportPage };
