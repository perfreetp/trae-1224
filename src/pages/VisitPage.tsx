import { useState } from 'react';
import {
  Search,
  Calendar,
  Hospital,
  User,
  FileText,
  Pill,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Image,
  Maximize2,
  ClipboardList,
  Star,
  DollarSign,
  TrendingUp,
  PlusCircle,
  Trash2,
  ImagePlus,
  Share2,
  Bell,
  MapPin,
} from 'lucide-react';
import {
  useHealthStore,
  VisitRecord,
} from '@/store/useHealthStore';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'cold' | 'fever' | 'checkup' | 'other';

const categoryConfig: Record<string, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  cold: { label: '感冒', color: 'text-sky2-500', bg: 'bg-sky2-500/10', border: 'border-sky2-500/30', emoji: '🤧' },
  fever: { label: '发烧', color: 'text-coral-500', bg: 'bg-coral-500/10', border: 'border-coral-500/30', emoji: '🤒' },
  checkup: { label: '体检', color: 'text-mint-500', bg: 'bg-mint-500/10', border: 'border-mint-500/30', emoji: '🩺' },
  other: { label: '其他', color: 'text-lavender-500', bg: 'bg-lavender-500/20', border: 'border-lavender-500/30', emoji: '💊' },
};

const filterLabels: Record<FilterType, string> = {
  all: '全部',
  cold: '感冒',
  fever: '发烧',
  checkup: '体检',
  other: '其他',
};

