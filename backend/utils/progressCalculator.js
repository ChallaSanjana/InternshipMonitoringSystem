/**
 * Calculate internship progress percentage
 * @param {string|Date} startDate - Internship start date
 * @param {string|Date} endDate - Internship end date
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (startDate, endDate) => {
  const current = new Date().getTime();
  const startTime = new Date(startDate).getTime();
  const endTime = new Date(endDate).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return 0;
  }

  const totalDuration = endTime - startTime;

  if (totalDuration <= 0) {
    return 0;
  }

  if (current <= startTime) {
    return 0;
  }

  if (current >= endTime) {
    return 100;
  }

  const elapsedTime = current - startTime;
  const progress = (elapsedTime / totalDuration) * 100;

  // Clamp progress between 0 and 100
  return Math.max(0, Math.min(100, progress));
};
