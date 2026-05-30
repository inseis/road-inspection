import { useCallback, useEffect, useRef, useState } from "react";
import { C } from "../../styles/theme";

/* ─── Image Compare Slider ───────────────────────────────────── */
function ImageCompareSlider({ originalSrc, resultSrc }) {
  const [pos, setPos] = useState(30);
  const [dragging, setDragging] = useState(false);
  const ref = useRef();

  const update = useCallback((cx) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(Math.min(Math.max(((cx - r.left) / r.width) * 100, 2), 98));
  }, []);

  useEffect(() => {
    const mv = (e) => {
      if (dragging) update(e.clientX);
    };

    const tm = (e) => {
      if (dragging) update(e.touches[0].clientX);
    };

    const up = () => setDragging(false);

    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", tm);
    window.addEventListener("touchend", up);

    return () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, update]);

  return (
    <div
      ref={ref}
      onClick={(e) => update(e.clientX)}
      style={{
        position: "relative",
        userSelect: "none",
        overflow: "hidden",
        borderRadius: 12,
        cursor: "col-resize",
        aspectRatio: "16/9",
      }}
    >
      <img
        src={resultSrc}
        alt="AI 분석"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        draggable={false}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          width: `${pos}%`,
        }}
      >
        <img
          src={originalSrc}
          alt="원본"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            minWidth: `${(100 / pos) * 100}%`,
            maxWidth: "none",
          }}
          draggable={false}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 2,
          background: "rgba(255,255,255,0.7)",
          left: `${pos}%`,
          transform: "translateX(-50%)",
        }}
      >
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onTouchStart={(e) => {
            setDragging(true);
            update(e.touches[0].clientX);
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(10,14,20,0.85)",
            border: `1.5px solid ${C.cyanBdr}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "col-resize",
            boxShadow: `0 0 16px ${C.cyanGlow}`,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.cyan}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
            <polyline
              points="9 18 15 12 9 6"
              style={{ transform: "translateX(6px)" }}
            />
          </svg>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          padding: "4px 10px",
          borderRadius: 6,
          background: "rgba(10,14,20,0.75)",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
        }}
      >
        원본
      </div>
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "4px 10px",
          borderRadius: 6,
          background: C.cyanLt,
          border: `1px solid ${C.cyanBdr}`,
          fontSize: 11,
          fontWeight: 600,
          color: C.cyan,
          backdropFilter: "blur(8px)",
        }}
      >
        AI 분석
      </div>
      {!dragging && (
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 16px",
            borderRadius: 20,
            background: "rgba(10,14,20,0.7)",
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            whiteSpace: "nowrap",
            backdropFilter: "blur(8px)",
          }}
        >
          ← 드래그하여 비교 →
        </div>
      )}
    </div>
  );
}

export { ImageCompareSlider };
