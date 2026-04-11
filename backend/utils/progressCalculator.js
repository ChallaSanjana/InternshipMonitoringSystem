import { calculateMlInternshipProgress, calculateDateProgress } from './reportProgressModel.js';

/**
 * Calculate internship progress percentage
 * @param {string|Date} startDate - Internship start date
 * @param {string|Date} endDate - Internship end date
 * @param {Object} options - Optional ML inputs (reports, files, referenceDate)
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (startDate, endDate, options = null) => {
  if (options && (Array.isArray(options.reports) || Array.isArray(options.files))) {
    return calculateMlInternshipProgress({
      startDate,
      endDate,
      reports: options.reports || [],
      files: options.files || [],
      referenceDate: options.referenceDate || new Date()
    }).progress;
  }

  return calculateDateProgress(startDate, endDate, new Date());
};

export const calculateProgressWithBreakdown = (startDate, endDate, options = {}) => {
  return calculateMlInternshipProgress({
    startDate,
    endDate,
    reports: options.reports || [],
    files: options.files || [],
    referenceDate: options.referenceDate || new Date()
  });
};
