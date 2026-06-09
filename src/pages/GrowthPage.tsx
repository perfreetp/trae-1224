import { useState, useMemo } from 'react';
import {
  Activity,
  Smile,
  Eye,
  AlertTriangle,
  Plus,
  Calendar,
  Ruler,
  Scale,
  Baby,
  TrendingUp,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PageHeader from '@/components/layout/PageHeader';
import GrowthChart, { type GrowthDataPoint } from '@/components/charts/GrowthChart';
import ModalSheet from '@/components/ui/ModalSheet';
import {
  useHealthStore,
} from '@/store/useHealthStore';
import { cn } from '@/lib/utils';
import { calculateAge, formatAgeFromBirthday } from '@/utils/dateUtils';
import { calculateBMI } from '@/utils/formatters';
import type { HealthRecord } from '@/types';

type TabType = 'physical' | 'dental' | 'vision' | 'allergy';

const toothNames = [
  '右上第二乳磨牙', '右上第一乳磨牙', '右上乳尖牙', '右上乳侧切牙', '右上乳中切牙',
  '左上乳中切牙', '左上乳侧切牙', '左上乳尖牙', '左上第一乳磨牙', '左上第二乳磨牙',
  '左下第二乳磨牙', '左下第一乳磨牙', '左下乳尖牙', '左下乳侧切牙', '左下乳中切牙',
  '右下乳中切牙', '右下乳侧切牙', '右下乳尖牙', '右下第一乳磨牙', '右下第二乳磨牙',
];

interface DentalRecordLocal {
  id: string;
  date: string;
  toothPosition?: string;
  condition: string;
  reason?: string;
  doctorAdvice?: string;
  notes?: string;
}

interface VisionRecordLocal {
  id: string;
  date: string;
  leftEye: string;
  rightEye: string;
  leftAstigmatism?: string;
  rightAstigmatism?: string;
}

interface AllergyRecordLocal {
  id: string;
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
  treatment: string;
  date: string;
}

const mockDentalRecords: DentalRecordLocal[] = [
  { id: 'd1', date: '2026-03-10', reason: '常规检查', doctorAdvice: '注意刷牙方式，使用含氟牙膏，每天早晚各2分钟', condition: '健康' },
  { id: 'd2', date: '2026-05-15', toothPosition: '左下乳中切牙', condition: '已换牙', notes: '恒牙已萌出1/3，注意观察' },
];

const mockVisionRecords: VisionRecordLocal[] = [
  { id: 'v1', date: '2025-12', leftEye: '1.0', rightEye: '1.0', leftAstigmatism: '0', rightAstigmatism: '0' },
  { id: 'v2', date: '2026-03', leftEye: '1.0', rightEye: '0.8', leftAstigmatism: '0', rightAstigmatism: '-0.50' },
  { id: 'v3', date: '2026-06', leftEye: '1.0', rightEye: '0.8', leftAstigmatism: '0', rightAstigmatism: '-0.50' },
];

const mockAllergyRecords: AllergyRecordLocal[] = [
  { id: 'a1', allergen: '花生', severity: 'severe', reaction: '全身红疹、呼吸困难、面部肿胀', treatment: '立即送医，注射肾上腺素，住院观察24小时', date: '2025-08-20' },
  { id: 'a2', allergen: '牛奶', severity: 'moderate', reaction: '皮肤瘙痒、轻微腹泻、腹部不适', treatment: '抗组胺药物，停用牛奶制品，改用豆奶', date: '2025-11-10' },
  { id: 'a3', allergen: '花粉', severity: 'mild', reaction: '打喷嚏、流鼻涕、眼睛瘙痒', treatment: '生理盐水洗鼻，外出戴口罩，必要时抗组胺药', date: '2026-04-05' },
  { id: 'a4', allergen: '芒果', severity: 'mild', reaction: '口唇周围红肿、轻微皮疹', treatment: '冷敷+抗组胺药膏，避免接触芒果汁液', date: '2026-05-18' },
];

const mockReplacedTeeth = [10, 11];

export default function GrowthPage() {
  const {
    selectedChildId,
    children,
    getHealthRecordsByChildId,
    getLatestHealthRecord,
    addHealthRecord,
  } = useHealthStore();

  const currentChild = children.find((c) => c.id === selectedChildId) || children[0];
  const childId = currentChild?.id;

  const ageResult = currentChild ? calculateAge(currentChild.birthday) : { years: 0, months: 0, totalMonths: 0 };
  const ageStr = currentChild ? formatAgeFromBirthday(currentChild.birthday) : '';
  const ageMonths = ageResult.years * 12 + ageResult.months;

  const healthRecords = childId ? getHealthRecordsByChildId(childId) : [];
  const latestRecord = childId ? getLatestHealthRecord(childId) : undefined;

  const growthData: GrowthDataPoint[] = useMemo(() => {
    return healthRecords
      .filter((r) => r.height || r.weight)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => ({
        date: r.date.slice(0, 7),
        height: r.height,
        weight: r.weight,
        bmi: r.bmi,
        note: r.note,
      }));
  }, [healthRecords]);

  const [activeTab, setActiveTab] = useState<TabType>('physical');
  const [showHWModal, setShowHWModal] = useState(false);
  const [showDentalModal, setShowDentalModal] = useState(false);
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);

  const [dentalRecords, setDentalRecords] = useState<DentalRecordLocal[]>(mockDentalRecords);
  const [visionRecords, setVisionRecords] = useState<VisionRecordLocal[]>(mockVisionRecords);
  const [allergyRecords, setAllergyRecords] = useState<AllergyRecordLocal[]>(mockAllergyRecords);
  const [replacedTeeth, setReplacedTeeth] = useState<number[]>(mockReplacedTeeth);

  const [hwForm, setHwForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    height: latestRecord?.height || 120,
    weight: latestRecord?.weight || 23,
    headCircumference: latestRecord?.headCircumference || 52,
  });
  const [dentalForm, setDentalForm] = useState({ date: '', toothPosition: '', condition: '', reason: '', doctorAdvice: '', notes: '' });
  const [visionForm, setVisionForm] = useState({ date: '', leftEye: '1.0', rightEye: '1.0', leftAstigmatism: '0', rightAstigmatism: '0' });
  const [allergyForm, setAllergyForm] = useState({ allergen: '', severity: 'mild' as 'mild' | 'moderate' | 'severe', reaction: '', treatment: '', date: '' });

  const latestVision = visionRecords[visionRecords.length - 1];
  const visionChartData = visionRecords.map((v) => ({
    date: v.date,
    左眼: Number(v.leftEye),
    右眼: Number(v.rightEye),
  }));

  const handleSubmitHW = () => {
    if (!childId) return;
    const bmi = calculateBMI(Number(hwForm.height), Number(hwForm.weight));
    const newRecord: Omit<HealthRecord, 'id' | 'createdAt'> = {
      childId,
      date: hwForm.date,
      height: Number(hwForm.height),
      weight: Number(hwForm.weight),
      headCircumference: Number(hwForm.headCircumference),
      bmi: bmi > 0 ? bmi : undefined,
    };
    addHealthRecord(newRecord);
    setShowHWModal(false);
  };

  const handleSubmitDental = () => {
    const newRecord: DentalRecordLocal = {
      id: Date.now().toString(),
      ...dentalForm,
    };
    setDentalRecords([...dentalRecords, newRecord]);
    setShowDentalModal(false);
    setDentalForm({ date: '', toothPosition: '', condition: '', reason: '', doctorAdvice: '', notes: '' });
  };

  const handleSubmitVision = () => {
    const newRecord: VisionRecordLocal = {
      id: Date.now().toString(),
      ...visionForm,
    };
    setVisionRecords([...visionRecords, newRecord]);
    setShowVisionModal(false);
  };

  const handleSubmitAllergy = () => {
    const newRecord: AllergyRecordLocal = {
      id: Date.now().toString(),
      ...allergyForm,
    };
    setAllergyRecords([...allergyRecords, newRecord]);
    setShowAllergyModal(false);
    setAllergyForm({ allergen: '', severity: 'mild', reaction: '', treatment: '', date: '' });
  };

  const handleMarkTooth = (idx: number) => {
    setReplacedTeeth((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const severityColors = {
    mild: { bg: 'bg-lemon-400/30', border: 'border-lemon-500/40', text: 'text-amber-700', solid: 'bg-lemon-500' },
    moderate: { bg: 'bg-coral-400/25', border: 'border-coral-500/40', text: 'text-coral-700', solid: 'bg-coral-500' },
    severe: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-700', solid: 'bg-red-500' },
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'physical', label: '体检', icon: <Activity className="w-4 h-4" /> },
    { key: 'dental', label: '牙齿', icon: <Smile className="w-4 h-4" /> },
    { key: 'vision', label: '视力', icon: <Eye className="w-4 h-4" /> },
    { key: 'allergy', label: '过敏史', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-warm-50 pb-32">
      <PageHeader
        title="成长记录"
        subtitle={`${currentChild?.name || ''} · ${ageStr} · 见证每一步成长`}
      />

      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-card p-1.5 flex gap-1.5 animate-slide-up">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-300',
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-mint-500 to-mint-400 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 animate-fade-in" key={activeTab}>
        {activeTab === 'physical' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-mint-500/15 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-mint-600" />
                  </div>
                  身高体重趋势
                </h3>
                <span className="text-xs text-gray-400">{growthData.length} 条记录</span>
              </div>
              <GrowthChart
                data={growthData}
                metrics={['height', 'weight']}
                heightUnit="cm"
                weightUnit="kg"
              />
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-lavender-500/15 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-lavender-500" />
                  </div>
                  BMI 指数趋势
                </h3>
              </div>
              <GrowthChart
                data={growthData.filter((d) => d.bmi !== undefined)}
                metrics={['bmi']}
                className="h-56"
              />
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky2-500/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-sky2-600" />
                  </div>
                  历史记录时间线
                </h3>
              </div>
              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-mint-300 via-sky2-300 to-lavender-300" />
                <div className="space-y-4">
                  {healthRecords.filter((r) => r.height || r.weight).slice(0, 8).map((record, idx) => (
                    <div key={record.id} className="relative pl-12 animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className="absolute left-2.5 top-1 w-5 h-5 rounded-full bg-white border-2 border-mint-400 flex items-center justify-center shadow-md z-10">
                        <div className="w-2 h-2 rounded-full bg-mint-500" />
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 hover:shadow-soft transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-mint-500" />
                            {record.date}
                          </span>
                          {record.bmi && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-700 font-medium">
                              BMI {record.bmi.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2.5 rounded-xl bg-mint-50">
                            <Ruler className="w-4 h-4 text-mint-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-gray-800">{record.height ?? '-'}</p>
                            <p className="text-[10px] text-gray-500">身高 cm</p>
                          </div>
                          <div className="text-center p-2.5 rounded-xl bg-coral-500/10">
                            <Scale className="w-4 h-4 text-coral-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-gray-800">{record.weight ?? '-'}</p>
                            <p className="text-[10px] text-gray-500">体重 kg</p>
                          </div>
                          <div className="text-center p-2.5 rounded-xl bg-lavender-500/15">
                            <Baby className="w-4 h-4 text-lavender-500 mx-auto mb-1" />
                            <p className="text-lg font-bold text-gray-800">{record.headCircumference ?? '-'}</p>
                            <p className="text-[10px] text-gray-500">头围 cm</p>
                          </div>
                        </div>
                        {record.note && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                            📝 {record.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dental' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky2-500/15 flex items-center justify-center">
                    <Smile className="w-4 h-4 text-sky2-600" />
                  </div>
                  乳牙列示意图
                </h3>
                <span className="text-xs text-mint-600 font-medium bg-mint-50 px-2.5 py-1 rounded-full">
                  已换牙 {replacedTeeth.length}/20
                </span>
              </div>

              <div className="bg-gradient-to-b from-sky2-400/10 to-mint-50 rounded-2xl p-4">
                <div className="grid grid-cols-10 gap-1.5 mb-3">
                  {toothNames.slice(0, 10).map((name, idx) => (
                    <button
                      key={`upper-${idx}`}
                      onClick={() => handleMarkTooth(idx)}
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center transition-all text-xs relative group',
                        replacedTeeth.includes(idx)
                          ? 'bg-gradient-to-br from-mint-400 to-mint-500 text-white shadow-md scale-105'
                          : 'bg-white border-2 border-sky2-300/50 text-sky2-600 hover:border-sky2-400 hover:shadow'
                      )}
                      title={name}
                    >
                      <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                      {replacedTeeth.includes(idx) && (
                        <Check className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-mint-600 rounded-full p-0.5 shadow" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="h-1.5 bg-gradient-to-r from-transparent via-pink-300/50 to-transparent rounded-full my-2" />
                <div className="grid grid-cols-10 gap-1.5 mt-3">
                  {toothNames.slice(10, 20).map((name, idx) => {
                    const actualIdx = idx + 10;
                    return (
                      <button
                        key={`lower-${idx}`}
                        onClick={() => handleMarkTooth(actualIdx)}
                        className={cn(
                          'aspect-square rounded-xl flex items-center justify-center transition-all text-xs relative group',
                          replacedTeeth.includes(actualIdx)
                            ? 'bg-gradient-to-br from-mint-400 to-mint-500 text-white shadow-md scale-105'
                            : 'bg-white border-2 border-sky2-300/50 text-sky2-600 hover:border-sky2-400 hover:shadow'
                        )}
                        title={name}
                      >
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                        {replacedTeeth.includes(actualIdx) && (
                          <Check className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-mint-600 rounded-full p-0.5 shadow" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">💡 点击牙齿可标记是否已换牙，悬停查看位置</p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-coral-500/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-coral-500" />
                  </div>
                  看牙医记录
                </h3>
              </div>
              <div className="space-y-3">
                {dentalRecords.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Smile className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无牙医记录</p>
                  </div>
                ) : (
                  dentalRecords.slice().reverse().map((record, idx) => (
                    <div
                      key={record.id}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 animate-slide-up"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-800 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-sky2-500" />
                            {record.date}
                          </span>
                          {record.toothPosition && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky2-100 text-sky2-700">
                              {record.toothPosition}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-mint-100 text-mint-700 font-medium">
                          {record.condition}
                        </span>
                      </div>
                      {record.reason && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="text-gray-400">就诊原因：</span>
                          {record.reason}
                        </div>
                      )}
                      {record.doctorAdvice && (
                        <div className="text-sm text-gray-600 bg-mint-50 rounded-xl p-3 border-l-4 border-mint-400">
                          <span className="text-mint-700 font-medium">医生建议：</span>
                          {record.doctorAdvice}
                        </div>
                      )}
                      {record.notes && (
                        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                          📝 备注：{record.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lemon-400/30 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-amber-600" />
                </div>
                快速录入
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDentalModal(true)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-sky2-500/10 to-sky2-400/5 border border-sky2-400/30 hover:shadow-soft transition-all active:scale-[0.98]"
                >
                  <Smile className="w-6 h-6 text-sky2-500 mb-2" />
                  <p className="text-sm font-bold text-gray-700">看牙记录</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">记录就诊详情</p>
                </button>
                <button
                  onClick={() => setShowDentalModal(true)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-mint-500/10 to-mint-400/5 border border-mint-400/30 hover:shadow-soft transition-all active:scale-[0.98]"
                >
                  <Check className="w-6 h-6 text-mint-500 mb-2" />
                  <p className="text-sm font-bold text-gray-700">换牙记录</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">标记恒牙萌出</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vision' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-lavender-400/30 via-sky2-400/20 to-mint-400/20 rounded-3xl p-5 shadow-card border border-lavender-300/30">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-lavender-600" />
                  </div>
                  最近视力检查
                </h3>
                <span className="text-xs font-medium text-gray-600 bg-white/70 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {latestVision?.date || '--'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center">
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-sky2-600 bg-sky2-100 px-2.5 py-1 rounded-full mb-2">
                    <Eye className="w-3 h-3" />
                    左眼
                  </div>
                  <p className="text-4xl font-bold text-gray-800 font-display">{latestVision?.leftEye || '--'}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    散光：<span className="font-bold text-gray-700">{latestVision?.leftAstigmatism || '0'}D</span>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center">
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-coral-600 bg-coral-400/20 px-2.5 py-1 rounded-full mb-2">
                    <Eye className="w-3 h-3" />
                    右眼
                  </div>
                  <p className="text-4xl font-bold text-gray-800 font-display">{latestVision?.rightEye || '--'}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    散光：<span className="font-bold text-gray-700">{latestVision?.rightAstigmatism || '0'}D</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky2-500/15 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-sky2-600" />
                  </div>
                  视力变化趋势
                </h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leftEyeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#45B7D1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#45B7D1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="rightEyeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF8A80" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FF8A80" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 1.5]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="左眼"
                      stroke="#45B7D1"
                      strokeWidth={3}
                      dot={{ fill: '#45B7D1', r: 5, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="右眼"
                      stroke="#FF8A80"
                      strokeWidth={3}
                      dot={{ fill: '#FF8A80', r: 5, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-lavender-500/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-lavender-500" />
                  </div>
                  历史检查记录
                </h3>
              </div>
              <div className="space-y-3">
                {visionRecords.slice().reverse().map((record, idx) => (
                  <div
                    key={record.id}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-100 hover:shadow-soft transition-shadow animate-slide-up flex items-center gap-4"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky2-400/20 to-lavender-400/20 flex items-center justify-center shrink-0">
                      <Eye className="w-6 h-6 text-sky2-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{record.date}</p>
                      <div className="flex gap-4 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">
                          左: <span className="font-bold text-sky2-600">{record.leftEye}</span>
                          <span className="text-gray-400 ml-1">({record.leftAstigmatism}D)</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          右: <span className="font-bold text-coral-600">{record.rightEye}</span>
                          <span className="text-gray-400 ml-1">({record.rightAstigmatism}D)</span>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'allergy' && (
          <div className="space-y-5">
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-coral-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-coral-500" />
                  </div>
                  过敏原标签云
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5 pb-2">
                {allergyRecords.map((allergy, idx) => {
                  const colors = severityColors[allergy.severity];
                  const sizes = ['text-sm', 'text-base', 'text-lg', 'text-sm'];
                  return (
                    <div
                      key={allergy.id}
                      className={cn(
                        'px-4 py-2 rounded-2xl border-2 backdrop-blur font-medium flex items-center gap-2 animate-slide-up',
                        colors.bg,
                        colors.border,
                        colors.text,
                        sizes[idx % 4]
                      )}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className={cn('w-2.5 h-2.5 rounded-full', colors.solid)} />
                      {allergy.allergen}
                    </div>
                  );
                })}
                {allergyRecords.length === 0 && (
                  <p className="text-center w-full py-8 text-gray-400 text-sm">暂无过敏原记录</p>
                )}
              </div>
              <div className="flex gap-4 pt-3 border-t border-gray-100 mt-2 flex-wrap">
                {[
                  { key: 'mild', label: '轻度', count: allergyRecords.filter((a) => a.severity === 'mild').length },
                  { key: 'moderate', label: '中度', count: allergyRecords.filter((a) => a.severity === 'moderate').length },
                  { key: 'severe', label: '严重', count: allergyRecords.filter((a) => a.severity === 'severe').length },
                ].map((item) => {
                  const colors = severityColors[item.key as keyof typeof severityColors];
                  return (
                    <div key={item.key} className="flex items-center gap-1.5 text-xs">
                      <span className={cn('w-3 h-3 rounded-full', colors.solid)} />
                      <span className="text-gray-500">{item.label}</span>
                      <span className={cn('font-bold', colors.text)}>{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-mint-500/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-mint-600" />
                  </div>
                  过敏反应记录
                </h3>
              </div>
              <div className="space-y-3">
                {allergyRecords.slice().reverse().map((record, idx) => {
                  const colors = severityColors[record.severity];
                  const severityText = { mild: '轻度', moderate: '中度', severe: '严重' }[record.severity];
                  return (
                    <div
                      key={record.id}
                      className={cn(
                        'rounded-2xl p-4 border-2 animate-slide-up',
                        colors.bg,
                        colors.border
                      )}
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-3 h-3 rounded-full', colors.solid)} />
                          <h4 className={cn('font-bold', colors.text)}>{record.allergen}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-medium',
                            colors.solid,
                            'text-white'
                          )}>
                            {severityText}
                          </span>
                          <span className="text-[10px] text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                            {record.date}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white/70 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">过敏反应</p>
                          <p className="text-sm text-gray-700">{record.reaction}</p>
                        </div>
                        <div className="bg-mint-500/10 rounded-xl p-3 border-l-4 border-mint-400">
                          <p className="text-[10px] text-mint-700 mb-1 font-medium uppercase tracking-wide">处理方式</p>
                          <p className="text-sm text-gray-700">{record.treatment}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          if (activeTab === 'physical') setShowHWModal(true);
          else if (activeTab === 'dental') setShowDentalModal(true);
          else if (activeTab === 'vision') setShowVisionModal(true);
          else setShowAllergyModal(true);
        }}
        className="fixed bottom-8 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-mint-500 to-mint-400 text-white shadow-glow flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40 animate-bounce-soft"
      >
        <Plus className="w-7 h-7" />
      </button>

      <ModalSheet
        open={showHWModal}
        onClose={() => setShowHWModal(false)}
        title="录入体检记录"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">检查日期</label>
            <input
              type="date"
              value={hwForm.date}
              onChange={(e) => setHwForm({ ...hwForm, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">身高 cm</label>
              <input
                type="number"
                value={hwForm.height}
                onChange={(e) => setHwForm({ ...hwForm, height: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">体重 kg</label>
              <input
                type="number"
                step="0.1"
                value={hwForm.weight}
                onChange={(e) => setHwForm({ ...hwForm, weight: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">头围 cm</label>
            <input
              type="number"
              step="0.1"
              value={hwForm.headCircumference}
              onChange={(e) => setHwForm({ ...hwForm, headCircumference: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div className="pt-3 flex gap-3">
            <button
              onClick={() => setShowHWModal(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> 取消
            </button>
            <button
              onClick={handleSubmitHW}
              className="flex-1 py-3 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors active:scale-[0.98] shadow-glow flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>
      </ModalSheet>

      <ModalSheet
        open={showDentalModal}
        onClose={() => setShowDentalModal(false)}
        title="录入牙齿记录"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
            <input
              type="date"
              value={dentalForm.date}
              onChange={(e) => setDentalForm({ ...dentalForm, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">牙齿位置</label>
            <input
              type="text"
              value={dentalForm.toothPosition}
              onChange={(e) => setDentalForm({ ...dentalForm, toothPosition: e.target.value })}
              placeholder="如：左下乳中切牙（可选）"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状况 *</label>
            <input
              type="text"
              value={dentalForm.condition}
              onChange={(e) => setDentalForm({ ...dentalForm, condition: e.target.value })}
              placeholder="如：健康/蛀牙/已换牙/牙龈炎"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">就诊原因</label>
            <input
              type="text"
              value={dentalForm.reason}
              onChange={(e) => setDentalForm({ ...dentalForm, reason: e.target.value })}
              placeholder="如：常规检查/牙痛/涂氟"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">医生建议</label>
            <textarea
              value={dentalForm.doctorAdvice}
              onChange={(e) => setDentalForm({ ...dentalForm, doctorAdvice: e.target.value })}
              rows={2}
              placeholder="医生给出的专业建议"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={dentalForm.notes}
              onChange={(e) => setDentalForm({ ...dentalForm, notes: e.target.value })}
              rows={2}
              placeholder="其他需要记录的信息"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none resize-none"
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setShowDentalModal(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> 取消
            </button>
            <button
              onClick={handleSubmitDental}
              className="flex-1 py-3 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors active:scale-[0.98] shadow-glow flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>
      </ModalSheet>

      <ModalSheet
        open={showVisionModal}
        onClose={() => setShowVisionModal(false)}
        title="录入视力记录"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">检查日期</label>
            <input
              type="date"
              value={visionForm.date}
              onChange={(e) => setVisionForm({ ...visionForm, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-sky2-600 mb-2">👁️ 左眼视力</label>
              <input
                type="text"
                value={visionForm.leftEye}
                onChange={(e) => setVisionForm({ ...visionForm, leftEye: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-sky2-50 border-2 border-sky2-200 focus:border-sky2-400 focus:ring-2 focus:ring-sky2-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coral-600 mb-2">👁️ 右眼视力</label>
              <input
                type="text"
                value={visionForm.rightEye}
                onChange={(e) => setVisionForm({ ...visionForm, rightEye: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-coral-500/10 border-2 border-coral-300/50 focus:border-coral-400 focus:ring-2 focus:ring-coral-100 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">左眼散光 (D)</label>
              <input
                type="text"
                value={visionForm.leftAstigmatism}
                onChange={(e) => setVisionForm({ ...visionForm, leftAstigmatism: e.target.value })}
                placeholder="0 或 -0.50"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">右眼散光 (D)</label>
              <input
                type="text"
                value={visionForm.rightAstigmatism}
                onChange={(e) => setVisionForm({ ...visionForm, rightAstigmatism: e.target.value })}
                placeholder="0 或 -0.50"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
          </div>
          <div className="pt-3 flex gap-3">
            <button
              onClick={() => setShowVisionModal(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> 取消
            </button>
            <button
              onClick={handleSubmitVision}
              className="flex-1 py-3 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors active:scale-[0.98] shadow-glow flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>
      </ModalSheet>

      <ModalSheet
        open={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        title="录入过敏记录"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">过敏原 *</label>
            <input
              type="text"
              value={allergyForm.allergen}
              onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
              placeholder="如：花生、牛奶、花粉、尘螨"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">严重程度</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'mild', label: '轻度', icon: '🌿' },
                { key: 'moderate', label: '中度', icon: '⚠️' },
                { key: 'severe', label: '严重', icon: '🚨' },
              ].map((level) => {
                const colors = severityColors[level.key as keyof typeof severityColors];
                return (
                  <button
                    key={level.key}
                    onClick={() => setAllergyForm({ ...allergyForm, severity: level.key as 'mild' | 'moderate' | 'severe' })}
                    className={cn(
                      'p-3 rounded-2xl border-2 transition-all text-center',
                      allergyForm.severity === level.key
                        ? `${colors.bg} ${colors.border} scale-105 shadow-md`
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="text-2xl mb-1">{level.icon}</div>
                    <p className={cn('text-sm font-bold', allergyForm.severity === level.key ? colors.text : 'text-gray-500')}>
                      {level.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">发作日期</label>
            <input
              type="date"
              value={allergyForm.date}
              onChange={(e) => setAllergyForm({ ...allergyForm, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">过敏反应 *</label>
            <textarea
              value={allergyForm.reaction}
              onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
              rows={2}
              placeholder="详细描述过敏症状，如：红疹、呼吸困难等"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">处理方式 *</label>
            <textarea
              value={allergyForm.treatment}
              onChange={(e) => setAllergyForm({ ...allergyForm, treatment: e.target.value })}
              rows={2}
              placeholder="描述处理方式，如：服药、送医、冷敷等"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none resize-none"
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setShowAllergyModal(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> 取消
            </button>
            <button
              onClick={handleSubmitAllergy}
              className="flex-1 py-3 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors active:scale-[0.98] shadow-glow flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}
