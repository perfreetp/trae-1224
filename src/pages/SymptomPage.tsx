import { useState, useEffect } from 'react';
import {
  Thermometer,
  Wind,
  Droplets,
  Clock,
  Smile,
  Meh,
  Frown,
  Sun,
  Moon,
  ChevronRight,
  X,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useHealthStore,
  SymptomType,
  MentalState,
  CoughFrequency,
  SputumType,
  StoolType,
  DehydrationRisk,
  SymptomRecord,
} from '@/store/useHealthStore';
import { cn } from '@/lib/utils';

const symptomConfig = {
  fever: {
    emoji: '🤒',
    name: '发热',
    gradient: 'from-coral-400 to-orange-400',
    ring: 'rgba(255, 107, 107, 0.5)',
    bg: 'bg-coral-500/10',
    text: 'text-coral-500',
    border: 'border-coral-500/30',
    dot: 'bg-coral-500',
  },
  cough: {
    emoji: '😷',
    name: '咳嗽',
    gradient: 'from-sky2-400 to-blue-400',
    ring: 'rgba(69, 183, 209, 0.5)',
    bg: 'bg-sky2-500/10',
    text: 'text-sky2-500',
    border: 'border-sky2-500/30',
    dot: 'bg-sky2-500',
  },
  diarrhea: {
    emoji: '🤢',
    name: '腹泻',
    gradient: 'from-lemon-500 to-amber-400',
    ring: 'rgba(255, 230, 109, 0.5)',
    bg: 'bg-lemon-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
};

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours === 0) return `${minutes}分钟`;
  if (minutes === 0) return `${hours}小时`;
  return `${hours}小时${minutes}分钟`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = (now.getTime() - ts) / 86400000;
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diff < 1) return `今天 ${timeStr}`;
  if (diff < 2) return `昨天 ${timeStr}`;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${timeStr}`;
}

function SymptomButton({
  type,
  count,
  onClick,
}: {
  type: SymptomType;
  count: number;
  onClick: () => void;
}) {
  const config = symptomConfig[type];
  return (
    <button
      onClick={onClick}
      className="relative group flex flex-col items-center gap-3 transition-transform hover:scale-105 active:scale-95"
    >
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full animate-pulse-ring"
          style={{ backgroundColor: config.ring }}
        />
        <div
          className={cn(
            'relative w-28 h-28 rounded-full bg-gradient-to-br shadow-lg flex items-center justify-center',
            config.gradient
          )}
        >
          <span className="text-5xl drop-shadow-sm">{config.emoji}</span>
        </div>
        {count > 0 && (
          <div className="absolute -top-1 -right-1 min-w-7 h-7 px-2 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-white">
            <span className={cn('text-xs font-bold', config.text)}>{count}</span>
          </div>
        )}
      </div>
      <span className={cn('text-sm font-semibold', config.text)}>{config.name}</span>
    </button>
  );
}

function FeverForm({ onSubmit, onClose }: {
  onSubmit: (data: { temperature: number; measureTime: string; mentalState: MentalState; measures: string }) => void;
  onClose: () => void;
}) {
  const [temperature, setTemperature] = useState(37.5);
  const [measureTime, setMeasureTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [mentalState, setMentalState] = useState<MentalState>('normal');
  const [measures, setMeasures] = useState('');

  const mentalOptions: Array<{ value: MentalState; label: string; icon: any; color: string }> = [
    { value: 'good', label: '好', icon: Smile, color: 'text-green-500 bg-green-500/10 border-green-500/30' },
    { value: 'normal', label: '一般', icon: Meh, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { value: 'bad', label: '差', icon: Frown, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-coral-500" />
            体温
          </label>
          <span className={cn(
            'text-2xl font-bold',
            temperature >= 38.5 ? 'text-coral-500' : temperature >= 37.3 ? 'text-amber-500' : 'text-green-500'
          )}>
            {temperature.toFixed(1)}°C
          </span>
        </div>
        <input
          type="range"
          min={35}
          max={42}
          step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-green-400 via-amber-400 to-red-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>35°</span>
          <span className="text-amber-500">37.3°</span>
          <span className="text-coral-500">38.5°</span>
          <span>42°</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-sky2-500" />
          测量时间
        </label>
        <input
          type="time"
          value={measureTime}
          onChange={(e) => setMeasureTime(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500/50 transition-all"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-lavender-500" />
          精神状态
        </label>
        <div className="grid grid-cols-3 gap-3">
          {mentalOptions.map((opt) => {
            const Icon = opt.icon;
            const selected = mentalState === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setMentalState(opt.value)}
                className={cn(
                  'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                  selected ? opt.color + ' border-current scale-105' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-lemon-500" />
          处理措施
        </label>
        <textarea
          value={measures}
          onChange={(e) => setMeasures(e.target.value)}
          placeholder="如：物理降温、多喝水、服用退烧药..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500/50 transition-all resize-none text-sm"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit({ temperature, measureTime, mentalState, measures })}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-coral-400 to-orange-400 text-white font-semibold shadow-lg shadow-coral-500/30 hover:shadow-xl transition-all"
        >
          确认打卡
        </button>
      </div>
    </div>
  );
}

function CoughForm({ onSubmit, onClose }: {
  onSubmit: (data: { frequency: CoughFrequency; sputum: SputumType; worseAtNight: boolean }) => void;
  onClose: () => void;
}) {
  const [frequency, setFrequency] = useState<CoughFrequency>('occasional');
  const [sputum, setSputum] = useState<SputumType>('none');
  const [worseAtNight, setWorseAtNight] = useState(false);

  const freqOptions: Array<{ value: CoughFrequency; label: string; desc: string }> = [
    { value: 'occasional', label: '偶尔', desc: '一天<5次' },
    { value: 'frequent', label: '频繁', desc: '每小时都有' },
    { value: 'severe', label: '剧烈', desc: '影响睡眠' },
  ];

  const sputumOptions: Array<{ value: SputumType; label: string; color: string }> = [
    { value: 'none', label: '无痰', color: 'text-sky2-500 bg-sky2-500/10 border-sky2-500/30' },
    { value: 'white', label: '有痰', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
    { value: 'yellow', label: '黄痰', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Wind className="w-4 h-4 text-sky2-500" />
          咳嗽频率
        </label>
        <div className="grid grid-cols-3 gap-3">
          {freqOptions.map((opt) => {
            const selected = frequency === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={cn(
                  'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                  selected
                    ? 'border-sky2-500 bg-sky2-500/10 text-sky2-500 scale-105'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                )}
              >
                <span className="font-bold">{opt.label}</span>
                <span className="text-xs opacity-70">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Droplets className="w-4 h-4 text-blue-500" />
          痰液情况
        </label>
        <div className="grid grid-cols-3 gap-3">
          {sputumOptions.map((opt) => {
            const selected = sputum === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSputum(opt.value)}
                className={cn(
                  'p-3 rounded-2xl border-2 flex items-center justify-center font-semibold transition-all',
                  selected ? opt.color + ' border-current scale-105' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        onClick={() => setWorseAtNight(!worseAtNight)}
        className={cn(
          'p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all',
          worseAtNight
            ? 'border-indigo-500/50 bg-indigo-500/10'
            : 'border-gray-200 bg-white hover:border-gray-300'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            worseAtNight ? 'bg-indigo-500/20 text-indigo-500' : 'bg-gray-100 text-gray-400'
          )}>
            {worseAtNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-semibold text-gray-700">夜间加重</div>
            <div className="text-xs text-gray-400">晚上比白天咳嗽更明显</div>
          </div>
        </div>
        <div className={cn(
          'w-12 h-7 rounded-full relative transition-colors',
          worseAtNight ? 'bg-indigo-500' : 'bg-gray-200'
        )}>
          <div className={cn(
            'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform',
            worseAtNight ? 'translate-x-5' : 'translate-x-0.5'
          )} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit({ frequency, sputum, worseAtNight })}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-sky2-400 to-blue-400 text-white font-semibold shadow-lg shadow-sky2-500/30 hover:shadow-xl transition-all"
        >
          确认打卡
        </button>
      </div>
    </div>
  );
}

function DiarrheaForm({ onSubmit, onClose }: {
  onSubmit: (data: { timesPerDay: number; stoolType: StoolType; dehydrationRisk: DehydrationRisk }) => void;
  onClose: () => void;
}) {
  const [timesPerDay, setTimesPerDay] = useState(3);
  const [stoolType, setStoolType] = useState<StoolType>('watery');
  const risk: DehydrationRisk = timesPerDay >= 6 ? 'severe' : timesPerDay >= 3 ? 'moderate' : timesPerDay >= 1 ? 'mild' : 'none';

  const stoolOptions: Array<{ value: StoolType; label: string; emoji: string; color: string }> = [
    { value: 'watery', label: '稀水状', emoji: '💧', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
    { value: 'loose', label: '糊状', emoji: '🟫', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { value: 'bloody', label: '带血', emoji: '🩸', color: 'text-coral-500 bg-coral-500/10 border-coral-500/30' },
  ];

  const riskConfig = {
    none: { label: '无风险', color: 'text-green-500 bg-green-500/10 border-green-500', desc: '保持正常饮水' },
    mild: { label: '低风险', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500', desc: '注意补充水分' },
    moderate: { label: '中风险', color: 'text-amber-500 bg-amber-500/10 border-amber-500', desc: '建议口服补液盐' },
    severe: { label: '高风险', color: 'text-coral-500 bg-coral-500/10 border-coral-500', desc: '建议及时就医' },
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            每日次数
          </label>
          <span className="text-2xl font-bold text-amber-500">{timesPerDay} 次</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={timesPerDay}
          onChange={(e) => setTimesPerDay(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-green-400 via-amber-400 to-red-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1</span>
          <span>3</span>
          <span>6</span>
          <span>10+</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-lemon-500" />
          粪便性状
        </label>
        <div className="grid grid-cols-3 gap-3">
          {stoolOptions.map((opt) => {
            const selected = stoolType === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStoolType(opt.value)}
                className={cn(
                  'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                  selected ? opt.color + ' border-current scale-105' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-xs font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn(
        'p-4 rounded-2xl border-2',
        riskConfig[risk].color
      )}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-current/15">
            {riskConfig[risk].label}
          </span>
        </div>
        <div className="text-sm text-gray-600">{riskConfig[risk].desc}</div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit({ timesPerDay, stoolType, dehydrationRisk: risk })}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-lemon-500 to-amber-400 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
        >
          确认打卡
        </button>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, color }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className={cn('px-6 py-5 border-b border-gray-100 flex items-center justify-between', color + ' bg-opacity-5')}>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ActiveSymptomCard({ record }: { record: SymptomRecord }) {
  const config = symptomConfig[record.type];
  const [elapsed, setElapsed] = useState(Date.now() - (record.startTime || record.timestamp));
  const resolveSymptom = useHealthStore((s) => s.resolveSymptom);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Date.now() - (record.startTime || record.timestamp));
    }, 60000);
    return () => clearInterval(t);
  }, [record.startTime, record.timestamp]);

  return (
    <div className={cn(
      'p-5 rounded-3xl border-2 shadow-soft animate-bounce-soft',
      config.border,
      config.bg
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
          config.gradient
        )}>
          <span className="text-3xl">{config.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('font-bold text-lg', config.text)}>{config.name}进行中</span>
            <span className={cn(
              'w-2.5 h-2.5 rounded-full animate-pulse',
              config.dot
            )} />
          </div>
          <div className="text-sm text-gray-500 mb-2">
            已持续 <span className="font-bold text-gray-700">{formatDuration(elapsed)}</span>
          </div>
          {record.type === 'fever' && record.fever && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-white/80 text-coral-600 font-semibold">
                {record.fever.temperature.toFixed(1)}°C
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/80 text-gray-600">
                精神{record.fever.mentalState === 'good' ? '好' : record.fever.mentalState === 'normal' ? '一般' : '差'}
              </span>
            </div>
          )}
          {record.type === 'cough' && record.cough && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-white/80 text-sky2-600 font-semibold">
                {record.cough.frequency === 'occasional' ? '偶尔' : record.cough.frequency === 'frequent' ? '频繁' : '剧烈'}
              </span>
              {record.cough.worseAtNight && (
                <span className="px-2.5 py-1 rounded-full bg-white/80 text-indigo-600">夜间加重</span>
              )}
            </div>
          )}
          {record.type === 'diarrhea' && record.diarrhea && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-white/80 text-amber-600 font-semibold">
                {record.diarrhea.timesPerDay}次/日
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => resolveSymptom(record.id, false)}
          className={cn(
            'flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]',
            'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md shadow-green-500/30'
          )}
        >
          <CheckCircle className="w-4 h-4" />
          好转
        </button>
        <button
          onClick={() => resolveSymptom(record.id, true)}
          className={cn(
            'flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]',
            'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
          )}
        >
          <Sparkles className="w-4 h-4" />
          痊愈
        </button>
      </div>
    </div>
  );
}

export default function SymptomPage() {
  const allSymptomRecords = useHealthStore((s) => s.symptomRecords);
  const addSymptomRecord = useHealthStore((s) => s.addSymptomRecord);
  const selectedChildId = useHealthStore((s) => s.selectedChildId);
  const [modalType, setModalType] = useState<SymptomType | null>(null);

  const childId = selectedChildId || 'child-1';
  const symptomRecords = allSymptomRecords.filter((r) => r.childId === childId);

  const now = Date.now();
  const counts = {
    fever: symptomRecords.filter((r) => r.type === 'fever' && now - r.timestamp < 86400000).length,
    cough: symptomRecords.filter((r) => r.type === 'cough' && now - r.timestamp < 86400000).length,
    diarrhea: symptomRecords.filter((r) => r.type === 'diarrhea' && now - r.timestamp < 86400000).length,
  };

  const activeSymptoms = symptomRecords.filter((r) => r.active);

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (6 - i) * 86400000;
    const dayEnd = dayStart + 86400000;
    const dayRecords = symptomRecords.filter((r) => r.timestamp >= dayStart && r.timestamp < dayEnd);
    return {
      name: ['一', '二', '三', '四', '五', '六', '日'][(new Date(dayStart).getDay() + 6) % 7],
      发热: dayRecords.filter((r) => r.type === 'fever').length,
      咳嗽: dayRecords.filter((r) => r.type === 'cough').length,
      腹泻: dayRecords.filter((r) => r.type === 'diarrhea').length,
    };
  });

  function handleSubmit(type: SymptomType, data: any) {
    const base: Omit<SymptomRecord, 'id'> = {
      type,
      timestamp: Date.now(),
      active: true,
      startTime: Date.now(),
      childId: childId,
      resolved: false,
    };
    if (type === 'fever') base.fever = data;
    if (type === 'cough') base.cough = { ...data, mentalState: 'good', measures: '' };
    if (type === 'diarrhea') base.diarrhea = { ...data, mentalState: 'good', measures: '' };
    addSymptomRecord(base as SymptomRecord);
    setModalType(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-mint-50 pb-8">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-white to-white/80 backdrop-blur-lg px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-7 h-7 text-coral-500" />
              症状打卡
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">快速记录孩子的身体状况</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-coral-400 to-orange-400 flex items-center justify-center shadow-lg shadow-coral-500/30">
            <span className="text-xl">👦</span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-card">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-5">快速打卡</h2>
          <div className="flex justify-around items-start">
            <SymptomButton type="fever" count={counts.fever} onClick={() => setModalType('fever')} />
            <SymptomButton type="cough" count={counts.cough} onClick={() => setModalType('cough')} />
            <SymptomButton type="diarrhea" count={counts.diarrhea} onClick={() => setModalType('diarrhea')} />
          </div>
        </div>

        {activeSymptoms.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1">
              当前活跃
            </h2>
            {activeSymptoms.map((r) => (
              <ActiveSymptomCard key={r.id} record={r} />
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-mint-500" />
              7天趋势
            </h2>
            <span className="text-xs text-gray-400">每日发作次数</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="发热" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="咳嗽" fill="#45B7D1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="腹泻" fill="#FFE66D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded-sm bg-coral-500" /> 发热
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded-sm bg-sky2-500" /> 咳嗽
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-3 rounded-sm bg-amber-400" /> 腹泻
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1 mb-4">
            打卡记录
          </h2>
          <div className="space-y-3">
            {symptomRecords.map((r) => {
              const config = symptomConfig[r.type];
              const content =
                r.type === 'fever' && r.fever
                  ? `体温${r.fever.temperature.toFixed(1)}°C`
                  : r.type === 'cough' && r.cough
                  ? `${r.cough.frequency === 'occasional' ? '偶尔' : r.cough.frequency === 'frequent' ? '频繁' : '剧烈'}咳嗽`
                  : r.type === 'diarrhea' && r.diarrhea
                  ? `每日${r.diarrhea.timesPerDay}次`
                  : '';
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 animate-fade-in"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                    config.gradient
                  )}>
                    <span className="text-xl">{config.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-sm">{config.name}</span>
                      {r.active && (
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full animate-pulse',
                          config.dot
                        )} />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 truncate">{content}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(r.timestamp)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modalType === 'fever' && (
        <Modal title="🤒 发热打卡" onClose={() => setModalType(null)} color="bg-coral-500">
          <FeverForm
            onSubmit={(d) => handleSubmit('fever', d)}
            onClose={() => setModalType(null)}
          />
        </Modal>
      )}
      {modalType === 'cough' && (
        <Modal title="😷 咳嗽打卡" onClose={() => setModalType(null)} color="bg-sky2-500">
          <CoughForm
            onSubmit={(d) => handleSubmit('cough', d)}
            onClose={() => setModalType(null)}
          />
        </Modal>
      )}
      {modalType === 'diarrhea' && (
        <Modal title="🤢 腹泻打卡" onClose={() => setModalType(null)} color="bg-amber-500">
          <DiarrheaForm
            onSubmit={(d) => handleSubmit('diarrhea', d)}
            onClose={() => setModalType(null)}
          />
        </Modal>
      )}
    </div>
  );
}
