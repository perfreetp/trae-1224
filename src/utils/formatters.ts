import type { Gender } from '../types';

export function formatHeight(height: number | undefined | null, unit: 'cm' | 'm' = 'cm'): string {
  if (height === undefined || height === null || isNaN(height)) return '-';
  if (unit === 'm') return `${(height / 100).toFixed(2)} m`;
  return `${height.toFixed(1)} cm`;
}

export function formatWeight(weight: number | undefined | null): string {
  if (weight === undefined || weight === null || isNaN(weight)) return '-';
  return `${weight.toFixed(1)} kg`;
}

export function calculateBMI(height: number, weight: number): number {
  if (height <= 0 || weight <= 0) return 0;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

export function formatBMI(bmi: number | undefined | null): string {
  if (bmi === undefined || bmi === null || isNaN(bmi) || bmi <= 0) return '-';
  return bmi.toFixed(1);
}

export type BMICategory = 'severely_underweight' | 'underweight' | 'normal' | 'overweight' | 'obese' | 'severely_obese';

export interface BMIRange {
  min: number;
  max: number;
  label: string;
  category: BMICategory;
}

export function getBMIRange(gender: Gender, ageMonths: number): BMIRange[] {
  if (ageMonths < 24) {
    return [
      { min: 0, max: 13, label: '重度偏瘦', category: 'severely_underweight' },
      { min: 13, max: 14.5, label: '偏瘦', category: 'underweight' },
      { min: 14.5, max: 18, label: '正常', category: 'normal' },
      { min: 18, max: 20, label: '超重', category: 'overweight' },
      { min: 20, max: 100, label: '肥胖', category: 'obese' },
    ];
  }

  if (ageMonths < 60) {
    return [
      { min: 0, max: 13.5, label: '重度偏瘦', category: 'severely_underweight' },
      { min: 13.5, max: 15, label: '偏瘦', category: 'underweight' },
      { min: 15, max: 19, label: '正常', category: 'normal' },
      { min: 19, max: 21.5, label: '超重', category: 'overweight' },
      { min: 21.5, max: 100, label: '肥胖', category: 'obese' },
    ];
  }

  if (ageMonths < 120) {
    return gender === 'male'
      ? [
          { min: 0, max: 14, label: '重度偏瘦', category: 'severely_underweight' },
          { min: 14, max: 15.5, label: '偏瘦', category: 'underweight' },
          { min: 15.5, max: 20.5, label: '正常', category: 'normal' },
          { min: 20.5, max: 24, label: '超重', category: 'overweight' },
          { min: 24, max: 100, label: '肥胖', category: 'obese' },
        ]
      : [
          { min: 0, max: 13.8, label: '重度偏瘦', category: 'severely_underweight' },
          { min: 13.8, max: 15.2, label: '偏瘦', category: 'underweight' },
          { min: 15.2, max: 20.8, label: '正常', category: 'normal' },
          { min: 20.8, max: 24.5, label: '超重', category: 'overweight' },
          { min: 24.5, max: 100, label: '肥胖', category: 'obese' },
        ];
  }

  return [
    { min: 0, max: 16, label: '重度偏瘦', category: 'severely_underweight' },
    { min: 16, max: 18.5, label: '偏瘦', category: 'underweight' },
    { min: 18.5, max: 24, label: '正常', category: 'normal' },
    { min: 24, max: 28, label: '超重', category: 'overweight' },
    { min: 28, max: 100, label: '肥胖', category: 'obese' },
  ];
}

export function formatBMIRange(gender: Gender, ageMonths: number): string {
  const ranges = getBMIRange(gender, ageMonths);
  const normal = ranges.find((r) => r.category === 'normal');
  if (!normal) return '-';
  return `${normal.min} - ${normal.max}`;
}

export function getBMICategory(bmi: number, gender: Gender, ageMonths: number): BMICategory {
  if (bmi <= 0) return 'normal';
  const ranges = getBMIRange(gender, ageMonths);
  for (const range of ranges) {
    if (bmi >= range.min && bmi < range.max) {
      return range.category;
    }
  }
  return 'normal';
}

export function getBMICategoryLabel(category: BMICategory): string {
  const map: Record<BMICategory, string> = {
    severely_underweight: '重度偏瘦',
    underweight: '偏瘦',
    normal: '正常',
    overweight: '超重',
    obese: '肥胖',
    severely_obese: '重度肥胖',
  };
  return map[category];
}

export function getBMICategoryColor(category: BMICategory): string {
  const map: Record<BMICategory, string> = {
    severely_underweight: '#ef4444',
    underweight: '#f97316',
    normal: '#22c55e',
    overweight: '#f97316',
    obese: '#ef4444',
    severely_obese: '#dc2626',
  };
  return map[category];
}

export function formatWater(ml: number | undefined | null): string {
  if (ml === undefined || ml === null || isNaN(ml)) return '-';
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)} L`;
  return `${ml} ml`;
}

export function percentFormat(value: number | undefined | null, total: number = 100): string {
  if (value === undefined || value === null || isNaN(value) || total <= 0) return '-';
  const percent = (value / total) * 100;
  return `${percent.toFixed(0)}%`;
}

export function formatTemperature(temp: number | undefined | null): string {
  if (temp === undefined || temp === null || isNaN(temp)) return '-';
  return `${temp.toFixed(1)} °C`;
}

export function formatSleepHours(hours: number | undefined | null): string {
  if (hours === undefined || hours === null || isNaN(hours)) return '-';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} 小时`;
  if (h === 0) return `${m} 分钟`;
  return `${h} 小时 ${m} 分钟`;
}

export function formatHeadCircumference(hc: number | undefined | null): string {
  if (hc === undefined || hc === null || isNaN(hc)) return '-';
  return `${hc.toFixed(1)} cm`;
}

export function formatCost(cost: number | undefined | null): string {
  if (cost === undefined || cost === null || isNaN(cost)) return '-';
  return `¥${cost.toFixed(2)}`;
}

export function formatHeightDiff(current: number, previous: number | undefined): string {
  if (previous === undefined || isNaN(previous)) return '-';
  const diff = current - previous;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)} cm`;
}

export function formatWeightDiff(current: number, previous: number | undefined): string {
  if (previous === undefined || isNaN(previous)) return '-';
  const diff = current - previous;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(2)} kg`;
}

export function getRecommendedWaterIntake(weight: number): number {
  if (weight <= 0) return 0;
  if (weight <= 10) return Math.round(weight * 100);
  if (weight <= 20) return Math.round(1000 + (weight - 10) * 50);
  if (weight <= 30) return Math.round(1500 + (weight - 20) * 35);
  return Math.round(1800 + (weight - 30) * 30);
}

export function getRecommendedSleepHours(ageMonths: number): { min: number; max: number } {
  if (ageMonths < 3) return { min: 14, max: 17 };
  if (ageMonths < 12) return { min: 12, max: 16 };
  if (ageMonths < 24) return { min: 11, max: 14 };
  if (ageMonths < 60) return { min: 10, max: 13 };
  if (ageMonths < 144) return { min: 9, max: 12 };
  return { min: 8, max: 10 };
}

export function formatRecommendedSleep(ageMonths: number): string {
  const { min, max } = getRecommendedSleepHours(ageMonths);
  return `${min}-${max} 小时`;
}
