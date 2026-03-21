export type DateBasedStatus = 'pending' | 'active' | 'completed';

export function getDateBasedStatus(startDate: string, endDate: string): DateBasedStatus {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const start = new Date(startDate);
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

  const end = new Date(endDate);
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  if (current < startTime) {
    return 'pending';
  }

  if (current > endTime) {
    return 'completed';
  }

  return 'active';
}

export function getStatusLabel(status: DateBasedStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getStatusBadgeClass(status: DateBasedStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-200';
    case 'active':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200';
    case 'completed':
      return 'bg-violet-100 text-violet-800 border-violet-300 ring-1 ring-violet-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
