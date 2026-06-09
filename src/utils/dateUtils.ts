export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
}

export function calculateAge(birthday: string, targetDate: string | Date = new Date()): AgeResult {
  const birth = new Date(birthday);
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalMonths = years * 12 + months;

  return { years, months, days, totalDays, totalMonths };
}

export function formatAge(years: number, months: number): string {
  if (years === 0) {
    if (months === 0) return '新生儿';
    if (months === 1) return '1个月';
    return `${months}个月`;
  }
  if (months === 0) return `${years}岁`;
  return `${years}岁${months}个月`;
}

export function formatAgeFromBirthday(birthday: string, targetDate: string | Date = new Date()): string {
  const { years, months } = calculateAge(birthday, targetDate);
  return formatAge(years, months);
}

export function formatDate(date: string | Date, format: 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'YYYY年MM月DD日' | 'MM-DD' | 'MM月DD日' = 'YYYY-MM-DD'): string {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'YYYY年MM月DD日':
      return `${year}年${month}月${day}日`;
    case 'MM-DD':
      return `${month}-${day}`;
    case 'MM月DD日':
      return `${month}月${day}日`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
}

export function formatTime(date: string | Date, format: 'HH:mm' | 'HH:mm:ss' | 'hh:mm A' = 'HH:mm'): string {
  const d = date instanceof Date ? date : new Date(date);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'HH:mm:ss':
      return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
    case 'hh:mm A': {
      const h = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${h}:${minutes} ${ampm}`;
    }
    case 'HH:mm':
    default:
      return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getTodayStr(): string {
  return formatDate(new Date());
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function addDays(date: string | Date, days: number): Date {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: string | Date, months: number): Date {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d;
}

export function addYears(date: string | Date, years: number): Date {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function isAfter(date1: string | Date, date2: string | Date): boolean {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  return d1.getTime() > d2.getTime();
}

export function isBefore(date1: string | Date, date2: string | Date): boolean {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  return d1.getTime() < d2.getTime();
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

export function isToday(date: string | Date): boolean {
  return isSameDay(date, new Date());
}

export function isThisYear(date: string | Date): boolean {
  const d = date instanceof Date ? date : new Date(date);
  return d.getFullYear() === new Date().getFullYear();
}

export function startOfDay(date: string | Date): Date {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: string | Date): Date {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getRelativeTime(date: string | Date, targetDate: string | Date = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const diffMs = d.getTime() - target.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));
  const absMin = Math.abs(diffMin);

  if (absMin < 1) return '刚刚';
  if (absMin < 60) return diffMin > 0 ? `${absMin}分钟后` : `${absMin}分钟前`;

  const diffHour = Math.round(diffMin / 60);
  const absHour = Math.abs(diffHour);
  if (absHour < 24) return diffHour > 0 ? `${absHour}小时后` : `${absHour}小时前`;

  const diffDay = Math.round(diffHour / 24);
  const absDay = Math.abs(diffDay);
  if (absDay < 7) return diffDay > 0 ? `${absDay}天后` : `${absDay}天前`;

  return formatDate(d);
}