function VisitCard({ record }: { record: VisitRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const categoryKey = record.category || 'other';
  const cat = categoryConfig[categoryKey];
  const displayDate = record.date || record.visitDate || '--';
  const safePrescriptions = Array.isArray(record.prescriptions)
    ? record.prescriptions.map((p) =>
        typeof p === 'string' ? { name: p, dosage: '请遵医嘱', frequency: '按说明' } : p
      )
    : [];
  const displayChiefComplaint = record.chiefComplaint || (record.symptoms?.join('、') ?? '暂无描述');
  const displayDiagnosis = record.diagnosis || '详见病历资料';
  const displayDoctor = record.doctor || '--';
  const displayImages = record.images || [];

  const imageGradients = [
    'from-pink-400 to-rose-400',
    'from-blue-400 to-cyan-400',
    'from-purple-400 to-indigo-400',
    'from-amber-400 to-orange-400',
  ];
  const imageIcons = ['📋', '🩸', '💊', '📊'];

  return (
    <div className="bg-white rounded-3xl shadow-card overflow-hidden animate-fade-in">
      <div className={cn('px-5 py-3 flex items-center justify-between border-b', cat.bg, cat.border, 'border-opacity-50')}>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            cat.bg
          )}>
            <span className="text-lg">{cat.emoji}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-sm">{displayDate}</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold',
                cat.bg,
                cat.color
              )}>
                {cat.label}
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {record.hospital} · {record.department}
            </div>
          </div>
        </div>
        {record.expense !== undefined && (
          <div className="text-right">
            <div className="text-xs text-gray-400">支出</div>
            <div className="font-bold text-coral-500">¥{record.expense}</div>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-lavender-500/15 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-lavender-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400">主治医生</div>
            <div className="font-semibold text-gray-700 text-sm">{displayDoctor}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <ClipboardList className="w-3 h-3" />
            主诉
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
            {displayChiefComplaint}
          </div>
        </div>

        {!expanded && (
          <div
            onClick={() => setExpanded(true)}
            className="cursor-pointer group"
          >
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              诊断摘要
            </div>
            <div className="relative">
              <p className="text-sm text-gray-600 line-clamp-2">
                {displayDiagnosis}
              </p>
              <div className="flex items-center gap-1 mt-2 text-mint-500 text-sm font-semibold group-hover:gap-2 transition-all">
                展开详情
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {expanded && (
          <div className="animate-slide-up space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  完整诊断
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-gray-400 flex items-center gap-1 text-xs"
                >
                  收起
                  <ChevronUp className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed bg-mint-500/5 rounded-xl px-4 py-3 border border-mint-500/10">
                {displayDiagnosis}
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Pill className="w-3 h-3" />
                处方用药
              </div>
              <div className="space-y-2">
                {safePrescriptions.length > 0 ? safePrescriptions.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-lemon-500/5 border border-lemon-500/10"
                  >
                    <div className="w-10 h-10 rounded-xl bg-lemon-500/15 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-700 text-sm">{p.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="text-amber-600 font-medium">{p.dosage}</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        {p.frequency}
                      </div>
                    </div>
                  </div>
                )) : null}
              </div>
            </div>

            {record.nextVisitDate && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-coral-500/10 to-orange-500/10 border border-coral-500/20">
                <div className="w-11 h-11 rounded-xl bg-coral-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-coral-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500">下次复诊</div>
                  <div className="font-bold text-gray-800 text-sm">{record.nextVisitDate}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {displayImages.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Image className="w-3 h-3" />
              病历资料 ({displayImages.length})
            </div>
            <div className={cn(
              'grid gap-2',
              displayImages.length === 1 ? 'grid-cols-1' :
              displayImages.length === 2 ? 'grid-cols-2' :
              'grid-cols-3'
            )}>
              {displayImages.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setPreviewImage(img)}
                  className={cn(
                    'relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm',
                    'bg-gradient-to-br',
                    imageGradients[i % imageGradients.length]
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl drop-shadow">{imageIcons[i % imageIcons.length]}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in p-6"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full aspect-square rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br',
              imageGradients[displayImages.indexOf(previewImage) % imageGradients.length]
            )}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl drop-shadow-2xl">
                  {imageIcons[displayImages.indexOf(previewImage) % imageIcons.length]}
                </span>
              </div>
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
              <div className="text-white font-bold text-lg">病历资料</div>
              <div className="text-white/70 text-sm mt-1">{record.hospital} · {displayDate}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddVisitModal({ onClose }: { onClose: () => void }) {
  const addVisitRecord = useHealthStore((s) => s.addVisitRecord);
  const selectedChildId = useHealthStore((s) => s.selectedChildId);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    visitDate: new Date().toISOString().split('T')[0],
    hospital: '',
    department: '',
    doctor: '',
    chiefComplaint: '',
    diagnosis: '',
    category: 'other' as VisitRecord['category'],
    nextVisitDate: '',
    symptoms: [] as string[],
    childId: '',
  });
  const [prescriptions, setPrescriptions] = useState<Array<{ name: string; dosage: string; frequency: string }>>([
    { name: '', dosage: '', frequency: '' },
  ]);
  const [images, setImages] = useState<string[]>(['img1', 'img2']);

  function addPrescription() {
    setPrescriptions([...prescriptions, { name: '', dosage: '', frequency: '' }]);
  }

  function removePrescription(i: number) {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== i));
  }

  function updatePrescription(i: number, field: string, val: string) {
    setPrescriptions(prescriptions.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
  }

  function handleSubmit() {
    const validPrescriptions = prescriptions.filter((p) => p.name.trim());
    addVisitRecord({
      ...form,
      visitDate: form.visitDate || form.date,
      childId: selectedChildId || form.childId || 'child-1',
      symptoms: form.chiefComplaint ? [form.chiefComplaint] : [],
      prescriptions: validPrescriptions.length > 0 ? validPrescriptions : [],
      images,
    } as Omit<VisitRecord, 'id'>);
    onClose();
  }

  const imgGradients = [
    'from-pink-400 to-rose-400',
    'from-blue-400 to-cyan-400',
    'from-purple-400 to-indigo-400',
    'from-amber-400 to-orange-400',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-mint-500/10 to-sky2-500/10 px-6 py-5 border-b border-gray-100 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-mint-500" />
            新增就诊记录
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                就诊日期
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">分类</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
              >
                {Object.entries(categoryConfig).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
              <Hospital className="w-3 h-3" />
              医院
            </label>
            <input
              type="text"
              value={form.hospital}
              onChange={(e) => setForm({ ...form, hospital: e.target.value })}
              placeholder="如：市儿童医院"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">科室</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="小儿内科"
                className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
                <User className="w-3 h-3" />
                医生
              </label>
              <input
                type="text"
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                placeholder="王医生"
                className="w-full px-3.5 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">主诉症状</label>
            <input
              type="text"
              value={form.chiefComplaint}
              onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
              placeholder="如：发热2天伴咳嗽"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
              <FileText className="w-3 h-3" />
              诊断结论
            </label>
            <textarea
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              rows={4}
              placeholder="详细诊断结果和建议..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Pill className="w-3 h-3" />
                处方用药
              </label>
              <button
                onClick={addPrescription}
                className="text-mint-500 text-xs font-semibold flex items-center gap-1 hover:text-mint-600"
              >
                <PlusCircle className="w-4 h-4" />
                添加药物
              </button>
            </div>
            <div className="space-y-2.5">
              {prescriptions.map((p, i) => (
                <div key={i} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePrescription(i, 'name', e.target.value)}
                      placeholder="药名"
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/20"
                    />
                    {prescriptions.length > 1 && (
                      <button
                        onClick={() => removePrescription(i)}
                        className="w-8 h-8 rounded-lg bg-coral-500/10 flex items-center justify-center text-coral-500 hover:bg-coral-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={p.dosage}
                      onChange={(e) => updatePrescription(i, 'dosage', e.target.value)}
                      placeholder="剂量"
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/20"
                    />
                    <input
                      type="text"
                      value={p.frequency}
                      onChange={(e) => updatePrescription(i, 'frequency', e.target.value)}
                      placeholder="频次"
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-1">
              <Image className="w-3 h-3" />
              病历资料
            </label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden shadow-sm',
                    'bg-gradient-to-br',
                    imgGradients[i % imgGradients.length]
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl drop-shadow">📋</span>
                  </div>
                  <button
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <button className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-mint-500/50 hover:text-mint-500 hover:bg-mint-500/5 transition-colors">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs mt-1">上传</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
              <Bell className="w-3 h-3" />
              下次复诊日期（可选）
            </label>
            <input
              type="date"
              value={form.nextVisitDate}
              onChange={(e) => setForm({ ...form, nextVisitDate: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white font-semibold shadow-lg shadow-mint-500/30 hover:shadow-xl transition-all text-sm"
            >
              保存记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VisitPage() {
  const allVisitRecords = useHealthStore((s) => s.visitRecords);
  const selectedChildId = useHealthStore((s) => s.selectedChildId);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const childId = selectedChildId || 'child-1';
  const visitRecords = allVisitRecords.filter((r) => r.childId === childId);

  const getRecordDate = (r: VisitRecord) => r.date || r.visitDate || '';
  const safeStr = (s: string | undefined) => s || '';

  const filtered = visitRecords.filter((r) => {
    const category = r.category || 'other';
    if (filter !== 'all' && category !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        safeStr(r.hospital).toLowerCase().includes(s) ||
        safeStr(r.doctor).toLowerCase().includes(s) ||
        safeStr(r.department).toLowerCase().includes(s) ||
        safeStr(r.diagnosis).toLowerCase().includes(s)
      );
    }
    return true;
  });

  const year = new Date().getFullYear();
  const yearRecords = visitRecords.filter((r) => getRecordDate(r).startsWith(String(year)));
  const hospitalCounts: Record<string, number> = {};
  yearRecords.forEach((r) => {
    hospitalCounts[r.hospital] = (hospitalCounts[r.hospital] || 0) + 1;
  });
  const topHospitals = Object.entries(hospitalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const totalExpense = yearRecords.reduce((sum, r) => sum + (r.expense || r.cost || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/50 via-white to-sky2-50/30 pb-28">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-white to-white/80 backdrop-blur-lg px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-7 h-7 text-mint-500" />
              就诊档案
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">完整的就医记录，随时可查</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-mint-400 to-sky2-400 flex items-center justify-center shadow-lg shadow-mint-500/30">
            <Hospital className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索医院、医生、诊断..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {(['all', 'cold', 'fever', 'checkup', 'other'] as FilterType[]).map((f) => {
            const active = filter === f;
            const cat = f !== 'all' ? categoryConfig[f] : null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                  active
                    ? 'bg-gradient-to-r from-mint-500 to-sky2-500 text-white shadow-md shadow-mint-500/30'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {cat && <span className="mr-1.5">{cat.emoji}</span>}
                {filterLabels[f]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-2 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-coral-400 to-orange-400 rounded-2xl p-4 text-white shadow-lg shadow-coral-500/20">
            <div className="text-xs opacity-80 mb-1">本年就诊</div>
            <div className="text-3xl font-bold">{yearRecords.length}</div>
            <div className="text-xs opacity-70 mt-1">次</div>
          </div>
          <div className="bg-gradient-to-br from-mint-400 to-teal-400 rounded-2xl p-4 text-white shadow-lg shadow-mint-500/20">
            <div className="text-xs opacity-80 mb-1 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Top医院
            </div>
            <div className="text-sm font-bold mt-1 truncate">
              {topHospitals[0]?.[0] || '--'}
            </div>
            <div className="text-xs opacity-70 mt-0.5">
              {topHospitals[0] ? `${topHospitals[0][1]}次` : '暂无'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-lavender-500 to-indigo-400 rounded-2xl p-4 text-white shadow-lg shadow-lavender-500/20">
            <div className="text-xs opacity-80 mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              医疗支出
            </div>
            <div className="text-2xl font-bold">¥{totalExpense}</div>
            <div className="text-xs opacity-70 mt-1">本年度</div>
          </div>
        </div>

        {topHospitals.length > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              常用医院 TOP3
            </div>
            <div className="space-y-2.5">
              {topHospitals.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                    i === 0 ? 'bg-amber-500/15 text-amber-600' :
                    i === 1 ? 'bg-gray-400/15 text-gray-500' :
                    'bg-orange-500/15 text-orange-500'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-700 text-sm truncate">{name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            i === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                            i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                            'bg-gradient-to-r from-orange-400 to-red-400'
                          )}
                          style={{ width: `${(count / topHospitals[0][1]) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium flex-shrink-0">{count}次</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              就诊时间线
            </h2>
            <span className="text-xs text-gray-400">共 {filtered.length} 条</span>
          </div>
          <div className="space-y-4">
            {filtered.map((r) => (
              <VisitCard key={r.id} record={r} />
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <div className="text-gray-400 font-medium">暂无就诊记录</div>
                <div className="text-sm text-gray-300 mt-1">点击右下角按钮添加</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-mint-500 to-sky2-500 shadow-2xl shadow-mint-500/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform group"
      >
        <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ backgroundColor: 'rgba(78, 205, 196, 0.4)' }} />
        <Plus className="w-8 h-8 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {showAddModal && <AddVisitModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
