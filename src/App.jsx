import { useState } from "react";

import { C, S } from "./styles/theme";
import { useHistory } from "./hooks/useHistory";

import { Header } from "./components/layout/Header";
import { Icon } from "./components/common/Icons";
import { Stepper } from "./components/common/Stepper";
import { Logo } from "./components/common/Logo";
import { HistoryPanel } from "./components/layout/HistoryPanel";

import { LoginPage } from "./pages/LoginPage";
import { UploadPage } from "./pages/UploadPage";
import { ResultPage } from "./pages/ResultPage";
import { ReportPage } from "./pages/ReportPage";
import { LandingPage } from "./pages/LandingPage";

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

  if (page === "landing") {
    return (
      <div style={S.page}>
        <Header
          onLogoClick={() => setPage("landing")}
          onStartClick={() => setPage("main")}
          onLogout={handleLogout}
          showLogoutButton={true}
        />

        <LandingPage onStart={() => setPage("main")} />
      </div>
    );
  }

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
      <Header
        onLogoClick={() => setPage("landing")}
        onStartClick={() => setPage("main")}
        onLogout={handleLogout}
        showLogoutButton={true}
      />
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
