import { useCallback, useRef, useState } from "react";

import { C, S } from "../styles/theme";
import { Icon } from "../components/common/Icons";
import { ErrorBanner } from "../components/common/ErrorBanner";
import { AnalyzingOverlay } from "../components/layout/AnalyzingOverlay";

import { MAX_FILE_MB, validateFile } from "../utils/file";
import { KakaoMapPicker } from "../components/layout/KakaoMapPicker";
import { generateReport } from "../utils/report";

import {
  MOCK_CLASS_STATS,
  MOCK_SUMMARY,
  DEMO_ORIGINAL,
  DEMO_SEGMENTED,
} from "../constants/mockData";

/* ─── 시도 목록 ──────────────────────────────────────────────── */
const SIDO_LIST = [
  "서울특별시", "부산광역시", "대구광역시", "인천광역시",
  "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
  "경기도", "강원특별자치도", "충청북도", "충청남도",
  "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도",
];

/* ─── Upload Page ────────────────────────────────────────────── */
function UploadPage({ onAnalyze }) {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [memo, setMemo]       = useState("");
  const [sido, setSido]       = useState("");
  const [sigungu, setSigungu] = useState("");
  const [drag, setDrag]       = useState(false);
  const [progress, setProg]   = useState(0);
  const [analyzing, setAn]    = useState(false);
  const [error, setError]     = useState(null);
  const [fileErr, setFErr]    = useState(null);
  const [showMap, setShowMap] = useState(false);
  const inputRef = useRef();

  const applyFile = (f) => {
    const err = validateFile(f);
    if (err) { setFErr(err); return; }
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
    if (err) { setFErr(err); return; }

    try {
      setAn(true);
      setProg(0);

      // ── 실제 API 연동 시 아래로 교체 ──────────────────────────
      // [Step 1] 이미지 업로드 → image_id 받기
      // const fd = new FormData();
      // fd.append("image", file);
      // fd.append("address_si_do", sido);
      // fd.append("address_si_gun_gu", sigungu);
      // const uploadRes = await fetch("/api/images", { method: "POST", body: fd });
      // if (!uploadRes.ok) {
      //   const err = await uploadRes.json();
      //   throw new Error(err.error?.message || "이미지 업로드에 실패했습니다.");
      // }
      // const uploadData = await uploadRes.json();
      // const { image_id, original_image_url } = uploadData;
      // setProg(30);
      //
      // [Step 2] 분석 요청 → analysis_id 받기
      // const analysisRes = await fetch("/api/analyses", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ image_id, model: "model" }),
      // });
      // if (!analysisRes.ok) {
      //   const err = await analysisRes.json();
      //   throw new Error(err.error?.message || "분석 요청에 실패했습니다.");
      // }
      // const analysisData = await analysisRes.json();
      // setProg(100);
      //
      // onAnalyze({
      //   image_id,
      //   analysis_id: analysisData.analysis_id,
      //   original_image_url,
      //   result_image_url: analysisData.result_images.overlay,
      //   result_images: analysisData.result_images,
      //   class_stats: analysisData.class_stats,
      //   summary: analysisData.summary,
      //   memo,
      //   location: { sido, sigungu },
      //   file_name: file?.name ?? "road.jpg",
      //   file_size: file?.size ?? 0,
      // });
      // ───────────────────────────────────────────────────────────

      // Mock 진행
      const vals = [
        { d: 400,  v: 18 },
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

      setAn(false);
      onAnalyze({
        image_id: "img_mock",
        analysis_id: "ana_mock",
        original_image_url: preview ?? DEMO_ORIGINAL,
        result_image_url: DEMO_SEGMENTED,
        result_images: {
          mask:         DEMO_SEGMENTED,
          overlay:      DEMO_SEGMENTED,
          boundary:     DEMO_SEGMENTED,
          service_card: DEMO_SEGMENTED,
        },
        class_stats: MOCK_CLASS_STATS,
        summary: MOCK_SUMMARY,
        memo,
        location: { sido, sigungu },
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

  /* 공통 인풋 스타일 */
  const inputStyle = {
    width: "100%",
    border: `1px solid ${C.bdrMd}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 13,
    color: C.txtPri,
    background: C.bgEl,
    outline: "none",
    fontFamily: "'Space Grotesk',sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    appearance: "none",
  };

  return (
    <>
      {analyzing && <AnalyzingOverlay progress={progress} />}
      {showMap && (
        <KakaoMapPicker
          onSelect={({ address }) => {
            setSido(address.sido);
            setSigungu(address.sigungu);
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
        />
      )}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "52px 20px" }} className="fade-up">
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...S.tag(), marginBottom: 14 }}>Step 01</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.txtPri, letterSpacing: "-0.6px", marginBottom: 8 }}>
            도로 사진 업로드
          </h1>
          <p style={{ fontSize: 14, color: C.txtSec, lineHeight: 1.7, wordBreak: "keep-all" }}>
            점검할 도로 사진을 업로드하면 AI가 손상 영역을 분석합니다.
          </p>
        </div>

        <ErrorBanner message={error} onClose={() => setError(null)} />

        <div style={S.card}>
          {/* Drop zone */}
          <div
            onClick={() => !preview && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
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
                <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block", borderRadius: 10 }} />
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ background: "rgba(10,14,20,0.82)", borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(8px)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{file?.name}</span>
                    <span style={{ fontSize: 10, color: C.txtMut }}>{file && `${(file.size / 1024).toFixed(0)}KB`}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setFErr(null); }}
                    style={{ background: "rgba(10,14,20,0.82)", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 11, cursor: "pointer", color: C.txtSec, display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(8px)" }}
                  >
                    <Icon.x width={11} height={11} /> 제거
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.cyanLt, border: `1px solid ${C.cyanBdr}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon.upload width={24} height={24} stroke={C.cyan} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.txtPri, marginBottom: 6 }}>사진을 드래그하거나</div>
                <div style={{ fontSize: 13, color: C.txtMut, marginBottom: 20 }}>JPG, PNG 형식 · 최대 {MAX_FILE_MB}MB</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 22px", borderRadius: 9, background: C.cyan, color: "#080B10", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 16px ${C.cyanGlow}` }}>
                  <Icon.upload width={14} height={14} /> 파일 선택
                </div>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={(e) => applyFile(e.target.files[0])} />
          {fileErr && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <Icon.info width={13} height={13} stroke={C.red} />
              <span style={{ fontSize: 12, color: C.red, fontWeight: 500 }}>{fileErr}</span>
            </div>
          )}

          {/* Demo hint */}
          {!file && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: C.bgEl, borderRadius: 9, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon.info width={13} height={13} stroke={C.txtMut} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.txtSec }}>
                사진이 없어도{" "}
                <button
                  onClick={() => { setFile(new File([], "demo_road.jpg", { type: "image/jpeg" })); setPreview(DEMO_ORIGINAL); }}
                  style={{ background: "none", border: "none", color: C.cyan, fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                >
                  데모 이미지로 체험
                </button>
                해볼 수 있습니다.
              </span>
            </div>
          )}

          {/* 위치 정보 */}
          <div style={{ marginTop: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.txtMut, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              촬영 위치{" "}
              <span style={{ color: C.txtMut, fontWeight: 400, textTransform: "none", letterSpacing: "normal", fontSize: 11 }}>· 선택사항</span>
            </label>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                background: sido ? C.cyanLt : C.bgEl,
                border: `1px solid ${sido ? C.cyanBdr : C.bdrMd}`,
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sido ? C.cyan : C.txtMut} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                {sido ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.txtPri }}>{sido} {sigungu}</div>
                    <div style={{ fontSize: 11, color: C.txtMut, marginTop: 1 }}>탭하여 위치 변경</div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, color: C.txtMut }}>지도에서 위치 선택하기</div>
                )}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.txtMut} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* 현장 메모 */}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.txtMut, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              현장 메모{" "}
              <span style={{ color: C.txtMut, fontWeight: 400, textTransform: "none", letterSpacing: "normal", fontSize: 11 }}>· 선택사항, 리포트에 반영됩니다</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 우측 차선 주변 균열 확인, 민원 접수 건"
              maxLength={300}
              style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.7 }}
            />
            <div style={{ textAlign: "right", fontSize: 11, color: C.txtMut, marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>
              {memo.length}/300
            </div>
          </div>

          <div style={{ marginTop: 12, padding: "10px 14px", background: C.bgEl, borderRadius: 9, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon.info width={13} height={13} stroke={C.txtMut} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: C.txtMut, lineHeight: 1.5, margin: 0 }}>
              본 서비스는 점검 보조 목적으로만 제공됩니다. 최종 판단은 담당자가 직접 수행해 주세요.
            </p>
          </div>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={start}
              disabled={!file || !!fileErr}
              style={{ ...S.btn("primary", !file || !!fileErr), padding: "11px 28px" }}
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

export { UploadPage };
