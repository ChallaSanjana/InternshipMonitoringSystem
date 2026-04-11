const IDEAL_WEEKLY_HOURS = 20;
const IDEAL_REPORT_CADENCE_DAYS = 7;

const ACTION_KEYWORDS = [
  'implemented',
  'developed',
  'designed',
  'optimized',
  'deployed',
  'tested',
  'debugged',
  'documented',
  'integrated',
  'resolved',
  'improved',
  'created',
  'built',
  'analyzed'
];

const NEXT_STEP_KEYWORDS = [
  'next',
  'plan',
  'upcoming',
  'tomorrow',
  'goal',
  'milestone',
  'roadmap',
  'target'
];

const BLOCKER_KEYWORDS = [
  'blocked',
  'issue',
  'error',
  'delay',
  'problem',
  'stuck',
  'risk'
];

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const safeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toDayTimestamp = (value) => {
  const date = safeDate(value);
  if (!date) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const countKeywordHits = (text, keywords) => {
  const normalized = String(text || '').toLowerCase();
  if (!normalized) {
    return 0;
  }

  return keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0);
};

const tokenizeWordCount = (text) => {
  const tokens = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return tokens.length;
};

export const calculateDateProgress = (startDate, endDate, currentDate = new Date()) => {
  const startTime = safeDate(startDate)?.getTime();
  const endTime = safeDate(endDate)?.getTime();
  const nowTime = safeDate(currentDate)?.getTime();

  if (!startTime || !endTime || !nowTime || endTime <= startTime) {
    return 0;
  }

  if (nowTime <= startTime) {
    return 0;
  }

  if (nowTime >= endTime) {
    return 100;
  }

  return clamp(((nowTime - startTime) / (endTime - startTime)) * 100);
};

