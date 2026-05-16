import { useState } from "react";

import { C, S } from "./styles/theme";
import { useHistory } from "./hooks/useHistory";

import { Icon } from "./components/common/Icons";
import { Stepper } from "./components/common/Stepper";
import { Logo } from "./components/common/Logo";
import { HistoryPanel } from "./components/layout/HistoryPanel";

import { LoginPage } from "./pages/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { UploadPage } from "./pages/UploadPage";
import { ResultPage } from "./pages/ResultPage";
import { ReportPage } from "./pages/ReportPage";

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

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  if (page === "landing")
    return (
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
    );

  return (
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
  );
}
