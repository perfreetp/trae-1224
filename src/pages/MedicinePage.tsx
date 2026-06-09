import { useState, useMemo } from 'react'
import {
  Pill,
  Droplets,
  Thermometer,
  Leaf,
  Wind,
  Plus,
  CheckCircle2,
  Clock,
  CalendarDays,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Camera,
  AlertCircle,
  FileText,
  Stethoscope,
  Beaker,
  Heart,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHealthStore, type MedicineDetailRecord } from '@/store/useHealthStore'

const iconMap: Record<string, typeof Pill> = {
  Pill,
  Droplets,
  Thermometer,
  Leaf,
  Wind,
  Stethoscope,
  Beaker,
  Heart,
}

function NextDoseRing({ nextTime, color }: { nextTime: string; color: string }) {
  const [remaining, setRemaining] = useState(() => {
    if (!nextTime) return 0
    const diff = new Date(nextTime).getTime() - Date.now()
    return Math.max(0, Math.min(diff, 24 * 60 * 60 * 1000))
  })

  useMemo(() => {
    if (!nextTime) return null
    const timer = setInterval(() => {
      const diff = new Date(nextTime).getTime() - Date.now()
      setRemaining(Math.max(0, Math.min(diff, 24 * 60 * 60 * 1000)))
    }, 60000)
    return () => clearInterval(timer)
  }, [nextTime])

  const totalMs = 24 * 60 * 60 * 1000
  const progress = remaining / totalMs
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

  const size = 76
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  if (!nextTime || remaining <= 0) {
    return (
      <div className="w-[76px] h-[76px] rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <Clock className="w-6 h-6 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F3F4F6" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-gray-800 leading-none">{hours}h</span>
        <span className="text-[9px] text-gray-500 leading-none mt-0.5">{mins}m</span>
      </div>
    </div>
  )
}

function AddMedicineModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<MedicineDetailRecord, 'id' | 'childId'>) => void
}) {
  const [step, setStep] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [perDose, setPerDose] = useState('')
  const [frequency, setFrequency] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timePoints, setTimePoints] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const commonMeds = [
    { name: '阿莫西林颗粒', category: '抗生素', color: '#FF8A80', icon: 'Pill' },
    { name: '头孢克洛干混悬剂', category: '抗生素', color: '#F06292', icon: 'Pill' },
    { name: '布洛芬混悬液', category: '解热镇痛', color: '#FFB74D', icon: 'Droplets' },
    { name: '对乙酰氨基酚滴剂', category: '解热镇痛', color: '#FFD54F', icon: 'Thermometer' },
    { name: '小儿氨酚黄那敏颗粒', category: '感冒用药', color: '#64C2E3', icon: 'Thermometer' },
    { name: '小儿感冒颗粒', category: '感冒用药', color: '#4FC3F7', icon: 'Stethoscope' },
    { name: '益生菌粉', category: '调节肠胃', color: '#81C784', icon: 'Leaf' },
    { name: '蒙脱石散', category: '调节肠胃', color: '#AED581', icon: 'Beaker' },
    { name: '复方甘草合剂', category: '止咳化痰', color: '#BA68C8', icon: 'Wind' },
    { name: '盐酸氨溴索口服溶液', category: '止咳化痰', color: '#CE93D8', icon: 'Droplets' },
    { name: '氯雷他定糖浆', category: '抗过敏', color: '#7986CB', icon: 'Heart' },
    { name: '维生素AD滴剂', category: '营养补充', color: '#FFD180', icon: 'Sparkles' },
  ]

  const filteredMeds = commonMeds.filter(
    (m) => m.name.includes(search) || m.category.includes(search)
  )

  const categories = [...new Set(commonMeds.map((m) => m.category))]
  const frequencies = ['每日1次', '每日2次', '每日3次', '每日4次', '按需']
  const defaultTimePoints: Record<string, string[]> = {
    '每日1次': ['08:00'],
    '每日2次': ['08:00', '20:00'],
    '每日3次': ['08:00', '14:00', '20:00'],
    '每日4次': ['06:00', '12:00', '18:00', '24:00'],
    '按需': ['必要时'],
  }

  const selectedMed = commonMeds.find((m) => m.name === name)

  const handleFrequencyChange = (f: string) => {
    setFrequency(f)
    setTimePoints(defaultTimePoints[f] || [])
  }

  const handleSubmit = () => {
    if (!name || !dosage || !perDose || !frequency || !startDate || !endDate) return
    const totalDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
    onSubmit({
      name,
      category: selectedCategory || selectedMed?.category || '其他',
      color: selectedMed?.color || '#90CAF9',
      icon: selectedMed?.icon || 'Pill',
      dosage: perDose,
      frequency,
      totalDays,
      takenDays: 0,
      nextDoseTime: frequency !== '按需' && timePoints.length > 0
        ? `${startDate} ${timePoints[0]}`
        : '',
      startDate,
      endDate,
      timePoints: timePoints.map((t) => ({ time: t, taken: false })),
      notes: notes || undefined,
      isActive: true,
    })
    onClose()
    setStep(1)
    setName('')
    setSearch('')
    setSelectedCategory('')
    setDosage('')
    setPerDose('')
    setFrequency('')
    setStartDate('')
    setEndDate('')
    setTimePoints([])
    setNotes('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {step === 1 ? '选择药品' : step === 2 ? '填写信息' : '设置时间'}
            </h3>
            <div className="flex items-center gap-1 mt-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all',
                    s <= step ? 'bg-gradient-to-r from-mint-400 to-sky2-400' : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索药品名称或类别..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(selectedCategory === c ? '' : c)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                      selectedCategory === c
                        ? 'bg-mint-500 text-white border-mint-500 shadow-md shadow-mint-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-mint-300'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(selectedCategory
                  ? filteredMeds.filter((m) => m.category === selectedCategory)
                  : filteredMeds
                ).map((m) => {
                  const IconComp = iconMap[m.icon] || Pill
                  return (
                    <button
                      key={m.name}
                      onClick={() => {
                        setName(m.name)
                        setSelectedCategory(m.category)
                        setStep(2)
                      }}
                      className={cn(
                        'p-3 rounded-2xl border-2 text-left transition-all hover:shadow-md',
                        name === m.name
                          ? 'border-mint-400 bg-mint-50 shadow-md shadow-mint-100'
                          : 'border-gray-100 bg-white hover:border-mint-200'
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                        style={{ backgroundColor: m.color + '20' }}
                      >
                        <IconComp className="w-5 h-5" style={{ color: m.color }} />
                      </div>
                      <p className="text-sm font-bold text-gray-800 truncate">{m.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.category}</p>
                    </button>
                  )
                })}
              </div>
              {name && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white font-bold shadow-lg shadow-mint-200 active:scale-[0.98] transition-all"
                >
                  下一步
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">药品名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入药品名称"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">剂量规格</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="如 0.125g/袋"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">每次用量</label>
                  <input
                    type="text"
                    value={perDose}
                    onChange={(e) => setPerDose(e.target.value)}
                    placeholder="如 1袋/4ml"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">服药频次</label>
                <div className="flex flex-wrap gap-2">
                  {frequencies.map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFrequencyChange(f)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                        frequency === f
                          ? 'bg-mint-500 text-white border-mint-500 shadow-md shadow-mint-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-mint-300'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold active:scale-[0.98] transition-all"
                >
                  上一步
                </button>
                <button
                  onClick={() => frequency && setStep(3)}
                  disabled={!name || !perDose || !frequency}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white font-bold shadow-lg shadow-mint-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <CalendarDays className="w-4 h-4 text-mint-500" />
                    开始日期
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <CalendarDays className="w-4 h-4 text-sky2-500" />
                    结束日期
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-lavender-500" />
                  服药时间点
                </label>
                <div className="flex flex-wrap gap-2">
                  {timePoints.map((t, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <input
                        type="time"
                        value={t === '必要时' ? '' : t}
                        onChange={(e) => {
                          const newTP = [...timePoints]
                          newTP[i] = e.target.value || '必要时'
                          setTimePoints(newTP)
                        }}
                        disabled={t === '必要时'}
                        className="px-3 py-2 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white text-sm disabled:bg-lavender-100 disabled:text-purple-700 disabled:font-semibold"
                      />
                      {timePoints.length > 1 && frequency !== '按需' && (
                        <button
                          onClick={() => setTimePoints(timePoints.filter((_, j) => j !== i))}
                          className="w-8 h-8 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {frequency !== '按需' && (
                    <button
                      onClick={() => setTimePoints([...timePoints, '08:00'])}
                      className="w-10 h-10 rounded-xl border-2 border-dashed border-mint-300 text-mint-500 flex items-center justify-center hover:bg-mint-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-lemon-500" />
                  备注说明
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="如：饭后服用、多喝水、避免空腹等"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold active:scale-[0.98] transition-all"
                >
                  上一步
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!startDate || !endDate || timePoints.length === 0}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white font-bold shadow-lg shadow-mint-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认添加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReactionModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { symptoms: string[]; date: string; severity: string; treatment: string }) => void
}) {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [severity, setSeverity] = useState('轻度')
  const [treatment, setTreatment] = useState('')

  const symptomOptions = ['皮疹', '呕吐', '嗜睡', '食欲不振', '腹泻', '发热', '头晕', '局部红肿', '哭闹不安', '呼吸困难']
  const severityOptions = [
    { label: '轻度', color: 'bg-green-100 text-green-700 border-green-300' },
    { label: '中度', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { label: '重度', color: 'bg-coral-100 text-coral-700 border-coral-300' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-coral-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">不良反应记录</h3>
              <p className="text-xs text-gray-500">请如实记录以便后续追踪</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">症状标签（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
                  }
                  className={cn(
                    'px-3.5 py-2 rounded-full text-sm font-medium transition-all border-2',
                    symptoms.includes(s)
                      ? 'bg-coral-500 text-white border-coral-500 shadow-md shadow-coral-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-coral-300 hover:text-coral-600'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">发生时间</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">严重程度</label>
            <div className="grid grid-cols-3 gap-2">
              {severityOptions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSeverity(s.label)}
                  className={cn(
                    'py-3 rounded-xl text-sm font-bold transition-all border-2',
                    severity === s.label
                      ? `${s.color} shadow-md`
                      : 'bg-gray-50 text-gray-500 border-gray-100'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">处理方式</label>
            <textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="如：停止服药、多喝水、就医、涂抹药膏等"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">上传照片</label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-mint-300 hover:bg-mint-50/30 transition-all cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-sm font-medium">点击上传照片</p>
              <p className="text-xs mt-0.5">支持 JPG、PNG 格式</p>
            </div>
          </div>
        </div>
        <div className="p-5 pt-0 shrink-0">
          <button
            onClick={() => symptoms.length > 0 && treatment && onSubmit({ symptoms, date, severity, treatment })}
            disabled={symptoms.length === 0 || !treatment}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-coral-500 to-orange-400 text-white font-bold shadow-lg shadow-coral-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            提交记录
          </button>
        </div>
      </div>
    </div>
  )
}

function MedicineCard({
  medicine,
  onTake,
  onAddReaction,
}: {
  medicine: MedicineDetailRecord
  onTake: (idx: number) => void
  onAddReaction: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const IconComp = iconMap[medicine.icon] || Pill
  const progressPct = Math.min(100, (medicine.takenDays / medicine.totalDays) * 100)

  return (
    <div className="rounded-3xl bg-white shadow-card overflow-hidden border border-gray-100 hover:shadow-soft transition-all animate-slide-up">
      <div className="p-5" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${medicine.color}, ${medicine.color}CC)`,
              boxShadow: `0 8px 20px ${medicine.color}40`,
            }}
          >
            <IconComp className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{medicine.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{medicine.category} · {medicine.frequency}</p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                style={{ backgroundColor: medicine.color + '20', color: medicine.color }}
              >
                {medicine.dosage}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">疗程进度</span>
                <span className="font-bold" style={{ color: medicine.color }}>
                  {medicine.takenDays}/{medicine.totalDays} 天
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${medicine.color}, ${medicine.color}AA)`,
                  }}
                />
              </div>
            </div>
          </div>
          {medicine.isActive && <NextDoseRing nextTime={medicine.nextDoseTime} color={medicine.color} />}
        </div>
        {medicine.isActive && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex-1 flex flex-wrap gap-2">
              {medicine.timePoints.slice(0, 3).map((tp, i) => (
                <span
                  key={i}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    tp.taken
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {tp.taken ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {tp.time}
                </span>
              ))}
              {medicine.timePoints.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-400">+{medicine.timePoints.length - 3}</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const nextIdx = medicine.timePoints.findIndex((t) => !t.taken)
                if (nextIdx >= 0) onTake(nextIdx)
              }}
              disabled={medicine.timePoints.every((t) => t.taken)}
              className="shrink-0 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              style={{
                background: `linear-gradient(135deg, ${medicine.color}, ${medicine.color}DD)`,
                boxShadow: `0 6px 16px ${medicine.color}40`,
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              服用打卡
            </button>
          </div>
        )}
        <div className="mt-3 flex items-center justify-end">
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            {expanded ? '收起' : '展开详情'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 p-5 pt-4 bg-gradient-to-b from-gray-50/50 to-white animate-fade-in space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: medicine.color }} />
              服药打卡记录
            </p>
            <div className="space-y-2">
              {medicine.timePoints.map((tp, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl',
                    tp.taken ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        tp.taken ? 'bg-green-400' : 'bg-gray-200'
                      )}
                    >
                      {tp.taken ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className={cn('text-sm font-semibold', tp.taken ? 'text-green-700' : 'text-gray-700')}>
                        {tp.time}
                      </p>
                      {tp.takenAt && (
                        <p className="text-xs text-gray-400">打卡于 {tp.takenAt.split('T')[1]?.slice(0, 5) || '-'}</p>
                      )}
                    </div>
                  </div>
                  {!tp.taken && medicine.isActive && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onTake(i) }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
                      style={{ background: medicine.color }}
                    >
                      打卡
                    </button>
                  )}
                  {tp.taken && (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      已完成
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {medicine.notes && (
            <div className="p-3 rounded-xl bg-warm-100 border border-amber-200/50">
              <p className="text-xs font-bold text-amber-700 mb-1">温馨提示</p>
              <p className="text-xs text-amber-800/80">{medicine.notes}</p>
            </div>
          )}
          {medicine.reactions && medicine.reactions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-coral-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                不良反应记录 ({medicine.reactions.length})
              </p>
              {medicine.reactions.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-coral-50 border border-coral-200/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex flex-wrap gap-1">
                      {r.symptoms.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-coral-100 text-coral-700 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-bold',
                        r.severity === '轻度' ? 'bg-green-100 text-green-700' :
                        r.severity === '中度' ? 'bg-amber-100 text-amber-700' :
                        'bg-coral-100 text-coral-700'
                      )}
                    >
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{r.date} · {r.treatment}</p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onAddReaction() }}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-coral-300 text-coral-600 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-coral-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加不良反应记录
          </button>
        </div>
      )}
    </div>
  )
}

export default function MedicinePage() {
  const { medicines, markMedicineTaken, addMedicine, addReaction } = useHealthStore()
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReactionModal, setShowReactionModal] = useState(false)
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null)
  const [collapsedMonths, setCollapsedMonths] = useState<string[]>([])

  const activeMeds = medicines.filter((m) => m.isActive)
  const historyMeds = medicines.filter((m) => !m.isActive)

  const historyByMonth = useMemo(() => {
    const groups: Record<string, MedicineDetailRecord[]> = {}
    historyMeds.forEach((m) => {
      const d = new Date(m.endDate)
      const key = `${d.getFullYear()}年${d.getMonth() + 1}月`
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    })
    return Object.entries(groups).sort((a, b) => {
      const [ya, ma] = a[0].match(/\d+/g)!.map(Number)
      const [yb, mb] = b[0].match(/\d+/g)!.map(Number)
      return yb * 12 + mb - (ya * 12 + ma)
    })
  }, [historyMeds])

  const toggleMonth = (m: string) =>
    setCollapsedMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))

  const handleTakeMedicine = (medicineId: string, timeIndex: number) => {
    markMedicineTaken(medicineId, timeIndex)
  }

  const handleAddReactionClick = (medicineId: string) => {
    setSelectedMedicineId(medicineId)
    setShowReactionModal(true)
  }

  const handleSubmitReaction = (data: { symptoms: string[]; date: string; severity: string; treatment: string }) => {
    if (selectedMedicineId) {
      addReaction(selectedMedicineId, data)
    }
    setShowReactionModal(false)
    setSelectedMedicineId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-sky2-50/30 pb-32">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Pill className="w-7 h-7 text-coral-500" />
              用药记录
            </h1>
            <p className="text-sm text-gray-500 mt-1">按时服药，早日康复</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-400 to-orange-400 flex items-center justify-center shadow-lg shadow-coral-200">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex p-1.5 rounded-2xl bg-gray-100 mb-5">
          {[
            { key: 'active' as const, label: '当前用药', count: activeMeds.length, icon: Pill },
            { key: 'history' as const, label: '历史用药', count: historyMeds.length, icon: FileText },
          ].map((t) => {
            const IconTab = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5',
                  tab === t.key
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <IconTab className="w-4 h-4" />
                {t.label}
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    tab === t.key ? 'bg-mint-100 text-mint-700' : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {t.count}
                </span>
              </button>
            )
          })}
        </div>

        {tab === 'active' && (
          <div className="space-y-4 pb-20">
            {activeMeds.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                  <Pill className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">暂无用药</p>
                <p className="text-sm text-gray-300 mt-1">点击右下角按钮添加</p>
              </div>
            ) : (
              activeMeds.map((m, i) => (
                <div key={m.id} style={{ animationDelay: `${i * 80}ms` }}>
                  <MedicineCard
                    medicine={m}
                    onTake={(idx) => handleTakeMedicine(m.id, idx)}
                    onAddReaction={() => handleAddReactionClick(m.id)}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-5 pb-20">
            {historyByMonth.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">暂无历史记录</p>
              </div>
            ) : (
              historyByMonth.map(([month, meds]) => {
                const collapsed = collapsedMonths.includes(month)
                return (
                  <div key={month} className="animate-fade-in">
                    <button
                      onClick={() => toggleMonth(month)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white shadow-card border border-gray-100 mb-3 active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-400 to-purple-400 flex items-center justify-center shadow-md shadow-lavender-200">
                          <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">{month}</p>
                          <p className="text-xs text-gray-400">{meds.length} 种药物</p>
                        </div>
                      </div>
                      <div className={cn('transition-transform', collapsed ? '' : 'rotate-180')}>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                    {!collapsed && (
                      <div className="space-y-3 pl-2 animate-slide-up">
                        {meds.map((m, i) => (
                          <div key={m.id} style={{ animationDelay: `${i * 60}ms` }}>
                            <MedicineCard
                              medicine={m}
                              onTake={() => {}}
                              onAddReaction={() => handleAddReactionClick(m.id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-mint-400 to-sky2-500 shadow-xl shadow-mint-300/50 flex items-center justify-center active:scale-90 transition-all z-40 group"
        style={{ animation: 'float 3s ease-in-out infinite' }}
      >
        <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral-500 border-2 border-white animate-pulse-ring" />
      </button>

      <AddMedicineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(data) => addMedicine(data)}
      />
      <ReactionModal
        isOpen={showReactionModal}
        onClose={() => {
          setShowReactionModal(false)
          setSelectedMedicineId(null)
        }}
        onSubmit={handleSubmitReaction}
      />
    </div>
  )
}
