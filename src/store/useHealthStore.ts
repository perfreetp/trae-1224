import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ChildProfile,
  HealthRecord,
  VaccineRecord,
  MedicineRecord,
  SymptomRecord,
  VisitRecord,
  Caregiver,
  Reminder,
  SymptomType,
  MentalState,
  CoughFrequency,
  SputumType,
  StoolType,
  DehydrationRisk,
  HeightWeightRecord,
  DentalRecord,
  VisionRecord,
  AllergyRecord,
  Vaccine,
  VaccineStatus,
  MedicineDetailRecord,
  SleepRecord,
  WaterRecord,
  MedicationReminder,
  ObservationRecord,
  Appointment,
  Gender,
  Relation,
  PermissionLevel,
} from '../types';
import {
  mockChildren,
  mockHealthRecords,
  mockVaccineRecords,
  mockMedicineRecords,
  mockSymptomRecords,
  mockVisitRecords,
  mockCaregivers,
  mockReminders,
} from './mockData';

export type {
  SymptomType,
  MentalState,
  CoughFrequency,
  SputumType,
  StoolType,
  DehydrationRisk,
  SymptomRecord,
  VisitRecord,
  ChildProfile as Child,
  Caregiver,
  HeightWeightRecord,
  DentalRecord,
  VisionRecord,
  AllergyRecord,
  Vaccine,
  MedicineRecord,
  MedicineDetailRecord,
  MedicineDetailRecord as MedicineRecordV2,
};

export type VisitCategory = 'all' | 'cold' | 'fever' | 'checkup' | 'other';
export type TimeRangeOption = '30d' | '90d' | '1y' | 'custom';

export interface ReminderSettings {
  vaccine: boolean;
  medication: boolean;
  visit: boolean;
  water: boolean;
  sleep: boolean;
}

export interface FeverDetail {
  temperature: number;
  measureTime: string;
  mentalState: MentalState;
  measures: string;
}

export interface CoughDetail {
  frequency: CoughFrequency;
  sputum: SputumType;
  worseAtNight: boolean;
  mentalState: MentalState;
  measures: string;
}

