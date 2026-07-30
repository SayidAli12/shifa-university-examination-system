export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  // If time is HH:MM
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  return timeString;
};

export const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'scheduled':
    case 'ongoing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'draft':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'inactive':
    case 'cancelled':
    case 'postponed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
