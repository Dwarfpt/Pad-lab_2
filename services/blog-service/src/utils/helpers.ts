const transliterate = (text: string): string => {
  const ru: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 
    'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 
    'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 
    'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  return text.split('').map(char => {
    const lowerChar = char.toLowerCase();
    return ru[lowerChar] !== undefined ? ru[lowerChar] : char;
  }).join('');
};

export const generateSlug = (text: string): string => {
  const transliterated = transliterate(text);
  return transliterated
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
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
