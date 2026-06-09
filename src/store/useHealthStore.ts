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
import { VACCINE_SCHEDULE } from '../utils/constants';
import { addMonths, formatDate } from '../utils/dateUtils';

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

function generateVaccinesForChild(childId: string, birthday: string): Vaccine[] {
  const vaccines: Vaccine[] = [];
  const birthDate = new Date(birthday);
  const today = new Date();

  VACCINE_SCHEDULE.forEach((vaccine, index) => {
    const plannedDate = addMonths(birthDate, vaccine.ageMonthsMin);
    const plannedDateStr = formatDate(plannedDate);
    const isPast = plannedDate.getTime() < today.getTime();
    const isOverdue = isPast && (today.getTime() - plannedDate.getTime()) > 30 * 24 * 60 * 60 * 1000;
    const isContraindicated = vaccine.code === 'MCV1' && childId === 'child-2';

    let status: VaccineStatus = 'pending';
    let completedDate: string | undefined;
    let manufacturer: string | undefined;
    let batchNumber: string | undefined;
    let site: string | undefined;
    let unit: string | undefined;

    if (isContraindicated) {
      status = 'contraindicated';
    } else if (isPast) {
      if (isOverdue && Math.random() > 0.6) {
        status = 'overdue';
      } else {
        status = 'completed';
        completedDate = formatDate(addMonths(birthDate, vaccine.ageMonthsMin));
        manufacturer = ['国药集团', '科兴', '长春长生', '武汉生物'][index % 4];
        batchNumber = `B${vaccine.code}20${1000 + (index * 137) % 9000}`;
        site = ['左上臂', '右上臂', '左大腿', '右大腿'][index % 4];
        unit = '社区卫生服务中心';
      }
    }

    vaccines.push({
      id: `v-${childId}-${index + 1}`,
      childId,
      name: vaccine.name,
      dose: `第${vaccine.doses}剂`,
      ageGroup: vaccine.scheduledAge,
      status,
      plannedDate: plannedDateStr,
      completedDate,
      site,
      manufacturer,
      batchNumber,
      unit,
    });
  });

  return vaccines;
}

function generateHeightWeightRecordsForChild(childId: string): HeightWeightRecord[] {
  const records: HeightWeightRecord[] = mockHealthRecords
    .filter((r) => r.height && r.weight && r.childId === childId)
    .map((r, i) => ({
      id: `hw-${childId}-${i}`,
      childId,
      date: r.date,
      height: r.height!,
      weight: r.weight!,
      headCircumference: r.headCircumference,
      bmi: r.bmi || Number((r.weight! / Math.pow(r.height! / 100, 2)).toFixed(1)),
      percentile: ['15th', '50th', '50th', '85th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th', '50th'][i] || '50th',
    }));
  return records;
}

const childrenExt: ChildProfile[] = mockChildren.map((c) => ({
  ...c,
  age: calcAge(c.birthday),
}));

const heightWeightRecordsByChild: Record<string, HeightWeightRecord[]> = {
  'child-1': generateHeightWeightRecordsForChild('child-1'),
  'child-2': generateHeightWeightRecordsForChild('child-2'),
};

const dentalRecordsByChild: Record<string, DentalRecord[]> = {
  'child-1': [
    { id: 'd1', childId: 'child-1', date: '2025-06-15', toothPosition: '右上第一乳磨牙', condition: '龋齿', reason: '吃甜食过多', doctorAdvice: '充填治疗，注意口腔卫生', notes: '已充填' },
    { id: 'd2', childId: 'child-1', date: '2026-03-10', toothPosition: '左下乳中切牙', condition: '脱落', reason: '正常换牙', doctorAdvice: '观察恒牙萌出', notes: '恒牙已见萌出' },
  ],
  'child-2': [
    { id: 'd3', childId: 'child-2', date: '2026-02-20', toothPosition: '乳磨牙窝沟', condition: '检查', reason: '常规检查', doctorAdvice: '窝沟封闭，早晚刷牙', notes: '已做窝沟封闭' },
  ],
};

