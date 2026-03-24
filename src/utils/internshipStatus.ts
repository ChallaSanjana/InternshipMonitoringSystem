export type DateBasedStatus = 'pending' | 'active' | 'completed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'expired';
export type TimeStatus = 'upcoming' | 'active' | 'completed';
export type InternshipDisplayStatus = 'rejected' | 'waiting_for_approval' | 'upcoming' | 'active' | 'completed' | 'expired';

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

export function getInternshipTimeStatus(startDate: string, endDate: string): TimeStatus {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const start = new Date(startDate);
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();

  const end = new Date(endDate);
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  if (current < startTime) {
    return 'upcoming';
  }

  if (current > endTime) {
    return 'completed';
  }

  return 'active';
}

export function getInternshipDisplayStatus(
  approvalStatus: ApprovalStatus,
  startDate: string,
  endDate: string
): InternshipDisplayStatus {
  if (approvalStatus === 'completed') {
    return 'completed';
  }

  if (approvalStatus === 'expired') {
    return 'expired';
  }

  if (approvalStatus === 'rejected') {
    return 'rejected';
  }

  if (approvalStatus === 'pending') {
    return 'waiting_for_approval';
  }

  return getInternshipTimeStatus(startDate, endDate);
}

export function getInternshipDisplayStatusLabel(status: InternshipDisplayStatus) {
  switch (status) {
    case 'rejected':
      return 'Rejected';
    case 'waiting_for_approval':
      return 'Waiting for Approval';
    case 'upcoming':
      return 'Upcoming';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
}

export function getInternshipDisplayStatusBadgeClass(status: InternshipDisplayStatus) {
  switch (status) {
    case 'rejected':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    case 'waiting_for_approval':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'completed':
      return 'bg-violet-100 text-violet-700 border-violet-300';
    case 'upcoming':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    case 'expired':
      return 'bg-slate-200 text-slate-700 border-slate-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
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
