/* ─── Mock data ──────────────────────────────────────────────── */
const DAMAGE_COLORS = {
  crack: "#FBBF24",
  pothole: "#F87171",
  surface_damage: "#A78BFA",
  normal: "rgba(255,255,255,0.08)",
};

const MOCK_CLASS_STATS = [
  {
    class_name: "crack",
    label: "균열",
    area_ratio: 12.4,
    severity: "medium",
    color: DAMAGE_COLORS.crack,
  },
  {
    class_name: "pothole",
    label: "포트홀",
    area_ratio: 4.8,
    severity: "high",
    color: DAMAGE_COLORS.pothole,
  },
  {
    class_name: "surface_damage",
    label: "표면 손상",
    area_ratio: 8.3,
    severity: "medium",
    color: DAMAGE_COLORS.surface_damage,
  },
  {
    class_name: "normal",
    label: "정상",
    area_ratio: 74.5,
    severity: "low",
    color: DAMAGE_COLORS.normal,
  },
];

const MOCK_SUMMARY = {
  main_damage_type: "균열",
  total_damage_ratio: 25.5,
  estimated_severity: "medium",
};

const DEMO_ORIGINAL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663607555234/cHkCeKBVdpB68fyrJM9SFf/road-damage-original-T6ndwJPVFUJX6FzULre6D5.webp";

const DEMO_SEGMENTED =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663607555234/cHkCeKBVdpB68fyrJM9SFf/road-damage-segmented-hcKfQ4YohySe7zerWmmoLa.webp";

export {
  DAMAGE_COLORS,
  MOCK_CLASS_STATS,
  MOCK_SUMMARY,
  DEMO_ORIGINAL,
  DEMO_SEGMENTED,
};