const visionRecordsByChild: Record<string, VisionRecord[]> = {
  'child-1': [
    { id: 'v1', childId: 'child-1', date: '2025-09-01', leftEye: '1.0', rightEye: '1.0', leftAstigmatism: '0', rightAstigmatism: '0' },
    { id: 'v2', childId: 'child-1', date: '2026-03-15', leftEye: '0.8', rightEye: '1.0', leftAstigmatism: '-0.50', rightAstigmatism: '0' },
  ],
  'child-2': [
    { id: 'v3', childId: 'child-2', date: '2026-05-20', leftEye: '0.6', rightEye: '0.6', leftAstigmatism: '0', rightAstigmatism: '0' },
  ],
};

const allergyRecordsByChild: Record<string, AllergyRecord[]> = {
  'child-1': [
    { id: 'a1', childId: 'child-1', allergen: '花生', severity: 'severe', reaction: '全身皮疹、呼吸困难', treatment: '肾上腺素注射、急诊就医', date: '2023-05-12' },
    { id: 'a2', childId: 'child-1', allergen: '海鲜', severity: 'moderate', reaction: '口周红肿、瘙痒', treatment: '口服抗组胺药', date: '2024-08-20' },
  ],
  'child-2': [
    { id: 'a3', childId: 'child-2', allergen: '牛奶', severity: 'mild', reaction: '轻微皮疹', treatment: '避免接触，观察', date: '2024-02-10' },
  ],
};

const replacedTeethByChild: Record<string, string[]> = {
  'child-1': ['左下乳中切牙', '右下乳中切牙'],
  'child-2': [],
};

