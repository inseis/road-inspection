import { useState } from "react";

import { C, S } from "../styles/theme";
import { sev } from "../utils/severity";

import { Icon } from "../components/common/Icons";
import { ErrorBanner } from "../components/common/ErrorBanner";

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

export { ReportPage };
