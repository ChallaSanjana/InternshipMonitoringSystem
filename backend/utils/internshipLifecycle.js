export const getEffectiveInternshipStatus = (status, endDate) => {
  const end = new Date(endDate);
  const endTime = end.getTime();

  if (Number.isNaN(endTime)) {
    return status;
  }

  if (Date.now() > endTime) {
    if (status === 'approved') {
      return 'completed';
    }

    if (status === 'pending') {
      return 'expired';
    }
  }

  return status;
};