const sleepRecordsByChild: Record<string, SleepRecord[]> = {
  'child-1': [
    { id: 's1-c1', date: new Date().toISOString().split('T')[0], duration: 9.5, quality: 'good', bedTime: '21:00', wakeTime: '07:30', naps: 0 },
    { id: 's2-c1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], duration: 8.0, quality: 'normal', naps: 0 },
    { id: 's3-c1', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], duration: 10.0, quality: 'good', naps: 1 },
  ],
  'child-2': [
    { id: 's1-c2', date: new Date().toISOString().split('T')[0], duration: 11.5, quality: 'good', bedTime: '20:00', wakeTime: '07:30', naps: 1 },
    { id: 's2-c2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], duration: 11.0, quality: 'good', naps: 1 },
  ],
};

const waterRecordsByChild: Record<string, WaterRecord[]> = {
  'child-1': [
    { id: 'w1-c1', date: new Date().toISOString().split('T')[0], cups: 5, goal: 8 },
    { id: 'w2-c1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], cups: 7, goal: 8 },
  ],
  'child-2': [
    { id: 'w1-c2', date: new Date().toISOString().split('T')[0], cups: 3, goal: 6 },
    { id: 'w2-c2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], cups: 5, goal: 6 },
  ],
};

const medicationReminders: MedicationReminder[] = [
  { id: 'mr1', childId: 'child-1', name: '氯雷他定糖浆', dosage: '5ml', time: '21:00', taken: false, relatedRecordId: 'med-5' },
  { id: 'mr2', childId: 'child-1', name: '维生素D滴剂', dosage: '400IU', time: '08:00', taken: true, takenAt: '08:15', relatedRecordId: 'med-6' },
];

const vaccinesByChild: Record<string, Vaccine[]> = {
  'child-1': generateVaccinesForChild('child-1', '2021-03-15'),
  'child-2': generateVaccinesForChild('child-2', '2023-08-20'),
};

const observationRecords: ObservationRecord[] = [
  {
    childId: 'child-1',
    vaccineId: 'v-child-1-5',
    vaccineName: '百日咳-白喉-破伤风疫苗（第1剂）',
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    duration: 30,
    completed: false,
  },
];

const medicinesByChild: Record<string, MedicineDetailRecord[]> = {
  'child-1': [
    {
      id: 'm1-c1',
      childId: 'child-1',
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
      id: 'm2-c1',
      childId: 'child-1',
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
  ],
  'child-2': [
    {
      id: 'm1-c2',
      childId: 'child-2',
      name: '氯雷他定糖浆',
      category: '抗过敏',
      color: '#BA68C8',
      icon: 'Wind',
      dosage: '5ml',
      frequency: '每日1次',
      totalDays: 30,
      takenDays: 20,
      nextDoseTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
      startDate: '2026-04-10',
      endDate: '2026-05-10',
      timePoints: [
        { time: '21:00', taken: false },
      ],
      notes: '睡前服用，外出戴口罩',
      isActive: true,
    },
    {
      id: 'm2-c2',
      childId: 'child-2',
      name: '维生素D滴剂',
      category: '营养补充',
      color: '#81C784',
      icon: 'Leaf',
      dosage: '400IU',
      frequency: '每日1次',
      totalDays: 365,
      takenDays: 200,
      nextDoseTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 16),
      startDate: '2023-09-01',
      endDate: '2024-09-01',
      timePoints: [
        { time: '08:00', taken: true, takenAt: new Date().toISOString().split('T')[0] + ' 08:30' },
      ],
      notes: '早餐后服用，冬季适当增加日照',
      isActive: true,
    },
  ],
};

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
  heightWeightRecordsByChild: Record<string, HeightWeightRecord[]>;
  dentalRecordsByChild: Record<string, DentalRecord[]>;
  visionRecordsByChild: Record<string, VisionRecord[]>;
  allergyRecordsByChild: Record<string, AllergyRecord[]>;
  replacedTeethByChild: Record<string, string[]>;
  sleepRecordsByChild: Record<string, SleepRecord[]>;
  waterRecordsByChild: Record<string, WaterRecord[]>;
  medicationReminders: MedicationReminder[];
  vaccinesByChild: Record<string, Vaccine[]>;
  observationRecords: ObservationRecord[];
  appointments: Appointment[];
  vaccineReminders: string[];
  medicinesByChild: Record<string, MedicineDetailRecord[]>;
  vaccines: Vaccine[];
  medicines: MedicineDetailRecord[];

  setSelectedChildId: (id: string | null) => void;
  setActiveChild: (id: string) => void;
  setCurrentChildIndex: (i: number) => void;
  addChild: (child: Partial<ChildProfile> & { name: string }) => ChildProfile;
  updateChild: (id: string, updates: Partial<ChildProfile>) => void;
  deleteChild: (id: string) => void;
  getChildById: (id: string) => ChildProfile | undefined;

  addHeightWeightRecord: (r: Omit<HeightWeightRecord, 'id' | 'childId'>) => void;
  addDentalRecord: (childIdOrRecord: string | Omit<DentalRecord, 'id' | 'childId'>, maybeRecord?: Omit<DentalRecord, 'id' | 'childId'>) => void;
  addVisionRecord: (childIdOrRecord: string | Omit<VisionRecord, 'id' | 'childId'>, maybeRecord?: Omit<VisionRecord, 'id' | 'childId'>) => void;
  addAllergyRecord: (childIdOrRecord: string | Omit<AllergyRecord, 'id' | 'childId'>, maybeRecord?: Omit<AllergyRecord, 'id' | 'childId'>) => void;
  markToothReplaced: (childIdOrTooth: string, maybeTooth?: string) => void;
  addWaterCup: (childId?: string) => void;
  getDentalRecords: (childId: string) => DentalRecord[];
  getVisionRecords: (childId: string) => VisionRecord[];
  getAllergyRecords: (childId: string) => AllergyRecord[];
  getReplacedTeeth: (childId: string) => string[];
  getWaterRecords: (childId: string) => WaterRecord[];
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
  addVaccine: (v: Omit<Vaccine, 'id' | 'childId'>) => void;
  setVaccineStatus: (id: string, status: VaccineStatus) => void;
  completeObservation: (vaccineId: string, reaction: string[]) => void;
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt' | 'childId'>) => void;
  setReminder: (vaccineId: string) => void;

  addMedicineRecord: (record: Omit<MedicineRecord, 'id'>) => MedicineRecord;
  updateMedicineRecord: (id: string, updates: Partial<MedicineRecord>) => void;
  deleteMedicineRecord: (id: string) => void;
  getMedicineRecordsByChildId: (childId: string) => MedicineRecord[];
  getActiveMedicines: (childId: string) => MedicineRecord[];
  markMedicineTaken: (medicineId: string, timeIndex: number) => void;
  addMedicine: (m: Omit<MedicineDetailRecord, 'id' | 'childId'>) => void;
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
  heightWeightRecordsByChild,
  dentalRecordsByChild,
  visionRecordsByChild,
  allergyRecordsByChild,
  replacedTeethByChild,
  sleepRecordsByChild,
  waterRecordsByChild,
  medicationReminders,
  vaccinesByChild,
  observationRecords,
  appointments: [],
  vaccineReminders: [],
  medicinesByChild,
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      get vaccines() {
        const state = get();
        const childId = state.activeChildId || state.selectedChildId || state.children[0]?.id;
        return childId ? state.vaccinesByChild[childId] || [] : [];
      },

      get medicines() {
        const state = get();
        const childId = state.activeChildId || state.selectedChildId || state.children[0]?.id;
        return childId ? state.medicinesByChild[childId] || [] : [];
      },

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
        const newChildId = generateId('child');
        const newChild: ChildProfile = {
          gender: 'boy' as Gender,
          birthday,
          createdAt: now,
          updatedAt: now,
          ...child,
          id: newChildId,
          age: child.birthday ? calcAge(child.birthday) : 0,
        } as ChildProfile;
        const newVaccines = generateVaccinesForChild(newChildId, birthday);
        set((state) => ({
          children: [...state.children, newChild],
          selectedChildId: state.selectedChildId ?? newChild.id,
          activeChildId: state.activeChildId ?? newChild.id,
          heightWeightRecordsByChild: { ...state.heightWeightRecordsByChild, [newChildId]: [] },
          dentalRecordsByChild: { ...state.dentalRecordsByChild, [newChildId]: [] },
          visionRecordsByChild: { ...state.visionRecordsByChild, [newChildId]: [] },
          allergyRecordsByChild: { ...state.allergyRecordsByChild, [newChildId]: [] },
          replacedTeethByChild: { ...state.replacedTeethByChild, [newChildId]: [] },
          sleepRecordsByChild: { ...state.sleepRecordsByChild, [newChildId]: [] },
          waterRecordsByChild: { ...state.waterRecordsByChild, [newChildId]: [] },
          vaccinesByChild: { ...state.vaccinesByChild, [newChildId]: newVaccines },
          medicinesByChild: { ...state.medicinesByChild, [newChildId]: [] },
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
        set((state) => {
          const { [id]: _, ...restHw } = state.heightWeightRecordsByChild;
          const { [id]: __, ...restDental } = state.dentalRecordsByChild;
          const { [id]: ___, ...restVision } = state.visionRecordsByChild;
          const { [id]: ____, ...restAllergy } = state.allergyRecordsByChild;
          const { [id]: _____, ...restTeeth } = state.replacedTeethByChild;
          const { [id]: ______, ...restSleep } = state.sleepRecordsByChild;
          const { [id]: _______, ...restWater } = state.waterRecordsByChild;
          const { [id]: ________, ...restVacc } = state.vaccinesByChild;
          const { [id]: _________, ...restMed } = state.medicinesByChild;
          const remainingChildren = state.children.filter((c) => c.id !== id);
          return {
            children: remainingChildren,
            healthRecords: state.healthRecords.filter((r) => r.childId !== id),
            vaccineRecords: state.vaccineRecords.filter((r) => r.childId !== id),
            medicineRecords: state.medicineRecords.filter((r) => r.childId !== id),
            symptomRecords: state.symptomRecords.filter((r) => r.childId !== id),
            visitRecords: state.visitRecords.filter((r) => r.childId !== id),
            reminders: state.reminders.filter((r) => r.childId !== id),
            medicationReminders: state.medicationReminders.filter((r) => r.childId !== id),
            observationRecords: state.observationRecords.filter((r) => r.childId !== id),
            appointments: state.appointments.filter((r) => r.childId !== id),
            heightWeightRecordsByChild: restHw,
            dentalRecordsByChild: restDental,
            visionRecordsByChild: restVision,
            allergyRecordsByChild: restAllergy,
            replacedTeethByChild: restTeeth,
            sleepRecordsByChild: restSleep,
            waterRecordsByChild: restWater,
            vaccinesByChild: restVacc,
            medicinesByChild: restMed,
            selectedChildId:
              state.selectedChildId === id
                ? remainingChildren[0]?.id ?? null
                : state.selectedChildId,
            activeChildId:
              state.activeChildId === id
                ? remainingChildren[0]?.id ?? null
                : state.activeChildId,
            currentChildIndex: 0,
          };
        }),

      getChildById: (id) => get().children.find((c) => c.id === id),

      getDentalRecords: (childId) => get().dentalRecordsByChild[childId] || [],
      getVisionRecords: (childId) => get().visionRecordsByChild[childId] || [],
      getAllergyRecords: (childId) => get().allergyRecordsByChild[childId] || [],
      getReplacedTeeth: (childId) => get().replacedTeethByChild[childId] || [],
      getWaterRecords: (childId) => get().waterRecordsByChild[childId] || [],

      addHeightWeightRecord: (r) =>
        set((s) => {
          const childId = s.activeChildId!;
          const newRecord: HeightWeightRecord = { ...(r as object), id: generateId('hw'), childId } as HeightWeightRecord;
          const childRecords = s.heightWeightRecordsByChild[childId] || [];
          return {
            heightWeightRecordsByChild: {
              ...s.heightWeightRecordsByChild,
              [childId]: [...childRecords, newRecord],
            },
          };
        }),
      addDentalRecord: (childIdOrRecord, maybeRecord) =>
        set((s) => {
          const isTwoArgs = typeof childIdOrRecord === 'string' && maybeRecord !== undefined;
          const childId = isTwoArgs ? childIdOrRecord : s.activeChildId!;
          const recordData = isTwoArgs ? maybeRecord! : childIdOrRecord as Omit<DentalRecord, 'id' | 'childId'>;
          const newRecord: DentalRecord = { ...(recordData as object), id: generateId('d'), childId } as DentalRecord;
          const childRecords = s.dentalRecordsByChild[childId] || [];
          return {
            dentalRecordsByChild: {
              ...s.dentalRecordsByChild,
              [childId]: [...childRecords, newRecord],
            },
          };
        }),
      addVisionRecord: (childIdOrRecord, maybeRecord) =>
        set((s) => {
          const isTwoArgs = typeof childIdOrRecord === 'string' && maybeRecord !== undefined;
          const childId = isTwoArgs ? childIdOrRecord : s.activeChildId!;
          const recordData = isTwoArgs ? maybeRecord! : childIdOrRecord as Omit<VisionRecord, 'id' | 'childId'>;
          const newRecord: VisionRecord = { ...(recordData as object), id: generateId('v'), childId } as VisionRecord;
          const childRecords = s.visionRecordsByChild[childId] || [];
          return {
            visionRecordsByChild: {
              ...s.visionRecordsByChild,
              [childId]: [...childRecords, newRecord],
            },
          };
        }),
      addAllergyRecord: (childIdOrRecord, maybeRecord) =>
        set((s) => {
          const isTwoArgs = typeof childIdOrRecord === 'string' && maybeRecord !== undefined;
          const childId = isTwoArgs ? childIdOrRecord : s.activeChildId!;
          const recordData = isTwoArgs ? maybeRecord! : childIdOrRecord as Omit<AllergyRecord, 'id' | 'childId'>;
          const newRecord: AllergyRecord = { ...(recordData as object), id: generateId('a'), childId } as AllergyRecord;
          const childRecords = s.allergyRecordsByChild[childId] || [];
          return {
            allergyRecordsByChild: {
              ...s.allergyRecordsByChild,
              [childId]: [...childRecords, newRecord],
            },
          };
        }),
      markToothReplaced: (childIdOrTooth, maybeTooth) =>
        set((s) => {
          const isTwoArgs = maybeTooth !== undefined;
          const childId = isTwoArgs ? childIdOrTooth : s.activeChildId!;
          const tooth = isTwoArgs ? maybeTooth! : childIdOrTooth;
          const childTeeth = s.replacedTeethByChild[childId] || [];
          if (childTeeth.includes(tooth)) return s;
          return {
            replacedTeethByChild: {
              ...s.replacedTeethByChild,
              [childId]: [...childTeeth, tooth],
            },
          };
        }),
      addWaterCup: (childId) =>
        set((s) => {
          const resolvedChildId = childId || s.activeChildId!;
          const today = new Date().toISOString().split('T')[0];
          const childWaterRecords = s.waterRecordsByChild[resolvedChildId] || [];
          const todayIdx = childWaterRecords.findIndex((w) => w.date === today);
          let newRecords: WaterRecord[];
          if (todayIdx >= 0) {
            newRecords = [...childWaterRecords];
            newRecords[todayIdx] = {
              ...newRecords[todayIdx],
              cups: Math.min(newRecords[todayIdx].cups + 1, newRecords[todayIdx].goal),
            };
          } else {
            newRecords = [
              { id: generateId('w'), date: today, cups: 1, goal: 8 },
              ...childWaterRecords,
            ];
          }
          return {
            waterRecordsByChild: {
              ...s.waterRecordsByChild,
              [resolvedChildId]: newRecords,
            },
          };
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

      addVaccine: (v) =>
        set((s) => {
          const childId = s.activeChildId!;
          const newVaccine: Vaccine = { ...v, id: generateId('v'), childId };
          const childVaccines = s.vaccinesByChild[childId] || [];
          return {
            vaccinesByChild: {
              ...s.vaccinesByChild,
              [childId]: [...childVaccines, newVaccine],
            },
          };
        }),

      setVaccineStatus: (id, status) =>
        set((s) => {
          const childId = s.activeChildId!;
          const childVaccines = s.vaccinesByChild[childId] || [];
          const updated = childVaccines.map((v) =>
            v.id === id
              ? { ...v, status, completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : v.completedDate }
              : v
          );
          return {
            vaccinesByChild: {
              ...s.vaccinesByChild,
              [childId]: updated,
            },
          };
        }),
      completeObservation: (vaccineId, reaction) =>
        set((s) => ({
          observationRecords: s.observationRecords.map((r) =>
            r.vaccineId === vaccineId ? { ...r, completed: true, reaction } : r
          ),
        })),
      addAppointment: (appointment) =>
        set((state) => {
          const childId = state.activeChildId!;
          const aptId = generateId('apt');
          const newAppointment: Appointment = {
            ...appointment,
            id: aptId,
            childId,
            createdAt: new Date().toISOString(),
          };
          const childVaccines = state.vaccinesByChild[childId] || [];
          return {
            appointments: [...state.appointments, newAppointment],
            vaccinesByChild: {
              ...state.vaccinesByChild,
              [childId]: childVaccines.map((v) =>
                v.id === appointment.vaccineId
                  ? { ...v, status: 'scheduled' as VaccineStatus, appointmentId: aptId }
                  : v
              ),
            },
          };
        }),
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
        set((state) => {
          const childId = state.activeChildId!;
          const childMeds = state.medicinesByChild[childId] || [];
          const updated = childMeds.map((m) => {
            if (m.id !== medicineId) return m;
            const newTP = [...m.timePoints];
            if (!newTP[timeIndex]) return m;
            newTP[timeIndex] = { ...newTP[timeIndex], taken: true, takenAt: new Date().toISOString() };
            const allTaken = newTP.every((t) => t.taken);
            const newDays = allTaken ? m.takenDays + 1 : m.takenDays;
            return { ...m, timePoints: newTP, takenDays: newDays };
          });
          return {
            medicinesByChild: {
              ...state.medicinesByChild,
              [childId]: updated,
            },
          };
        }),
      addMedicine: (medicine) =>
        set((state) => {
          const childId = state.activeChildId!;
          const newMed: MedicineDetailRecord = { ...medicine, id: generateId('med'), childId };
          const childMeds = state.medicinesByChild[childId] || [];
          return {
            medicinesByChild: {
              ...state.medicinesByChild,
              [childId]: [...childMeds, newMed],
            },
          };
        }),
      addReaction: (medicineId, reaction) =>
        set((state) => {
          const childId = state.activeChildId!;
          const childMeds = state.medicinesByChild[childId] || [];
          const updated = childMeds.map((m) =>
            m.id === medicineId
              ? { ...m, reactions: [...(m.reactions || []), reaction] }
              : m
          );
          return {
            medicinesByChild: {
              ...state.medicinesByChild,
              [childId]: updated,
            },
          };
        }),

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
