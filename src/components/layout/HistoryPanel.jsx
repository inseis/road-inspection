import { C, S } from "../../styles/theme";
import { sev } from "../../utils/severity";
import { Icon } from "../common/Icons";

/* ─── History Panel ──────────────────────────────────────────── */
function HistoryPanel({ open, onClose, records, onSelect, onDelete, onClear }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}
      <div
        className={open ? "slide-r" : ""}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: 300,
          background: C.bgCard,
          borderLeft: `1px solid ${C.bdrMd}`,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.bdr}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon.clock width={15} height={15} stroke={C.cyan} />
            <span style={{ fontSize: 14, fontWeight: 700, color: C.txtPri }}>
              분석 이력
            </span>
            {records.length > 0 && (
              <span
                style={{
                  padding: "1px 7px",
                  borderRadius: 10,
                  background: C.cyanLt,
                  border: `1px solid ${C.cyanBdr}`,
                  color: C.cyan,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {records.length}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {records.length > 0 && (
              <button
                onClick={onClear}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.txtMut,
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon.trash width={12} height={12} />
                전체삭제
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.txtMut,
                display: "flex",
              }}
            >
              <Icon.x width={16} height={16} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {records.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                gap: 12,
                opacity: 0.5,
              }}
            >
              <Icon.clock width={36} height={36} stroke={C.txtMut} />
              <p style={{ fontSize: 13, color: C.txtMut }}>
                분석 이력이 없습니다
              </p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelect(rec)}
                className="card-h"
                style={{
                  borderRadius: 12,
                  border: `1px solid ${C.bdr}`,
                  background: C.bgEl,
                  padding: 12,
                  marginBottom: 8,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "16/9",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 8,
                    background: C.bg,
                  }}
                >
                  <img
                    src={rec.result_image_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top,rgba(10,14,20,0.6),transparent)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 7,
                      left: 7,
                      ...S.badge(rec.summary.estimated_severity),
                      fontSize: 10,
                    }}
                  >
                    {sev(rec.summary.estimated_severity).label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(rec.id);
                    }}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(10,14,20,0.7)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.txtSec,
                    }}
                  >
                    <Icon.x width={10} height={10} />
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.txtPri,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 3,
                  }}
                >
                  {rec.file_name}
                </p>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ fontSize: 10, color: C.txtMut }}>
                    {new Date(rec.created_at).toLocaleString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    style={{ fontSize: 10, fontWeight: 700, color: C.cyan }}
                  >
                    손상 {rec.summary.total_damage_ratio}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export { HistoryPanel };