export const analyzeReportContent = (report = {}) => {
  const description = String(report.description || '');
  const hoursWorked = Number(report.hoursWorked || 0);
  const wordCount = tokenizeWordCount(description);

  const depthScore = clamp((wordCount / 140) * 100);
  const actionHits = countKeywordHits(description, ACTION_KEYWORDS);
  const actionScore = clamp((actionHits / 4) * 100);

  const nextStepHits = countKeywordHits(description, NEXT_STEP_KEYWORDS);
  const nextStepScore = clamp((nextStepHits / 2) * 100);

  const blockerHits = countKeywordHits(description, BLOCKER_KEYWORDS);
  const blockerPenalty = clamp(blockerHits * 5, 0, 20);

  const productivityScore = clamp((hoursWorked / 8) * 100);

  const feedbackText = `${report.mentorFeedback || ''} ${report.adminFeedback || ''}`.trim();
  const reviewScore = report.mentorReviewed || feedbackText ? 100 : 20;

  const reportScore = clamp(
    depthScore * 0.35 +
      actionScore * 0.25 +
      nextStepScore * 0.15 +
      productivityScore * 0.15 +
      reviewScore * 0.1 -
      blockerPenalty
  );

  const confidence = clamp((wordCount / 100) * 100 + actionHits * 8 + nextStepHits * 10, 20, 100);

  return {
    reportScore: Number(reportScore.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    signals: {
      wordCount,
      actionHits,
      nextStepHits,
      blockerHits,
      hoursWorked: Number(hoursWorked.toFixed(2))
    },
    analyzedAt: new Date()
  };
};

const getReportCadenceScore = (reports = []) => {
  if (reports.length < 2) {
    return reports.length === 1 ? 65 : 0;
  }

  const sortedDates = reports
    .map((report) => toDayTimestamp(report.date))
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (sortedDates.length < 2) {
    return 0;
  }

  const gapsInDays = [];
  for (let index = 1; index < sortedDates.length; index += 1) {
    const gap = (sortedDates[index] - sortedDates[index - 1]) / (24 * 60 * 60 * 1000);
    gapsInDays.push(gap);
  }

  const averageDeviation =
    gapsInDays.reduce((acc, gap) => acc + Math.abs(gap - IDEAL_REPORT_CADENCE_DAYS), 0) / gapsInDays.length;

  return clamp(100 - averageDeviation * 8);
};

const getReportingCoverageScore = (startDate, endDate, reports = [], referenceDate = new Date()) => {
  if (reports.length === 0) {
    return 0;
  }

  const startTime = safeDate(startDate)?.getTime();
  const endTime = safeDate(endDate)?.getTime();
  const nowTime = safeDate(referenceDate)?.getTime();

  if (!startTime || !endTime || !nowTime || endTime <= startTime) {
    return 0;
  }

  const effectiveEnd = Math.min(nowTime, endTime);
  const elapsedDays = Math.max(1, (effectiveEnd - startTime) / (24 * 60 * 60 * 1000));
  const expectedReports = Math.max(1, Math.ceil(elapsedDays / IDEAL_REPORT_CADENCE_DAYS));

  return clamp((reports.length / expectedReports) * 100);
};

const getHoursScore = (startDate, endDate, reports = [], referenceDate = new Date()) => {
  if (reports.length === 0) {
    return 0;
  }

  const startTime = safeDate(startDate)?.getTime();
  const endTime = safeDate(endDate)?.getTime();
  const nowTime = safeDate(referenceDate)?.getTime();

  if (!startTime || !endTime || !nowTime || endTime <= startTime) {
    return 0;
  }

  const effectiveEnd = Math.min(nowTime, endTime);
  const elapsedWeeks = Math.max(1 / 7, (effectiveEnd - startTime) / (7 * 24 * 60 * 60 * 1000));
  const expectedHours = elapsedWeeks * IDEAL_WEEKLY_HOURS;
  const totalHours = reports.reduce((sum, report) => sum + Number(report.hoursWorked || 0), 0);

  return clamp((totalHours / expectedHours) * 100);
};

const getEvidenceScore = (files = []) => {
  const hasOfferLetter = files.some((file) => file.fileType === 'offer_letter');
  const reportFilesCount = files.filter((file) => file.fileType === 'report').length;
  const hasCertificate = files.some((file) => file.fileType === 'certificate');

  const score =
    (hasOfferLetter ? 60 : 0) +
    clamp(reportFilesCount * 6, 0, 25) +
    (hasCertificate ? 15 : 0);

  return {
    score: clamp(score),
    hasOfferLetter,
    reportFilesCount,
    hasCertificate
  };
};

const normalizeReportAnalyses = (reports = []) => {
  return reports.map((report) => {
    if (report?.analysis?.reportScore !== undefined) {
      return report.analysis;
    }

    return analyzeReportContent(report);
  });
};

export const calculateMlInternshipProgress = ({
  startDate,
  endDate,
  reports = [],
  files = [],
  referenceDate = new Date()
}) => {
  const dateProgress = calculateDateProgress(startDate, endDate, referenceDate);
  const analyses = normalizeReportAnalyses(reports);

  const averageReportQuality = analyses.length === 0
    ? 0
    : analyses.reduce((sum, analysis) => sum + Number(analysis.reportScore || 0), 0) / analyses.length;

  const cadenceScore = getReportCadenceScore(reports);
  const coverageScore = getReportingCoverageScore(startDate, endDate, reports, referenceDate);
  const hoursScore = getHoursScore(startDate, endDate, reports, referenceDate);

  const reportScore = clamp(
    averageReportQuality * 0.45 +
      cadenceScore * 0.2 +
      coverageScore * 0.2 +
      hoursScore * 0.15
  );

  const evidence = getEvidenceScore(files);

  let finalScore = clamp(dateProgress * 0.35 + reportScore * 0.45 + evidence.score * 0.2);

  if (!evidence.hasOfferLetter) {
    finalScore = Math.min(finalScore, 70);
  }

  return {
    progress: Number(finalScore.toFixed(2)),
    breakdown: {
      modelVersion: 'report-evidence-v1',
      dateProgress: Number(dateProgress.toFixed(2)),
      reportScore: Number(reportScore.toFixed(2)),
      reportCount: reports.length,
      averageReportQuality: Number(averageReportQuality.toFixed(2)),
      cadenceScore: Number(cadenceScore.toFixed(2)),
      coverageScore: Number(coverageScore.toFixed(2)),
      hoursScore: Number(hoursScore.toFixed(2)),
      evidenceScore: Number(evidence.score.toFixed(2)),
      hasOfferLetter: evidence.hasOfferLetter,
      reportFilesCount: evidence.reportFilesCount,
      hasCertificate: evidence.hasCertificate,
      weightedFormula: {
        date: 0.35,
        reports: 0.45,
        evidence: 0.2
      }
    }
  };
};
