export type Gender = 'male' | 'female' | 'boy' | 'girl';

export type Relation = 'father' | 'mother' | 'grandfather' | 'grandmother' | 'other';

export type PermissionLevel = 'admin' | 'edit' | 'view';

export type VaccineStatus = 'completed' | 'pending' | 'overdue' | 'contraindicated' | 'scheduled' | 'deferred';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export type ReminderType = 'vaccine' | 'medicine' | 'visit' | 'measurement' | 'other';

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type ReminderStatus = 'active' | 'completed' | 'cancelled' | 'pending';

export type SymptomType = 'fever' | 'cough' | 'diarrhea';

export type MentalState = 'good' | 'normal' | 'bad';

export type CoughFrequency = 'occasional' | 'frequent' | 'severe';

export type SputumType = 'none' | 'clear' | 'white' | 'yellow' | 'green' | 'bloody' | 'normal';

export type StoolType = 'normal' | 'loose' | 'watery' | 'bloody' | 'mucoid' | 'mushy';

export type DehydrationRisk = 'none' | 'mild' | 'moderate' | 'severe' | 'low' | 'medium' | 'high';

export interface ChildProfile {
  id: string;
  name: string;
  gender: Gender;
  birthday: string;
  avatar?: string;
  age?: number;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string[];
  birthWeight?: number;
  birthHeight?: number;
  headCircumference?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  childId: string;
  date: string;
  height?: number;
  weight?: number;
  headCircumference?: number;
  sleepHours?: number;
  waterIntake?: number;
  temperature?: number;
  bmi?: number;
  note?: string;
  createdAt: string;
}

export interface HeightWeightRecord {
  id: string;
  childId: string;
  date: string;
  height: number;
  weight: number;
  headCircumference?: number;
  bmi: number;
  percentile: string;
}

export interface DentalRecord {
  id: string;
  childId: string;
  date: string;
  toothPosition: string;
  condition: string;
  reason?: string;
  doctorAdvice?: string;
  notes?: string;
}

export interface VisionRecord {
  id: string;
  childId: string;
  date: string;
  leftEye: string;
  rightEye: string;
  leftAstigmatism?: string;
  rightAstigmatism?: string;
}

export interface AllergyRecord {
  id: string;
  childId: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  treatment?: string;
  date: string;
}

export interface VaccineRecord {
  id: string;
  childId: string;
  vaccineCode: string;
  vaccineName: string;
  scheduledAge: string;
  scheduledDate: string;
  actualDate?: string;
  status: VaccineStatus;
  batchNumber?: string;
  manufacturer?: string;
  site?: string;
  caregiver?: string;
  adverseReaction?: string;
  note?: string;
  nextDoseDate?: string;
}

export interface Vaccine {
  id: string;
  childId: string;
  name: string;
  dose: string;
  ageGroup: string;
  status: VaccineStatus;
  plannedDate: string;
  completedDate?: string;
  site?: string;
  manufacturer?: string;
  batchNumber?: string;
  unit?: string;
  appointmentId?: string;
}

export interface ObservationRecord {
  childId: string;
  vaccineId: string;
  vaccineName: string;
  startTime: string;
  duration: number;
  completed: boolean;
  reaction?: string[];
}

export interface Appointment {
  id: string;
  childId: string;
  vaccineId: string;
  location: string;
  date: string;
  timeSlot: string;
  createdAt: string;
}

export interface MedicineRecord {
  id: string;
  childId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  reason: string;
  prescribedBy?: string;
  sideEffects?: string;
  status: 'active' | 'completed' | 'stopped';
  note?: string;
}

export interface MedicineDetailRecord {
  id: string;
  childId: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  dosage: string;
  frequency: string;
  totalDays: number;
  takenDays: number;
  nextDoseTime: string;
  startDate: string;
  endDate: string;
  timePoints: { time: string; taken: boolean; takenAt?: string }[];
  notes?: string;
  isActive: boolean;
  reactions?: { symptoms: string[]; date: string; severity: string; treatment: string }[];
}

export interface SymptomRecord {
  id: string;
  childId: string;
  date?: string;
  symptoms?: string[];
  severity?: SymptomSeverity;
  visitRequired?: boolean;
  type: SymptomType;
  timestamp: number;
  startTime?: number;
  active: boolean;
  resolved?: boolean;
  fever?: {
    temperature: number;
    measureTime: string;
    mentalState: MentalState;
    measures: string;
  };
  cough?: {
    frequency: CoughFrequency;
    sputum: SputumType;
    worseAtNight: boolean;
    mentalState: MentalState;
    measures: string;
  };
  diarrhea?: {
    timesPerDay: number;
    stoolType: StoolType;
    dehydrationRisk: DehydrationRisk;
    mentalState: MentalState;
    measures: string;
  };
  note?: string;
}

export interface VisitRecord {
  id: string;
  childId: string;
  visitDate: string;
  hospital: string;
  department: string;
  doctor?: string;
  symptoms: string[];
  diagnosis?: string;
  prescriptions?: string[] | Array<{ name: string; dosage: string; frequency: string }>;
  testResults?: string[];
  advice?: string;
  nextVisitDate?: string;
  cost?: number;
  note?: string;
  category?: 'all' | 'cold' | 'fever' | 'checkup' | 'other';
  date?: string;
  expense?: number;
  chiefComplaint?: string;
  images?: string[];
}

export interface Caregiver {
  id: string;
  name: string;
  relation: Relation;
  phone: string;
  email?: string;
  permission: PermissionLevel;
  avatar?: string;
  note?: string;
  createdAt: string;
  permissions?: string[];
}

export interface Reminder {
  id: string;
  childId: string;
  title: string;
  type: ReminderType;
  date: string;
  time: string;
  frequency: ReminderFrequency;
  status: ReminderStatus;
  note?: string;
  description?: string;
  relatedRecordId?: string;
  createdAt: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  duration: number;
  quality?: 'good' | 'normal' | 'bad';
  bedTime?: string;
  wakeTime?: string;
  naps?: number;
}

export interface WaterRecord {
  id: string;
  date: string;
  cups: number;
  goal: number;
  history?: { time: string; amount: number }[];
}

export interface MedicationReminder {
  id: string;
  childId: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  takenAt?: string;
  relatedRecordId?: string;
}

export interface GrowthPercentile {
  ageMonths: number;
  height: {
    p3: number;
    p15: number;
    p50: number;
    p85: number;
    p97: number;
  };
  weight: {
    p3: number;
    p15: number;
    p50: number;
    p85: number;
    p97: number;
  };
}

export interface VaccineDefinition {
  code: string;
  name: string;
  fullName: string;
  scheduledAge: string;
  ageMonthsMin: number;
  ageMonthsMax: number;
  doses: number;
  preventDiseases: string[];
  route: string;
  category: 'free' | 'paid';
  note?: string;
}
