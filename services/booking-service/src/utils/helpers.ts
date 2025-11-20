export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const calculateParkingDuration = (
  startTime: Date,
  endTime: Date
): { hours: number; minutes: number; totalMinutes: number } => {
  const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes };
};

export const calculatePrice = (
  pricePerHour: number,
  durationMinutes: number
): number => {
  const hours = durationMinutes / 60;
  return Math.round(pricePerHour * hours * 100) / 100;
};
