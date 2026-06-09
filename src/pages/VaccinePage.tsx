import { useState, useEffect } from 'react'
import {
  Syringe,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Clock,
  MapPin,
  Factory,
  Tag,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  Bell,
  Shield,
  AlertCircle,
  FileText,
  Camera,
  Timer,
  Activity,
  Ban,
  Pause,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHealthStore, type Vaccine } from '@/store/useHealthStore'

const statusConfig = {
  completed: {
    label: '已接种',
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle2,
  },
  pending: {
    label: '待接种',
    bg: 'bg-sky2-100',
    text: 'text-sky2-700',
    border: 'border-sky2-200',
    icon: Clock,
  },
  overdue: {
    label: '已逾期',
    bg: 'bg-coral-100',
    text: 'text-coral-600',
    border: 'border-coral-400',
    icon: AlertTriangle,
  },
  scheduled: {
    label: '预约中',
    bg: 'bg-lavender-300',
    text: 'text-purple-700',
    border: 'border-lavender-400',
    icon: CalendarDays,
  },
  contraindicated: {
    label: '禁忌接种',
    bg: 'bg-gray-200',
    text: 'text-gray-600',
    border: 'border-gray-300',
    icon: Ban,
  },
  deferred: {
    label: '暂缓接种',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
    icon: Pause,
  },
}

function CircularProgress({ value, max, size = 160, strokeWidth = 14 }: { value: number; max: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / max) * circumference
  const offset = circumference - progress
  const pct = Math.round((value / max) * 100)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ECDC4" />
            <stop offset="100%" stopColor="#45B7D1" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold bg-gradient-to-r from-mint-500 to-sky2-500 bg-clip-text text-transparent">{pct}%</span>
        <span className="text-xs text-gray-500 mt-1 font-medium">{value}/{max}</span>
      </div>
    </div>
  )
}

