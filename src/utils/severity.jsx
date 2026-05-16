const SEV_MAP = {
  high: {
    label: "높음",
    bg: "rgba(248,113,113,0.12)",
    color: "#F87171",
    dot: "#F87171",
  },
  medium: {
    label: "보통",
    bg: "rgba(251,191,36,0.12)",
    color: "#FBBF24",
    dot: "#FBBF24",
  },
  low: {
    label: "낮음",
    bg: "rgba(52,211,153,0.12)",
    color: "#34D399",
    dot: "#34D399",
  },
};

const sev = (k) => SEV_MAP[k] ?? SEV_MAP.low;

export { sev };
