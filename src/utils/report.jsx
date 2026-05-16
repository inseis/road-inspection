export function generateReport(stats, summary, memo) {
  const damaged = stats.filter((s) => s.class_name !== "normal");
  const sl = { low: "낮음", medium: "중간", high: "높음" };

  return [
    "[분석 개요]",
    `업로드된 도로 사진 분석 결과, 주요 손상 유형은 ${damaged[0]?.label ?? "균열"}으로 확인되었습니다. 전체 도로 면적 대비 총 손상 비율은 약 ${summary.total_damage_ratio}%로 추정되며, 손상 심각도는 ${sl[summary.estimated_severity]} 수준입니다.`,
    "",
    "[손상 유형별 분석]",
    ...damaged.map(
      (c) =>
        `• ${c.label}: 전체 면적의 ${c.area_ratio}% — 심각도 ${sl[c.severity]}\n  ${
          c.class_name === "crack"
            ? "도로 표면에 다수의 선형 균열이 확인됩니다. 균열의 폭과 깊이에 따라 조기 보수가 필요할 수 있습니다."
            : c.class_name === "pothole"
              ? "복수의 포트홀이 탐지되었습니다. 차량 손상 및 교통 안전에 직접적인 영향을 미칠 수 있으므로 우선적인 보수 조치가 필요합니다."
              : "아스팔트 표면의 노화 및 박리 현상이 관찰됩니다. 방치 시 균열 및 포트홀로 진행될 수 있습니다."
        }`,
    ),
    "",
    "[종합 의견]",
    `전체 손상 비율이 ${summary.total_damage_ratio}%로 ${summary.total_damage_ratio > 20 ? "상당한" : "일부"} 수준이며, 특히 ${damaged.find((d) => d.severity === "high")?.label ?? damaged[0]?.label} 부분은 ${damaged.find((d) => d.severity === "high") ? "즉각적인 보수가 권고됩니다" : "단기 내 보수 계획 수립을 검토하시기 바랍니다"}.`,
    memo ? `\n[현장 메모]\n${memo}` : "",
    "",
    "[주의 사항]",
    "본 분석 결과는 LiteRaceSegNet 모델 기반 점검 보조 자료이며, 최종 판단은 담당자가 현장 확인 후 수행하시기 바랍니다.",
  ]
    .filter(Boolean)
    .join("\n");
}