function ObservationTimer({ duration, startTime }: { duration: number; startTime: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const calc = () => {
      const start = new Date(startTime).getTime()
      const now = Date.now()
      const diff = Math.max(0, Math.floor((now - start) / 1000))
      setElapsed(Math.min(diff, duration * 60))
    }
    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [startTime, duration])

  const totalSec = duration * 60
  const remaining = Math.max(0, totalSec - elapsed)
  const min = Math.floor(remaining / 60)
  const sec = remaining % 60
  const progress = elapsed / totalSec

  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#FFE66D" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#FEF3C7" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#timerGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Timer className="w-5 h-5 text-coral-500 mb-1" />
        <span className="text-xl font-bold text-gray-800">
          {min.toString().padStart(2, '0')}:{sec.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

function AppointmentModal({
  isOpen,
  onClose,
  vaccine,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  vaccine: Vaccine | null
  onSubmit: (data: { location: string; date: string; timeSlot: string }) => void
}) {
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')

  useEffect(() => {
    if (isOpen) {
      setLocation('')
      setDate('')
      setTimeSlot('')
    }
  }, [isOpen])

  if (!isOpen || !vaccine) return null

  const locations = ['社区卫生服务中心', '市妇幼保健院', '儿童医院', '区人民医院']
  const timeSlots = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">预约接种</h3>
            <p className="text-sm text-gray-500 mt-0.5">{vaccine.name} · {vaccine.dose}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-mint-500" />
              接种点
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">请选择接种点</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-sky2-500" />
              接种日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-lavender-500" />
              时间段
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeSlot(t)}
                  className={cn(
                    'py-2.5 px-2 rounded-xl text-xs font-medium transition-all border',
                    timeSlot === t
                      ? 'bg-mint-500 text-white border-mint-500 shadow-md shadow-mint-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-mint-300 hover:text-mint-600'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button
            onClick={() => location && date && timeSlot && onSubmit({ location, date, timeSlot })}
            disabled={!location || !date || !timeSlot}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white font-bold shadow-lg shadow-mint-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            确认预约
          </button>
        </div>
      </div>
    </div>
  )
}

function VaccineCard({ vaccine, onAppointment, onCatchUp }: { vaccine: Vaccine; onAppointment: (v: Vaccine) => void; onCatchUp: (v: Vaccine) => void }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[vaccine.status]
  const StatusIcon = cfg.icon
  const isOverdue = vaccine.status === 'overdue'

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 bg-white shadow-card overflow-hidden transition-all duration-300 animate-slide-up',
        isOverdue ? 'border-coral-400 bg-gradient-to-br from-coral-50 to-white' : 'border-gray-100 hover:shadow-soft hover:-translate-y-0.5'
      )}
    >
      {isOverdue && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-coral-400/20 to-transparent rounded-bl-full pointer-events-none" />
      )}
      <div className="p-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-gray-900 truncate">{vaccine.name}</h4>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1', cfg.bg, cfg.text)}>
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Syringe className="w-3.5 h-3.5" />
              {vaccine.dose} · 计划 {vaccine.plannedDate}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {vaccine.status === 'completed' && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-md shadow-green-200">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            )}
            {vaccine.status === 'pending' && (
              <button
                onClick={(e) => { e.stopPropagation(); onAppointment(vaccine) }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky2-400 to-sky2-500 text-white text-sm font-semibold shadow-md shadow-sky2-200 active:scale-95 transition-transform"
              >
                预约
              </button>
            )}
            {isOverdue && (
              <button
                onClick={(e) => { e.stopPropagation(); onCatchUp(vaccine) }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 text-white text-sm font-semibold shadow-md shadow-coral-200 active:scale-95 transition-transform flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                补种
              </button>
            )}
            {vaccine.status === 'scheduled' && (
              <div className="px-3 py-1.5 rounded-xl bg-lavender-400/20 text-purple-700 text-xs font-semibold border border-lavender-400">
                <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
                已预约
              </div>
            )}
            {vaccine.status === 'contraindicated' && (
              <div className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-600 text-xs font-semibold border border-gray-300">
                <Ban className="w-3.5 h-3.5 inline mr-1" />禁忌
              </div>
            )}
            {vaccine.status === 'deferred' && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-300">
                <Pause className="w-3.5 h-3.5 inline mr-1" />暂缓
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end">
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            {expanded ? '收起' : '查看详情'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50/50 animate-fade-in space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-coral-500 shrink-0" />
              <div>
                <p className="text-gray-400">接种部位</p>
                <p className="font-semibold text-gray-700">{vaccine.site || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <Factory className="w-3.5 h-3.5 text-sky2-500 shrink-0" />
              <div>
                <p className="text-gray-400">生产厂家</p>
                <p className="font-semibold text-gray-700 truncate">{vaccine.manufacturer || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <Tag className="w-3.5 h-3.5 text-lemon-500 shrink-0" />
              <div>
                <p className="text-gray-400">批号</p>
                <p className="font-semibold text-gray-700 truncate">{vaccine.batchNumber || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
              <Building2 className="w-3.5 h-3.5 text-lavender-500 shrink-0" />
              <div>
                <p className="text-gray-400">接种单位</p>
                <p className="font-semibold text-gray-700 truncate">{vaccine.unit || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VaccinePage() {
  const { vaccines, observationRecords, vaccineReminders: reminders, addAppointment, setVaccineStatus, setReminder, completeObservation } = useHealthStore()
  const [appointmentVaccine, setAppointmentVaccine] = useState<Vaccine | null>(null)
  const [selectedReactions, setSelectedReactions] = useState<string[]>([])
  const [showReactionForm, setShowReactionForm] = useState(false)

  const totalVaccines = vaccines.length
  const completedCount = vaccines.filter((v) => v.status === 'completed').length
  const overdueCount = vaccines.filter((v) => v.status === 'overdue').length
  const scheduledCount = vaccines.filter((v) => v.status === 'scheduled').length
  const pendingCount = vaccines.filter((v) => v.status === 'pending').length
  const contraindicatedCount = vaccines.filter((v) => v.status === 'contraindicated').length
  const deferredCount = vaccines.filter((v) => v.status === 'deferred').length
  const overdueVaccines = vaccines.filter((v) => v.status === 'overdue')

  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()
  const monthPending = vaccines.filter((v) => {
    if (v.status !== 'pending') return false
    const d = new Date(v.plannedDate)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).length
  const monthCompleted = vaccines.filter((v) => {
    if (!v.completedDate) return false
    const d = new Date(v.completedDate)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).length

  const ageGroups = [...new Set(vaccines.map((v) => v.ageGroup))]
  const activeObservation = observationRecords.find((r) => !r.completed)
  const reactionOptions = ['皮疹', '发热', '哭闹不止', '食欲不振', '局部红肿', '嗜睡', '呕吐', '腹泻']

  const handleAppointment = (v: Vaccine) => setAppointmentVaccine(v)
  const handleCatchUp = (v: Vaccine) => setAppointmentVaccine(v)
  const handleSubmitAppointment = (data: { location: string; date: string; timeSlot: string }) => {
    if (!appointmentVaccine) return
    addAppointment({ vaccineId: appointmentVaccine.id, ...data })
    setAppointmentVaccine(null)
  }

  const handleSetAllReminders = () => {
    overdueVaccines.forEach((v) => setReminder(v.id))
  }

  const handleFinishObservation = () => {
    if (activeObservation) {
      completeObservation(activeObservation.vaccineId, selectedReactions)
      setSelectedReactions([])
      setShowReactionForm(false)
    }
  }

  const isObservationComplete = activeObservation
    ? (Date.now() - new Date(activeObservation.startTime).getTime()) >= activeObservation.duration * 60 * 1000
    : false

  const stats = [
    { label: '本月待接种', value: monthPending, icon: CalendarDays, gradient: 'from-sky2-400 to-sky2-500', bg: 'bg-sky2-50', iconBg: 'bg-sky2-100' },
    { label: '本月已完成', value: monthCompleted, icon: CheckCircle2, gradient: 'from-green-400 to-green-500', bg: 'bg-green-50', iconBg: 'bg-green-100' },
    { label: '需补种', value: overdueCount, icon: AlertTriangle, gradient: 'from-coral-400 to-coral-500', bg: 'bg-coral-50', iconBg: 'bg-coral-100' },
    { label: '预约中', value: scheduledCount, icon: Shield, gradient: 'from-lavender-400 to-purple-400', bg: 'bg-lavender-300/50', iconBg: 'bg-lavender-400/50' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-mint-50/30 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Syringe className="w-7 h-7 text-mint-500" />
              疫苗管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">守护宝宝的每一针健康</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-400 to-sky2-400 flex items-center justify-center shadow-glow">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft mb-5 bg-gradient-to-br from-white to-mint-50/50 animate-fade-in">
          <div className="flex items-center gap-6">
            <CircularProgress value={completedCount} max={totalVaccines} />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm text-gray-500">接种进度</p>
                <p className="font-bold text-gray-900 mt-0.5">已完成 {completedCount} 针</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-coral-50 border border-coral-200">
                <div className="w-9 h-9 rounded-xl bg-coral-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-coral-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">逾期提醒</p>
                  <p className="font-bold text-coral-600 text-sm">{overdueCount} 针需要补种</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={cn('rounded-2xl p-4 shadow-card bg-white animate-slide-up')} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.iconBg)}>
                    <Icon className={cn('w-5 h-5 bg-gradient-to-br', s.gradient, 'bg-clip-text text-transparent')} strokeWidth={2} />
                  </div>
                </div>
                <p className={cn('text-2xl font-bold bg-gradient-to-r', s.gradient, 'bg-clip-text text-transparent')}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        {activeObservation && (
          <div className="mb-5 rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200/60 p-5 shadow-soft animate-fade-in">
            <div className="flex items-start gap-4">
              <ObservationTimer duration={activeObservation.duration} startTime={activeObservation.startTime} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-coral-500" />
                  <h3 className="font-bold text-gray-900 text-sm">留观倒计时</h3>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {activeObservation.vaccineName}
                </p>
                {isObservationComplete ? (
                  !showReactionForm ? (
                    <button
                      onClick={() => setShowReactionForm(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white text-sm font-semibold shadow-md shadow-mint-200 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      记录观察结果
                    </button>
                  ) : (
                    <div className="space-y-3 animate-slide-up">
                      <p className="text-xs font-semibold text-gray-700">有无不良反应？（可多选）</p>
                      <div className="flex flex-wrap gap-2">
                        {reactionOptions.map((r) => (
                          <button
                            key={r}
                            onClick={() =>
                              setSelectedReactions((prev) =>
                                prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
                              )
                            }
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                              selectedReactions.includes(r)
                                ? 'bg-coral-500 text-white border-coral-500 shadow-md shadow-coral-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-coral-300'
                              )
                            }
                          >
                            {r}
                          </button>
                        ))}
                        <button
                          onClick={() => !selectedReactions.includes('无') && setSelectedReactions(['无'])}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                            selectedReactions.includes('无')
                              ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-200'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                          )}
                        >
                          无异常
                        </button>
                      </div>
                      <button
                        onClick={handleFinishObservation}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow-md shadow-green-200 active:scale-95 transition-transform"
                      >
                        提交记录
                      </button>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-100/70 px-3 py-2 rounded-lg flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    请在观察区等候，满30分钟再离开
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {overdueVaccines.length > 0 && (
          <div className="mb-5 rounded-3xl bg-gradient-to-br from-coral-50 via-red-50 to-orange-50 border-2 border-coral-300 p-5 shadow-soft animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-coral-600 animate-bounce-soft" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">补种提醒</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{overdueCount} 针已逾期，请尽快安排</p>
                </div>
              </div>
              <button
                onClick={handleSetAllReminders}
                className="px-3 py-1.5 rounded-xl bg-white text-coral-600 text-xs font-semibold shadow-sm border border-coral-200 active:scale-95 transition-transform flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                一键提醒
              </button>
            </div>
            <div className="space-y-2">
              {overdueVaccines.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-coral-200/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-coral-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.dose} · 计划 {v.plannedDate}</p>
                    </div>
                  </div>
                  {reminders.includes(v.id) && (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      已设提醒
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-mint-500" />
            接种时间表
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-mint-400 via-sky2-400 to-lavender-400" />
          <div className="space-y-5">
            {ageGroups.map((age, idx) => {
              const groupVaccines = vaccines.filter((v) => v.ageGroup === age)
              const allCompleted = groupVaccines.every((v) => v.status === 'completed')
              return (
                <div key={age} className="relative pl-11" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div
                    className={cn(
                      'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 border-4 border-white',
                      allCompleted
                        ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                        : groupVaccines.some((v) => v.status === 'overdue')
                        ? 'bg-gradient-to-br from-coral-400 to-coral-500 text-white'
                        : 'bg-gradient-to-br from-mint-400 to-sky2-400 text-white'
                    )}
                  >
                    {allCompleted ? <CheckCircle2 className="w-4 h-4" /> : age.length > 3 ? age[0] : age.slice(0, 2)}
                  </div>
                  <div className="mb-2">
                    <span className={cn(
                      'inline-block px-3 py-1 rounded-full text-xs font-bold',
                      allCompleted ? 'bg-green-100 text-green-700' :
                      groupVaccines.some(v => v.status === 'overdue') ? 'bg-coral-100 text-coral-700' :
                      'bg-mint-100 text-mint-700'
                    )}>
                      {age}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {groupVaccines.map((v) => (
                      <VaccineCard
                        key={v.id}
                        vaccine={v}
                        onAppointment={handleAppointment}
                        onCatchUp={handleCatchUp}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <AppointmentModal
        isOpen={!!appointmentVaccine}
        onClose={() => setAppointmentVaccine(null)}
        vaccine={appointmentVaccine}
        onSubmit={handleSubmitAppointment}
      />
    </div>
  )
}
