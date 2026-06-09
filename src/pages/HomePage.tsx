import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Ruler,
  Moon,
  Droplets,
  Pill,
  Plus,
  Syringe,
  Stethoscope,
  Calendar,
  Check,
  Clock,
  TrendingUp,
  X,
} from 'lucide-react';
import { useHealthStore } from '@/store/useHealthStore';
import ModalSheet from '@/components/ui/ModalSheet';
import { cn } from '@/lib/utils';
import { calculateAge, formatAgeFromBirthday } from '@/utils/dateUtils';
import { calculateBMI, getRecommendedSleepHours, getRecommendedWaterIntake } from '@/utils/formatters';
import type { HealthRecord } from '@/types';

export default function HomePage() {
  const {
    children,
    selectedChildId,
    activeChildId,
    setSelectedChildId,
    setActiveChild,
    healthRecords,
    reminders,
    getActiveMedicines,
    completeReminder,
    addHealthRecord,
    addWaterCup,
    waterRecordsByChild,
  } = useHealthStore();

  const effectiveChildId = activeChildId || selectedChildId || children[0]?.id;
  const currentChildIndex = useMemo(
    () => children.findIndex((c) => c.id === effectiveChildId),
    [children, effectiveChildId]
  );
  const currentChild = children[currentChildIndex] || children[0];
  const childId = currentChild?.id;

  const childHealthRecords = useMemo(() => {
    if (!childId) return [];
    return healthRecords
      .filter((r) => r.childId === childId && r.height && r.weight)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthRecords, childId]);

  const latestHW = childHealthRecords[0];

  const todayRecords = useMemo(() => {
    if (!childId) return null;
    const today = new Date().toISOString().split('T')[0];
    return healthRecords
      .filter((r) => r.childId === childId && r.date === today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [healthRecords, childId]);

  const childWaterRecords = useMemo(() => {
    if (!childId) return [];
    return waterRecordsByChild[childId] || [];
  }, [childId, waterRecordsByChild]);

  const todayWaterRecord = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return childWaterRecords.find((r) => r.date === today);
  }, [childWaterRecords]);

  const todaySleep = todayRecords?.sleepHours ?? 9.5;
  const todayWaterCups = todayWaterRecord?.cups ?? 0;
  const todayWaterGoal = todayWaterRecord?.goal ?? 8;
  const todayWater = todayWaterCups * 250;

  const pendingMeds = childId ? getActiveMedicines(childId) : [];
  const childReminders = useMemo(() => {
    if (!childId) return [];
    return reminders.filter((r) => r.childId === childId && r.status === 'active').slice(0, 5);
  }, [reminders, childId]);

  const ageResult = currentChild ? calculateAge(currentChild.birthday) : { years: 0, months: 0 };
  const ageStr = currentChild ? formatAgeFromBirthday(currentChild.birthday) : '';
  const sleepGoal = getRecommendedSleepHours(ageResult.years * 12 + ageResult.months).max;
  const waterGoalMl = latestHW?.weight ? getRecommendedWaterIntake(latestHW.weight) : 1500;
  const waterGoal = todayWaterGoal * 250;

  const [showHWForm, setShowHWForm] = useState(false);
  const [hwForm, setHwForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    height: latestHW?.height || 120,
    weight: latestHW?.weight || 23,
    headCircumference: latestHW?.headCircumference || 52,
    sleepHours: todaySleep,
    waterIntake: todayWater,
  });

  const handlePrevChild = () => {
    const newIndex = currentChildIndex <= 0 ? children.length - 1 : currentChildIndex - 1;
    const newId = children[newIndex]?.id;
    if (newId) setActiveChild(newId);
  };
  const handleNextChild = () => {
    const newIndex = currentChildIndex >= children.length - 1 ? 0 : currentChildIndex + 1;
    const newId = children[newIndex]?.id;
    if (newId) setActiveChild(newId);
  };

  const handleSubmitHW = () => {
    if (!childId) return;
    const bmi = calculateBMI(Number(hwForm.height), Number(hwForm.weight));
    const newRecord: Omit<HealthRecord, 'id' | 'createdAt'> = {
      childId,
      date: hwForm.date,
      height: Number(hwForm.height),
      weight: Number(hwForm.weight),
      headCircumference: Number(hwForm.headCircumference),
      sleepHours: Number(hwForm.sleepHours),
      waterIntake: Number(hwForm.waterIntake),
      bmi: bmi > 0 ? bmi : undefined,
    };
    addHealthRecord(newRecord);
    setShowHWForm(false);
  };

  const handleAddWater = () => {
    if (!activeChildId) return;
    addWaterCup();
  };

  const sleepPercent = Math.min((todaySleep / sleepGoal) * 100, 100);
  const waterPercent = Math.min((todayWater / waterGoal) * 100, 100);

  const cards = [
    { delay: 0 },
    { delay: 80 },
    { delay: 160 },
    { delay: 240 },
  ];

  const isFemale = currentChild?.gender === 'female' || currentChild?.gender === 'girl';
  const avatarEmoji = currentChild?.avatar || (isFemale ? '👧' : '👦');
  const genderLabel = isFemale ? '小公主' : '小王子';
  const genderBg = isFemale ? 'bg-coral-400/20' : 'bg-sky2-400/20';
  const genderBadgeBg = isFemale ? 'bg-coral-500' : 'bg-sky2-500';

  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-br from-mint-100 via-mint-50 to-warm-50">
          <svg viewBox="0 0 1440 120" className="absolute -bottom-1 left-0 w-full h-24 text-warm-50 fill-current">
            <path d="M0,64L60,74.7C120,85,240,107,360,101.3C480,96,600,64,720,58.7C840,53,960,75,1080,80C1200,85,1320,75,1380,69.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
          </svg>
        </div>
        <div className="absolute top-12 right-8 w-40 h-40 bg-lemon-400/25 rounded-full blur-3xl animate-float" />
        <div className="absolute top-28 left-6 w-32 h-32 bg-sky2-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative pt-14 px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">👋 下午好，亲爱的家长</p>
              <h1 className="text-2xl font-bold text-gray-800 mt-1 font-display">儿童健康管家</h1>
            </div>
            <div className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
          </div>

          <div
            className="relative bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-soft animate-slide-up"
            style={{ animationDelay: '50ms' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevChild}
                className="w-9 h-9 rounded-full bg-mint-100 flex items-center justify-center hover:bg-mint-200 transition-colors active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 text-mint-600" />
              </button>

              <div className="flex-1 flex items-center gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner',
                      genderBg
                    )}
                  >
                    {avatarEmoji || (isFemale ? '👧' : '👦')}
                  </div>
                  <div
                    className={cn(
                      'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow',
                      genderBadgeBg
                    )}
                  >
                    {ageResult.years}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800 font-display">{currentChild?.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-mint-100 text-mint-700">
                      {genderLabel}
                    </span>
                    <span className="text-xs text-gray-500">{ageStr}</span>
                    {currentChild?.bloodType && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-lavender-300/40 text-lavender-500 font-medium">
                        {currentChild.bloodType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextChild}
                className="w-9 h-9 rounded-full bg-mint-100 flex items-center justify-center hover:bg-mint-200 transition-colors active:scale-95"
              >
                <ChevronRight className="w-5 h-5 text-mint-600" />
              </button>
            </div>
            <div className="flex justify-center gap-1.5 mt-3">
              {children.map((c, i) => (
                <div
                  key={c.id}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    c.id === selectedChildId ? 'w-6 bg-mint-500' : 'w-1.5 bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        <div
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-mint-50 to-mint-100/70 rounded-3xl p-5 shadow-soft border border-mint-200/50 animate-slide-up"
          style={{ animationDelay: `${cards[0].delay}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-mint-500 flex items-center justify-center shadow-glow">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={() => setShowHWForm(true)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-mint-500 text-white hover:bg-mint-600 transition-colors active:scale-95 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              记录
            </button>
          </div>
          <h3 className="text-sm text-gray-500 mb-2">身高体重</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-2xl font-bold text-gray-800 font-display">
                {latestHW?.height ?? '-'}
                <span className="text-xs font-normal text-gray-400 ml-0.5">cm</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">身高</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 font-display">
                {latestHW?.weight ?? '-'}
                <span className="text-xs font-normal text-gray-400 ml-0.5">kg</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">体重</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-mint-200/60">
            <div>
              <p className="text-xs text-gray-500">BMI</p>
              <p className="font-bold text-mint-700 flex items-center gap-1">
                {latestHW?.bmi?.toFixed(1) ?? '-'}
                <TrendingUp className="w-3 h-3" />
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">最新记录</p>
              <p className="font-bold text-mint-700 text-xs">{latestHW?.date ?? '-'}</p>
            </div>
          </div>
        </div>

        <div
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-lavender-300/40 to-lavender-400/20 rounded-3xl p-5 shadow-soft border border-lavender-400/30 animate-slide-up"
          style={{ animationDelay: `${cards[1].delay}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-lavender-500 flex items-center justify-center shadow-md" style={{ boxShadow: '0 0 20px rgba(179,157,219,0.4)' }}>
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-lavender-600 font-medium">
              目标 {sleepGoal}h
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mb-3">今日睡眠</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EDE7F6" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#B39DDB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${sleepPercent}, 100`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-800 font-display">{todaySleep}</span>
                <span className="text-[9px] text-gray-400 -mt-0.5">小时</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-lg bg-lavender-300/60 flex items-center justify-center text-[10px]">🌙</span>
                <span className="text-gray-500">睡眠质量</span>
                <span className="font-bold text-gray-700 ml-auto">
                  {sleepPercent >= 90 ? '优秀' : sleepPercent >= 75 ? '良好' : '需改善'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-5 h-5 rounded-lg bg-lemon-400/40 flex items-center justify-center text-[10px]">💤</span>
                <span className="text-gray-500">完成度</span>
                <span className="font-bold text-lavender-600 ml-auto">{sleepPercent.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-sky2-400/20 to-sky2-500/10 rounded-3xl p-5 shadow-soft border border-sky2-400/30 animate-slide-up"
          style={{ animationDelay: `${cards[2].delay}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-sky2-500 flex items-center justify-center shadow-md" style={{ boxShadow: '0 0 20px rgba(69,183,209,0.35)' }}>
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={handleAddWater}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-sky2-500 text-white hover:bg-sky2-600 transition-colors active:scale-95 font-medium shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              加一杯
            </button>
          </div>
          <h3 className="text-sm text-gray-500 mb-3">今日饮水</h3>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-gray-800 font-display">
              {todayWaterCups}
              <span className="text-sm font-normal text-gray-400"> 杯</span>
              <span className="text-xs text-gray-400 ml-1">/ {todayWaterGoal} 杯</span>
            </p>
          </div>
          <div className="flex items-end justify-between mb-3">
            <p className="text-sm text-gray-400">
              {(todayWater / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L
            </p>
          </div>
          <div className="h-3 rounded-full bg-sky2-400/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky2-400 to-sky2-500 transition-all duration-500 relative"
              style={{ width: `${waterPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%]" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            还差 <span className="font-bold text-sky2-600">{Math.max(todayWaterGoal - todayWaterCups, 0)} 杯</span> 达成目标 🎯
          </p>
        </div>

        <div
          className="col-span-2 sm:col-span-1 bg-gradient-to-br from-coral-400/20 to-coral-500/10 rounded-3xl p-5 shadow-soft border border-coral-400/30 animate-slide-up"
          style={{ animationDelay: `${cards[3].delay}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-coral-500 flex items-center justify-center shadow-md" style={{ boxShadow: '0 0 20px rgba(255,107,107,0.35)' }}>
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-coral-500 text-white font-medium">
              {pendingMeds.length} 进行中
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mb-3">用药提醒</h3>
          <div className="space-y-2.5">
            {pendingMeds.slice(0, 2).map((med) => (
              <div
                key={med.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/60 hover:bg-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-coral-400/30 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4 text-coral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{med.medicineName}</p>
                  <p className="text-[10px] text-gray-400">{med.dosage} · {med.frequency}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-coral-600 font-medium shrink-0">
                  <Clock className="w-3 h-3" />
                  {med.status === 'active' ? '服用中' : '已完成'}
                </div>
              </div>
            ))}
            {pendingMeds.length === 0 && (
              <div className="text-center py-3 text-sm text-gray-400">
                暂无进行中的药物 ✅
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="px-6 mt-7 animate-slide-up"
        style={{ animationDelay: '320ms' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-mint-600" />
            今日提醒
          </h2>
          <span className="text-xs text-gray-400">共 {childReminders.length} 项</span>
        </div>

        <div className="space-y-3">
          {childReminders.map((reminder, idx) => {
            const typeConfig = {
              vaccine: {
                icon: <Syringe className="w-5 h-5" />,
                iconBg: 'bg-lavender-500',
                badge: 'bg-lavender-500',
                text: '疫苗',
              },
              medicine: {
                icon: <Pill className="w-5 h-5" />,
                iconBg: 'bg-coral-500',
                badge: 'bg-coral-500',
                text: '用药',
              },
              visit: {
                icon: <Stethoscope className="w-5 h-5" />,
                iconBg: 'bg-sky2-500',
                badge: 'bg-sky2-500',
                text: '就诊',
              },
              measurement: {
                icon: <Ruler className="w-5 h-5" />,
                iconBg: 'bg-mint-500',
                badge: 'bg-mint-500',
                text: '测量',
              },
              other: {
                icon: <Calendar className="w-5 h-5" />,
                iconBg: 'bg-gray-500',
                badge: 'bg-gray-500',
                text: '其他',
              },
            }[reminder.type];

            const statusConfig = {
              active: { text: '待处理', color: 'bg-amber-100 text-amber-700' },
              completed: { text: '已完成', color: 'bg-mint-100 text-mint-700' },
              cancelled: { text: '已取消', color: 'bg-gray-100 text-gray-600' },
            }[reminder.status];

            return (
              <div
                key={reminder.id}
                className="bg-white rounded-2xl p-4 shadow-card border border-gray-50 hover:shadow-soft transition-shadow animate-slide-up"
                style={{ animationDelay: `${380 + idx * 60}ms` }}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl ${typeConfig.iconBg} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-gray-800">{reminder.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.text}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${typeConfig.badge}`}>
                        {typeConfig.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {reminder.date}
                      </span>
                      {reminder.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {reminder.time}
                        </span>
                      )}
                      {reminder.frequency !== 'once' && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                          {reminder.frequency === 'daily' ? '每日' : reminder.frequency === 'weekly' ? '每周' : '每月'}
                        </span>
                      )}
                    </div>
                    {reminder.note && (
                      <p className="text-xs text-gray-400 mb-3">{reminder.note}</p>
                    )}
                    <div className="flex gap-2">
                      {reminder.status === 'active' && (
                        <>
                          <button
                            onClick={() => completeReminder(reminder.id)}
                            className="flex-1 text-xs py-2 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            标记完成
                          </button>
                          <button className="flex-1 text-xs py-2 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors active:scale-[0.98]">
                            稍后提醒
                          </button>
                        </>
                      )}
                      {reminder.status === 'completed' && (
                        <div className="flex items-center gap-1 text-mint-600 text-sm font-medium">
                          <Check className="w-4 h-4" />
                          已完成
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {childReminders.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">暂无提醒事项</p>
            </div>
          )}
        </div>
      </div>

      <ModalSheet
        open={showHWForm}
        onClose={() => setShowHWForm(false)}
        title="记录健康数据"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">记录日期</label>
            <input
              type="date"
              value={hwForm.date}
              onChange={(e) => setHwForm({ ...hwForm, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
              <input
                type="number"
                value={hwForm.height}
                onChange={(e) => setHwForm({ ...hwForm, height: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={hwForm.weight}
                onChange={(e) => setHwForm({ ...hwForm, weight: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">头围 (cm)</label>
              <input
                type="number"
                step="0.1"
                value={hwForm.headCircumference}
                onChange={(e) => setHwForm({ ...hwForm, headCircumference: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">睡眠 (小时)</label>
              <input
                type="number"
                step="0.5"
                value={hwForm.sleepHours}
                onChange={(e) => setHwForm({ ...hwForm, sleepHours: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">饮水量 (ml)</label>
            <input
              type="number"
              step="50"
              value={hwForm.waterIntake}
              onChange={(e) => setHwForm({ ...hwForm, waterIntake: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none"
            />
          </div>
          <div className="pt-3 flex gap-3">
            <button
              onClick={() => setShowHWForm(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors active:scale-[0.98] flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" /> 取消
            </button>
            <button
              onClick={handleSubmitHW}
              className="flex-1 py-3 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors active:scale-[0.98] shadow-glow flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" /> 保存记录
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}
