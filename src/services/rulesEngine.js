// محرك تنبؤ مبدئي قائم على قواعد (المرحلة 1 من خطة الذكاء الاصطناعي).
// هذا ليس نموذج تعلم آلي — هو حدود ونسب تقديرية عامة تُستبدل لاحقًا بنموذج مدرّب
// على بيانات حقيقية (راجع Carvia_Technical_Plan.md القسم 4).

// قاعدة بيانات أكواد DTC شائعة مع شرح ونسبة خطورة تقديرية
const DTC_RULES = {
  P0128: {
    title: "حرارة المحرك أقل من المعدل التشغيلي (منظم الحرارة)",
    severity: "warning",
    canDrive: true,
    estCostMin: 200,
    estCostMax: 450,
  },
  P0171: {
    title: "خليط الوقود/الهواء فقير (System Too Lean)",
    severity: "warning",
    canDrive: true,
    estCostMin: 150,
    estCostMax: 500,
  },
  P0300: {
    title: "خلل في الإشعال (Random Misfire)",
    severity: "critical",
    canDrive: false,
    estCostMin: 300,
    estCostMax: 900,
  },
  P0420: {
    title: "كفاءة المحول الحفاز أقل من الحد المطلوب",
    severity: "warning",
    canDrive: true,
    estCostMin: 600,
    estCostMax: 1500,
  },
};

export function analyzeCurrentIssues(reading) {
  if (!reading || !reading.dtcCodes?.length) return [];

  return reading.dtcCodes.map((code) => {
    const rule = DTC_RULES[code] || {
      title: "كود عطل غير معروف بقاعدة البيانات الحالية",
      severity: "info",
      canDrive: true,
      estCostMin: null,
      estCostMax: null,
    };
    return { code, ...rule };
  });
}

export function predictUpcomingIssues(readingsHistory) {
  const predictions = [];
  if (!readingsHistory.length) return predictions;

  const latest = readingsHistory[readingsHistory.length - 1];

  // قاعدة تقديرية: ارتفاع حرارة متكرر يزيد احتمال تلف حساسات مرتبطة
  const highTempCount = readingsHistory.filter((r) => r.engineTemp > 100).length;
  if (highTempCount >= 3) {
    predictions.push({
      title: "احتمال تلف حساس الحرارة أو مشكلة بنظام التبريد",
      probability: Math.min(90, 40 + highTempCount * 8),
      severity: "warning",
      estCostMin: 300,
      estCostMax: 700,
    });
  }

  // قاعدة تقديرية: انخفاض تدريجي بجهد البطارية
  if (latest.batteryVoltage && latest.batteryVoltage < 12.2) {
    predictions.push({
      title: "ضعف تدريجي في البطارية",
      probability: latest.batteryVoltage < 11.8 ? 75 : 50,
      severity: latest.batteryVoltage < 11.8 ? "critical" : "info",
      estCostMin: 250,
      estCostMax: 400,
    });
  }

  return predictions;
}