export interface DiarrheaDetail {
  timesPerDay: number;
  stoolType: StoolType;
  dehydrationRisk: DehydrationRisk;
  mentalState: MentalState;
  measures: string;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calcAge(birthday: string): number {
  const birth = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

const childrenExt: ChildProfile[] = mockChildren.map((c) => ({
  ...c,
  gender: (c.gender === 'male' ? 'boy' : 'girl') as ChildProfile['gender'],
  age: calcAge(c.birthday),
  avatar: c.gender === 'male' ? '👦' : '👧',
}));

const heightWeightRecords: HeightWeightRecord[] = mockHealthRecords
  .filter((r) => r.height && r.weight && r.childId === 'child-1')
  .map((r, i) => ({
    id: `hw-${i}`,
    date: r.date,
    height: r.height!,
    weight: r.weight!,
    headCircumference: r.headCircumference,
    bmi: r.bmi || Number((r.weight! / Math.pow(r.height! / 100, 2)).toFixed(1)),
    percentile: ['15th', '50th', '50th', '85th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th'][i] || '50th',
  }));

const dentalRecords: DentalRecord[] = [
  { id: 'd1', date: '2025-06-15', toothPosition: '右上第一乳磨牙', condition: '龋齿', reason: '吃甜食过多', doctorAdvice: '充填治疗，注意口腔卫生', notes: '已充填' },
  { id: 'd2', date: '2026-03-10', toothPosition: '左下乳中切牙', condition: '脱落', reason: '正常换牙', doctorAdvice: '观察恒牙萌出', notes: '恒牙已见萌出' },
];

const visionRecords: VisionRecord[] = [
  { id: 'v1', date: '2025-09-01', leftEye: '1.0', rightEye: '1.0', leftAstigmatism: '0', rightAstigmatism: '0' },
  { id: 'v2', date: '2026-03-15', leftEye: '0.8', rightEye: '1.0', leftAstigmatism: '-0.50', rightAstigmatism: '0' },
];

const allergyRecords: AllergyRecord[] = [
  { id: 'a1', allergen: '花生', severity: 'severe', reaction: '全身皮疹、呼吸困难', treatment: '肾上腺素注射、急诊就医', date: '2023-05-12' },
  { id: 'a2', allergen: '海鲜', severity: 'moderate', reaction: '口周红肿、瘙痒', treatment: '口服抗组胺药', date: '2024-08-20' },
  { id: 'a3', allergen: '牛奶', severity: 'mild', reaction: '轻微皮疹', treatment: '避免接触，观察', date: '2024-02-10' },
];

const replacedTeeth: string[] = ['左下乳中切牙', '右下乳中切牙'];

const sleepRecords: SleepRecord[] = [
  { id: 's1', date: new Date().toISOString().split('T')[0], duration: 9.5, quality: 'good', bedTime: '21:00', wakeTime: '07:30', naps: 0 },
  { id: 's2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], duration: 8.0, quality: 'normal', naps: 0 },
  { id: 's3', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], duration: 10.0, quality: 'good', naps: 1 },
];

const waterRecords: WaterRecord[] = [
  { id: 'w1', date: new Date().toISOString().split('T')[0], cups: 5, goal: 8 },
  { id: 'w2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], cups: 7, goal: 8 },
];

const medicationReminders: MedicationReminder[] = [
  { id: 'mr1', childId: 'child-1', name: '氯雷他定糖浆', dosage: '5ml', time: '21:00', taken: false, relatedRecordId: 'med-5' },
  { id: 'mr2', childId: 'child-1', name: '维生素D滴剂', dosage: '400IU', time: '08:00', taken: true, takenAt: '08:15', relatedRecordId: 'med-6' },
];

const vaccines: Vaccine[] = [
  { id: 'v1', name: '乙肝疫苗', dose: '第1剂', ageGroup: '出生时', status: 'completed', plannedDate: '2024-06-01', completedDate: '2024-06-01', site: '右上臂三角肌', manufacturer: '深圳康泰生物', batchNumber: '20240512-03', unit: '市妇幼保健院' },
  { id: 'v2', name: '卡介苗', dose: '第1剂', ageGroup: '出生时', status: 'completed', plannedDate: '2024-06-01', completedDate: '2024-06-01', site: '左上臂外侧三角肌', manufacturer: '上海生物制品', batchNumber: 'BCG20240508', unit: '市妇幼保健院' },
  { id: 'v3', name: '乙肝疫苗', dose: '第2剂', ageGroup: '1月龄', status: 'completed', plannedDate: '2024-07-01', completedDate: '2024-07-02', site: '右上臂三角肌', manufacturer: '深圳康泰生物', batchNumber: '20240615-01', unit: '社区卫生服务中心' },
  { id: 'v4', name: '脊灰灭活疫苗', dose: '第1剂', ageGroup: '2月龄', status: 'completed', plannedDate: '2024-08-01', completedDate: '2024-08-01', site: '右大腿前外侧', manufacturer: '北京科兴生物', batchNumber: 'IPV20240701', unit: '社区卫生服务中心' },
  { id: 'v5', name: '百日咳-白喉-破伤风疫苗', dose: '第1剂', ageGroup: '3月龄', status: 'completed', plannedDate: '2024-09-01', completedDate: '2024-09-01', site: '左大腿前外侧', manufacturer: '武汉生物制品', batchNumber: 'DPT20240820', unit: '社区卫生服务中心' },
  { id: 'v6', name: '脊灰灭活疫苗', dose: '第2剂', ageGroup: '3月龄', status: 'completed', plannedDate: '2024-09-01', completedDate: '2024-09-01', site: '右大腿前外侧', manufacturer: '北京科兴生物', batchNumber: 'IPV20240815', unit: '社区卫生服务中心' },
  { id: 'v7', name: '百日咳-白喉-破伤风疫苗', dose: '第2剂', ageGroup: '4月龄', status: 'overdue', plannedDate: '2024-10-01', site: '左大腿前外侧', manufacturer: '武汉生物制品', batchNumber: 'DPT20240910', unit: '社区卫生服务中心' },
  { id: 'v8', name: '脊灰减毒活疫苗', dose: '第1剂', ageGroup: '4月龄', status: 'overdue', plannedDate: '2024-10-01', site: '口服', manufacturer: '中国医学科学院', batchNumber: 'OPV20240905', unit: '社区卫生服务中心' },
  { id: 'v9', name: '百白破疫苗', dose: '第3剂', ageGroup: '5月龄', status: 'pending', plannedDate: '2024-11-01', site: '左大腿前外侧' },
  { id: 'v10', name: '乙肝疫苗', dose: '第3剂', ageGroup: '6月龄', status: 'pending', plannedDate: '2024-12-01', site: '右上臂三角肌' },
  { id: 'v11', name: 'A群流脑多糖疫苗', dose: '第1剂', ageGroup: '6月龄', status: 'pending', plannedDate: '2024-12-01', site: '上臂外侧三角肌' },
  { id: 'v12', name: '麻腮风疫苗', dose: '第1剂', ageGroup: '8月龄', status: 'pending', plannedDate: '2025-02-01', site: '上臂外侧三角肌' },
  { id: 'v13', name: '乙脑减毒活疫苗', dose: '第1剂', ageGroup: '8月龄', status: 'pending', plannedDate: '2025-02-01', site: '上臂外侧三角肌' },
  { id: 'v14', name: 'A群流脑多糖疫苗', dose: '第2剂', ageGroup: '9月龄', status: 'pending', plannedDate: '2025-03-01', site: '上臂外侧三角肌' },
  { id: 'v15', name: '甲肝减毒活疫苗', dose: '第1剂', ageGroup: '18月龄', status: 'pending', plannedDate: '2025-12-01', site: '上臂外侧三角肌' },
  { id: 'v16', name: '百白破疫苗', dose: '第4剂', ageGroup: '18月龄', status: 'pending', plannedDate: '2025-12-01', site: '上臂外侧三角肌' },
  { id: 'v17', name: '麻腮风疫苗', dose: '第2剂', ageGroup: '18月龄', status: 'pending', plannedDate: '2025-12-01', site: '上臂外侧三角肌' },
  { id: 'v18', name: '乙脑减毒活疫苗', dose: '第2剂', ageGroup: '2岁', status: 'pending', plannedDate: '2026-06-01', site: '上臂外侧三角肌' },
  { id: 'v19', name: 'A群C群流脑多糖疫苗', dose: '第1剂', ageGroup: '3岁', status: 'pending', plannedDate: '2027-06-01', site: '上臂外侧三角肌' },
  { id: 'v20', name: '脊灰减毒活疫苗', dose: '第2剂', ageGroup: '4岁', status: 'pending', plannedDate: '2028-06-01', site: '口服' },
  { id: 'v21', name: '白破疫苗', dose: '第1剂', ageGroup: '6岁', status: 'pending', plannedDate: '2030-06-01', site: '上臂外侧三角肌' },
  { id: 'v22', name: 'A群C群流脑多糖疫苗', dose: '第2剂', ageGroup: '6岁', status: 'pending', plannedDate: '2030-06-01', site: '上臂外侧三角肌' },
];

const observationRecords: ObservationRecord[] = [
  {
    vaccineId: 'v5',
    vaccineName: '百日咳-白喉-破伤风疫苗（第1剂）',
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    duration: 30,
    completed: false,
  },
];

const medicines: MedicineDetailRecord[] = [
  {
    id: 'm1',
    name: '阿莫西林颗粒',
    category: '抗生素',
    color: '#FF8A80',
    icon: 'Pill',
    dosage: '0.125g',
    frequency: '每日3次',
    totalDays: 7,
    takenDays: 3,
    nextDoseTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
    startDate: '2024-10-13',
    endDate: '2024-10-19',
    timePoints: [
      { time: '08:00', taken: true, takenAt: new Date().toISOString().split('T')[0] + ' 08:15' },
      { time: '14:00', taken: false },
      { time: '20:00', taken: false },
    ],
    notes: '饭后温水冲服，避免与牛奶同服',
    isActive: true,
  },
  {
    id: 'm2',
    name: '布洛芬混悬液',
    category: '解热镇痛',
    color: '#FFB74D',
    icon: 'Droplets',
    dosage: '4ml',
    frequency: '按需',
    totalDays: 3,
    takenDays: 2,
    nextDoseTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
    startDate: '2024-10-14',
    endDate: '2024-10-16',
    timePoints: [
      { time: '必要时', taken: true, takenAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16) },
    ],
    notes: '体温超过38.5度时服用，间隔至少6小时',
    isActive: true,
  },
  {
    id: 'm3',
    name: '小儿氨酚黄那敏颗粒',
    category: '感冒用药',
    color: '#64C2E3',
    icon: 'Thermometer',
    dosage: '1袋',
    frequency: '每日3次',
    totalDays: 5,
    takenDays: 5,
    nextDoseTime: '',
    startDate: '2024-10-08',
    endDate: '2024-10-12',
    timePoints: [
      { time: '08:00', taken: true, takenAt: '2024-10-12 08:05' },
      { time: '14:00', taken: true, takenAt: '2024-10-12 14:20' },
      { time: '20:00', taken: true, takenAt: '2024-10-12 20:10' },
    ],
    isActive: false,
  },
  {
    id: 'm4',
    name: '益生菌粉',
    category: '调节肠胃',
    color: '#81C784',
    icon: 'Leaf',
    dosage: '1袋',
    frequency: '每日2次',
    totalDays: 14,
    takenDays: 14,
    nextDoseTime: '',
    startDate: '2024-09-20',
    endDate: '2024-10-04',
    timePoints: [
      { time: '08:00', taken: true, takenAt: '2024-10-04 08:30' },
      { time: '20:00', taken: true, takenAt: '2024-10-04 20:15' },
    ],
    isActive: false,
  },
  {
    id: 'm5',
    name: '复方甘草合剂',
    category: '止咳化痰',
    color: '#BA68C8',
    icon: 'Wind',
    dosage: '5ml',
    frequency: '每日3次',
    totalDays: 5,
    takenDays: 5,
    nextDoseTime: '',
    startDate: '2024-09-10',
    endDate: '2024-09-14',
    timePoints: [
      { time: '08:00', taken: true, takenAt: '2024-09-14 08:00' },
      { time: '14:00', taken: true, takenAt: '2024-09-14 14:00' },
      { time: '20:00', taken: true, takenAt: '2024-09-14 20:00' },
    ],
    reactions: [{ symptoms: ['轻微嗜睡'], date: '2024-09-11', severity: '轻度', treatment: '多喝水，观察' }],
    isActive: false,
  },
];

const nowTs = Date.now();
const symptomRecordsExt: SymptomRecord[] = [
  {
    id: 'sym-r1',
    childId: 'child-1',
    date: new Date(nowTs - 2 * 3600000).toISOString().split('T')[0],
    symptoms: ['发烧'],
    severity: 'moderate',
    visitRequired: false,
    type: 'fever' as SymptomType,
    timestamp: nowTs - 2 * 3600000,
    active: true,
    fever: { temperature: 38.2, measureTime: new Date(nowTs - 2 * 3600000).toTimeString().slice(0, 5), mentalState: 'normal' as MentalState, measures: '温水擦浴，多饮水' },
  },
  {
    id: 'sym-r2',
    childId: 'child-1',
    date: new Date(nowTs - 5 * 3600000).toISOString().split('T')[0],
    symptoms: ['咳嗽'],
    severity: 'mild',
    visitRequired: false,
    type: 'cough' as SymptomType,
    timestamp: nowTs - 5 * 3600000,
    active: true,
    cough: { frequency: 'frequent' as CoughFrequency, sputum: 'white' as SputumType, worseAtNight: true, mentalState: 'normal' as MentalState, measures: '蜂蜜水，室内加湿' },
  },
  {
    id: 'sym-r3',
    childId: 'child-1',
    date: new Date(nowTs - 86400000 * 3).toISOString().split('T')[0],
    symptoms: ['发烧'],
    severity: 'moderate',
    visitRequired: false,
    type: 'fever' as SymptomType,
    timestamp: nowTs - 86400000 * 3,
    active: false,
    resolved: true,
    fever: { temperature: 39.1, measureTime: '02:30', mentalState: 'bad' as MentalState, measures: '布洛芬退热' },
  },
];

const visitRecordsExt: VisitRecord[] = mockVisitRecords.map((v, i) => ({
  ...v,
  category: (['checkup', 'cold', 'checkup', 'cold', 'fever', 'checkup'] as const)[i] as VisitRecord['category'],
  date: v.visitDate,
  expense: v.cost,
  chiefComplaint: v.symptoms.join('、'),
  images: i < 3 ? ['img1', 'img2'] : [],
  prescriptions: Array.isArray(v.prescriptions)
    ? v.prescriptions.map((p) =>
        typeof p === 'string' ? { name: p, dosage: '按说明', frequency: '每日3次' } : p
      )
    : [],
}));

const remindersExt: Reminder[] = mockReminders.map((r) => ({
  ...r,
  description: r.note,
}));

interface HealthState {
  children: ChildProfile[];
  healthRecords: HealthRecord[];
  vaccineRecords: VaccineRecord[];
  medicineRecords: MedicineRecord[];
  symptomRecords: SymptomRecord[];
  visitRecords: VisitRecord[];
  caregivers: Caregiver[];
  reminders: Reminder[];
  selectedChildId: string | null;
  activeChildId: string | null;
  reminderSettings: ReminderSettings;
  currentChildIndex: number;
  heightWeightRecords: HeightWeightRecord[];
  dentalRecords: DentalRecord[];
  visionRecords: VisionRecord[];
  allergyRecords: AllergyRecord[];
  replacedTeeth: string[];
  sleepRecords: SleepRecord[];
  waterRecords: WaterRecord[];
  medicationReminders: MedicationReminder[];
  vaccines: Vaccine[];
  observationRecords: ObservationRecord[];
  appointments: Appointment[];
  vaccineReminders: string[];
  medicines: MedicineDetailRecord[];

  setSelectedChildId: (id: string | null) => void;
  setActiveChild: (id: string) => void;
  setCurrentChildIndex: (i: number) => void;
  addChild: (child: Partial<ChildProfile> & { name: string }) => ChildProfile;
  updateChild: (id: string, updates: Partial<ChildProfile>) => void;
  deleteChild: (id: string) => void;
  getChildById: (id: string) => ChildProfile | undefined;

  addHeightWeightRecord: (r: HeightWeightRecord) => void;
  addDentalRecord: (r: DentalRecord) => void;
  addVisionRecord: (r: VisionRecord) => void;
  addAllergyRecord: (r: AllergyRecord) => void;
  markToothReplaced: (tooth: string) => void;
  addWaterCup: () => void;
  toggleMedication: (id: string) => void;

  addHealthRecord: (record: Omit<HealthRecord, 'id' | 'createdAt'>) => HealthRecord;
  updateHealthRecord: (id: string, updates: Partial<HealthRecord>) => void;
  deleteHealthRecord: (id: string) => void;
  getHealthRecordsByChildId: (childId: string) => HealthRecord[];
  getLatestHealthRecord: (childId: string) => HealthRecord | undefined;

  addVaccineRecord: (record: Omit<VaccineRecord, 'id'>) => VaccineRecord;
  updateVaccineRecord: (id: string, updates: Partial<VaccineRecord>) => void;
  deleteVaccineRecord: (id: string) => void;
  getVaccineRecordsByChildId: (childId: string) => VaccineRecord[];
  setVaccineStatus: (id: string, status: VaccineStatus) => void;
  completeObservation: (vaccineId: string, reaction: string[]) => void;
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => void;
  setReminder: (vaccineId: string) => void;

  addMedicineRecord: (record: Omit<MedicineRecord, 'id'>) => MedicineRecord;
  updateMedicineRecord: (id: string, updates: Partial<MedicineRecord>) => void;
  deleteMedicineRecord: (id: string) => void;
  getMedicineRecordsByChildId: (childId: string) => MedicineRecord[];
  getActiveMedicines: (childId: string) => MedicineRecord[];
  markMedicineTaken: (medicineId: string, timeIndex: number) => void;
  addMedicine: (m: Omit<MedicineDetailRecord, 'id'>) => void;
  addReaction: (medicineId: string, reaction: MedicineDetailRecord['reactions'][0]) => void;

  addSymptomRecord: (record: Omit<SymptomRecord, 'id'>) => SymptomRecord;
  updateSymptomRecord: (id: string, updates: Partial<SymptomRecord>) => void;
  deleteSymptomRecord: (id: string) => void;
  getSymptomRecordsByChildId: (childId: string) => SymptomRecord[];
  resolveSymptom: (id: string, improved?: boolean) => void;

  addVisitRecord: (record: Omit<VisitRecord, 'id'>) => VisitRecord;
  updateVisitRecord: (id: string, updates: Partial<VisitRecord>) => void;
  deleteVisitRecord: (id: string) => void;
  getVisitRecordsByChildId: (childId: string) => VisitRecord[];

  addCaregiver: (caregiver: Partial<Caregiver> & { name: string; phone: string }) => Caregiver;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  deleteCaregiver: (id: string) => void;
  removeCaregiver: (id: string) => void;

  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => Reminder;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  getRemindersByChildId: (childId: string) => Reminder[];
  getActiveReminders: () => Reminder[];
  completeReminder: (id: string) => void;
  toggleReminder: (id: string) => void;

  toggleReminderSetting: (key: keyof ReminderSettings) => void;
  resetStore: () => void;
}

const initialState = {
  children: childrenExt,
  healthRecords: mockHealthRecords,
  vaccineRecords: mockVaccineRecords,
  medicineRecords: mockMedicineRecords,
  symptomRecords: symptomRecordsExt,
  visitRecords: visitRecordsExt,
  caregivers: mockCaregivers,
  reminders: remindersExt,
  selectedChildId: childrenExt.length > 0 ? childrenExt[0].id : null,
  activeChildId: childrenExt.length > 0 ? childrenExt[0].id : null,
  reminderSettings: {
    vaccine: true,
    medication: true,
    visit: true,
    water: false,
    sleep: true,
  },
  currentChildIndex: 0,
  heightWeightRecords,
  dentalRecords,
  visionRecords,
  allergyRecords,
  replacedTeeth,
  sleepRecords,
  waterRecords,
  medicationReminders,
  vaccines,
  observationRecords,
  appointments: [],
  vaccineReminders: [],
  medicines,
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedChildId: (id) => set({ selectedChildId: id, activeChildId: id }),
      setActiveChild: (id) => {
        const idx = get().children.findIndex((c) => c.id === id);
        set({ selectedChildId: id, activeChildId: id, currentChildIndex: idx >= 0 ? idx : 0 });
      },
      setCurrentChildIndex: (i) => {
        const id = get().children[i]?.id ?? null;
        set({ currentChildIndex: i, selectedChildId: id, activeChildId: id });
      },

      addChild: (child) => {
        const now = new Date().toISOString();
        const birthday = child.birthday || now.split('T')[0];
        const newChild: ChildProfile = {
          gender: 'boy' as Gender,
          birthday,
          createdAt: now,
          updatedAt: now,
          ...child,
          id: generateId('child'),
          age: child.birthday ? calcAge(child.birthday) : 0,
        } as ChildProfile;
        set((state) => ({
          children: [...state.children, newChild],
          selectedChildId: state.selectedChildId ?? newChild.id,
          activeChildId: state.activeChildId ?? newChild.id,
        }));
        return newChild;
      },

      updateChild: (id, updates) =>
        set((state) => ({
          children: state.children.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteChild: (id) =>
        set((state) => ({
          children: state.children.filter((c) => c.id !== id),
          healthRecords: state.healthRecords.filter((r) => r.childId !== id),
          vaccineRecords: state.vaccineRecords.filter((r) => r.childId !== id),
          medicineRecords: state.medicineRecords.filter((r) => r.childId !== id),
          symptomRecords: state.symptomRecords.filter((r) => r.childId !== id),
          visitRecords: state.visitRecords.filter((r) => r.childId !== id),
          reminders: state.reminders.filter((r) => r.childId !== id),
          selectedChildId:
            state.selectedChildId === id
              ? state.children.filter((c) => c.id !== id)[0]?.id ?? null
              : state.selectedChildId,
        })),

      getChildById: (id) => get().children.find((c) => c.id === id),

      addHeightWeightRecord: (r) => set((s) => ({ heightWeightRecords: [...s.heightWeightRecords, r] })),
      addDentalRecord: (r) => set((s) => ({ dentalRecords: [...s.dentalRecords, r] })),
      addVisionRecord: (r) => set((s) => ({ visionRecords: [...s.visionRecords, r] })),
      addAllergyRecord: (r) => set((s) => ({ allergyRecords: [...s.allergyRecords, r] })),
      markToothReplaced: (tooth) =>
        set((s) => ({
          replacedTeeth: s.replacedTeeth.includes(tooth) ? s.replacedTeeth : [...s.replacedTeeth, tooth],
        })),
      addWaterCup: () =>
        set((s) => {
          const [today, ...rest] = s.waterRecords;
          if (!today) return s;
          const updated = { ...today, cups: Math.min(today.cups + 1, today.goal) };
          return { waterRecords: [updated, ...rest] };
        }),
      toggleMedication: (id) =>
        set((s) => ({
          medicationReminders: s.medicationReminders.map((m) =>
            m.id === id ? { ...m, taken: !m.taken, takenAt: !m.taken ? new Date().toISOString() : undefined } : m
          ),
        })),

      addHealthRecord: (record) => {
        const newRecord: HealthRecord = {
          ...record,
          id: generateId('hr'),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          healthRecords: [...state.healthRecords, newRecord],
        }));
        return newRecord;
      },

      updateHealthRecord: (id, updates) =>
        set((state) => ({
          healthRecords: state.healthRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteHealthRecord: (id) =>
        set((state) => ({
          healthRecords: state.healthRecords.filter((r) => r.id !== id),
        })),

      getHealthRecordsByChildId: (childId) =>
        get()
          .healthRecords.filter((r) => r.childId === childId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

      getLatestHealthRecord: (childId) => {
        const records = get().getHealthRecordsByChildId(childId);
        return records[0];
      },

      addVaccineRecord: (record) => {
        const newRecord: VaccineRecord = {
          ...record,
          id: generateId('vr'),
        };
        set((state) => ({
          vaccineRecords: [...state.vaccineRecords, newRecord],
        }));
        return newRecord;
      },

      updateVaccineRecord: (id, updates) =>
        set((state) => ({
          vaccineRecords: state.vaccineRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteVaccineRecord: (id) =>
        set((state) => ({
          vaccineRecords: state.vaccineRecords.filter((r) => r.id !== id),
        })),

      getVaccineRecordsByChildId: (childId) =>
        get()
          .vaccineRecords.filter((r) => r.childId === childId)
          .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),

      setVaccineStatus: (id, status) =>
        set((s) => ({
          vaccines: s.vaccines.map((v) =>
            v.id === id
              ? { ...v, status, completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : v.completedDate }
              : v
          ),
        })),
      completeObservation: (vaccineId, reaction) =>
        set((s) => ({
          observationRecords: s.observationRecords.map((r) =>
            r.vaccineId === vaccineId ? { ...r, completed: true, reaction } : r
          ),
        })),
      addAppointment: (appointment) =>
        set((state) => ({
          appointments: [
            ...state.appointments,
            { ...appointment, id: generateId('apt'), createdAt: new Date().toISOString() },
          ],
          vaccines: state.vaccines.map((v) =>
            v.id === appointment.vaccineId
              ? { ...v, status: 'scheduled' as VaccineStatus, appointmentId: generateId('apt') }
              : v
          ),
        })),
      setReminder: (vaccineId) =>
        set((state) => ({
          vaccineReminders: state.vaccineReminders.includes(vaccineId)
            ? state.vaccineReminders
            : [...state.vaccineReminders, vaccineId],
        })),

      addMedicineRecord: (record) => {
        const newRecord: MedicineRecord = {
          ...record,
          id: generateId('med'),
        };
        set((state) => ({
          medicineRecords: [...state.medicineRecords, newRecord],
        }));
        return newRecord;
      },

      updateMedicineRecord: (id, updates) =>
        set((state) => ({
          medicineRecords: state.medicineRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteMedicineRecord: (id) =>
        set((state) => ({
          medicineRecords: state.medicineRecords.filter((r) => r.id !== id),
        })),

      getMedicineRecordsByChildId: (childId) =>
        get()
          .medicineRecords.filter((r) => r.childId === childId)
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),

      getActiveMedicines: (childId) =>
        get().medicineRecords.filter((r) => r.childId === childId && r.status === 'active'),

      markMedicineTaken: (medicineId, timeIndex) =>
        set((state) => ({
          medicines: state.medicines.map((m) => {
            if (m.id !== medicineId) return m;
            const newTP = [...m.timePoints];
            if (!newTP[timeIndex]) return m;
            newTP[timeIndex] = { ...newTP[timeIndex], taken: true, takenAt: new Date().toISOString() };
            const allTaken = newTP.every((t) => t.taken);
            const newDays = allTaken ? m.takenDays + 1 : m.takenDays;
            return { ...m, timePoints: newTP, takenDays: newDays };
          }),
        })),
      addMedicine: (medicine) =>
        set((state) => ({
          medicines: [...state.medicines, { ...medicine, id: generateId('med') }],
        })),
      addReaction: (medicineId, reaction) =>
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.id === medicineId
              ? { ...m, reactions: [...(m.reactions || []), reaction] }
              : m
          ),
        })),

      addSymptomRecord: (record) => {
        const newRecord: SymptomRecord = {
          ...record,
          id: generateId('sym'),
        } as SymptomRecord;
        set((state) => ({
          symptomRecords: [...state.symptomRecords, newRecord],
        }));
        return newRecord;
      },

      updateSymptomRecord: (id, updates) =>
        set((state) => ({
          symptomRecords: state.symptomRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteSymptomRecord: (id) =>
        set((state) => ({
          symptomRecords: state.symptomRecords.filter((r) => r.id !== id),
        })),

      getSymptomRecordsByChildId: (childId) =>
        get()
          .symptomRecords.filter((r) => r.childId === childId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

      resolveSymptom: (id) =>
        set((state) => ({
          symptomRecords: state.symptomRecords.map((r) =>
            r.id === id ? { ...r, active: false, resolved: true } : r
          ),
        })),

      addVisitRecord: (record) => {
        const newRecord: VisitRecord = {
          ...record,
          id: generateId('visit'),
        };
        set((state) => ({
          visitRecords: [{ ...newRecord, date: newRecord.visitDate }, ...state.visitRecords],
        }));
        return newRecord;
      },

      updateVisitRecord: (id, updates) =>
        set((state) => ({
          visitRecords: state.visitRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteVisitRecord: (id) =>
        set((state) => ({
          visitRecords: state.visitRecords.filter((r) => r.id !== id),
        })),

      getVisitRecordsByChildId: (childId) =>
        get()
          .visitRecords.filter((r) => r.childId === childId)
          .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()),

      addCaregiver: (caregiver) => {
        const resolvedPerm: PermissionLevel = caregiver.permission ||
          (caregiver.permissions?.includes('admin') ? 'admin' : caregiver.permissions?.includes('edit') ? 'edit' : 'view') ||
          'view';
        const newCaregiver: Caregiver = {
          relation: 'other' as Relation,
          createdAt: new Date().toISOString(),
          ...caregiver,
          permission: resolvedPerm,
          id: generateId('cg'),
        } as Caregiver;
        set((state) => ({
          caregivers: [...state.caregivers, newCaregiver],
        }));
        return newCaregiver;
      },

      updateCaregiver: (id, updates) =>
        set((state) => ({
          caregivers: state.caregivers.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCaregiver: (id) =>
        set((state) => ({
          caregivers: state.caregivers.filter((c) => c.id !== id),
        })),
      removeCaregiver: (id) =>
        set((state) => ({
          caregivers: state.caregivers.filter((c) => c.id !== id),
        })),

      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: generateId('rm'),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));
        return newReminder;
      },

      updateReminder: (id, updates) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),

      getRemindersByChildId: (childId) =>
        get()
          .reminders.filter((r) => r.childId === childId)
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`).getTime();
            const dateB = new Date(`${b.date}T${b.time}`).getTime();
            return dateA - dateB;
          }),

      getActiveReminders: () =>
        get()
          .reminders.filter((r) => r.status === 'active')
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`).getTime();
            const dateB = new Date(`${b.date}T${b.time}`).getTime();
            return dateA - dateB;
          }),

      completeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, status: 'completed' as const } : r
          ),
        })),
      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, status: (r.status === 'active' ? 'completed' : 'active') as Reminder['status'] } : r
          ),
        })),

      toggleReminderSetting: (key) =>
        set((state) => ({
          reminderSettings: {
            ...state.reminderSettings,
            [key]: !state.reminderSettings[key],
          },
        })),

      resetStore: () => set(initialState),
    }),
    {
      name: 'child-health-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
