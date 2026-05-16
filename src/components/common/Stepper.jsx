import { C } from "../../styles/theme";
import { Icon } from "./Icons";

/* ─── Stepper ────────────────────────────────────────────────── */
const STEPS = ["사진 업로드", "분석 결과", "점검 리포트"];

function Stepper({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {STEPS.map((label, i) => {
        const done = i < current,
          active = i === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "4px 10px",
                borderRadius: 8,
                background: active ? C.cyanLt : "transparent",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  flexShrink: 0,
                  transition: "all 0.25s",
                  background: done
                    ? "rgba(52,211,153,0.15)"
                    : active
                      ? C.cyanLt
                      : "transparent",
                  border: `1.5px solid ${done ? "rgba(52,211,153,0.5)" : active ? C.cyanBdr : C.bdrMd}`,
                  color: done ? C.green : active ? C.cyan : C.txtMut,
                }}
              >
                {done ? <Icon.check width={10} height={10} /> : i + 1}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: done
                    ? "rgba(52,211,153,0.7)"
                    : active
                      ? C.cyan
                      : C.txtMut,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: 20,
                  height: 1,
                  background: i < current ? "rgba(52,211,153,0.3)" : C.bdr,
                  margin: "0 2px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { Stepper };
