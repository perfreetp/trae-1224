import { useState } from 'react';
import {
  Users,
  Plus,
  X,
  Edit3,
  Shield,
  ShieldCheck,
  Phone,
  Download,
  FileText,
  Calendar,
  Share2,
  Mail,
  Link2,
  Bell,
  Droplets,
  Moon,
  Syringe,
  Pill,
  Stethoscope,
  Settings,
  Cloud,
  Info,
  ChevronDown,
  ChevronRight,
  Trash2,
  Check,
  Sparkles,
  Copy,
  ArrowDownToLine,
  Heart,
  Baby,
  Crown,
  TrendingUp,
} from 'lucide-react';
import {
  useHealthStore,
  Child,
  Caregiver,
} from '@/store/useHealthStore';
import type { Relation } from '../types';
import { cn } from '@/lib/utils';

const relationMap: Record<Relation, string> = {
  father: '父亲',
  mother: '母亲',
  grandfather: '祖父',
  grandmother: '祖母',
  other: '其他',
};

const relationToEnum: Record<string, Relation> = {
  '父亲': 'father',
  '母亲': 'mother',
  '祖父': 'grandfather',
  '外祖父': 'grandfather',
  '祖母': 'grandmother',
  '外祖母': 'grandmother',
  '保姆': 'other',
  '其他': 'other',
};

const permissionToLevel = (perms: string[]): 'admin' | 'edit' | 'view' => {
  if (perms.includes('全部权限') || perms.length >= 6) return 'admin';
  if (perms.length >= 3) return 'edit';
  return 'view';
};

function ChildCard({ child, active, onClick }: {
  child: Child;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 w-44 p-4 rounded-3xl transition-all relative overflow-hidden',
        active
          ? 'bg-gradient-to-br from-mint-400 to-sky2-400 text-white shadow-xl shadow-mint-500/30 scale-105'
          : 'bg-white border-2 border-gray-100 hover:border-gray-200 shadow-sm'
      )}
    >
      {active && (
        <div className="absolute top-2 right-2">
          <Crown className="w-4 h-4 text-yellow-300 drop-shadow" />
        </div>
      )}
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-3 mx-auto',
        active ? 'bg-white/25 backdrop-blur' : 'bg-gradient-to-br from-warm-100 to-lemon-500/20'
      )}>
        {child.avatar}
      </div>
      <div className={cn('font-bold text-center', active ? 'text-white' : 'text-gray-800')}>
        {child.name}
      </div>
      <div className={cn('text-xs text-center mt-1', active ? 'text-white/80' : 'text-gray-400')}>
        {child.age}岁 · {child.bloodType}
      </div>
      {child.allergies && child.allergies.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {child.allergies.slice(0, 2).map((a) => (
            <span
              key={a}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                active ? 'bg-white/25 text-white' : 'bg-coral-500/10 text-coral-500'
              )}
            >
              ⚠ {a}
            </span>
          ))}
          {child.allergies.length > 2 && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
              active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
            )}>
              +{child.allergies.length - 2}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function AddChildButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 p-4 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-mint-500/50 hover:text-mint-500 hover:bg-mint-500/5 transition-all min-h-[168px]"
    >
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Plus className="w-7 h-7" />
      </div>
      <span className="font-semibold text-sm">添加孩子</span>
    </button>
  );
}

function ChildEditModal({ child, onClose, onSave }: {
  child: Child | null;
  onClose: () => void;
  onSave: (data: Omit<Child, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    name: child?.name || '',
    avatar: child?.avatar || '👶',
    age: child?.age || 1,
    bloodType: child?.bloodType || 'A型',
    allergies: child?.allergies || [],
    gender: (child?.gender || 'male') as Child['gender'],
    birthday: child?.birthday || new Date().toISOString().split('T')[0],
    createdAt: child?.createdAt || new Date().toISOString(),
    updatedAt: child?.updatedAt || new Date().toISOString(),
  });
  const [newAllergy, setNewAllergy] = useState('');

  const avatars = ['👶', '👦', '👧', '🧒', '👼', '🐻', '🐰', '🐱'];
  const bloodTypes = ['A型', 'B型', 'AB型', 'O型'];

  function addAllergy() {
    if (newAllergy.trim() && !form.allergies.includes(newAllergy.trim())) {
      setForm({ ...form, allergies: [...form.allergies, newAllergy.trim()] });
      setNewAllergy('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-lemon-500/10 to-coral-500/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Baby className="w-5 h-5 text-coral-500" />
            {child ? '编辑孩子档案' : '添加孩子'}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">选择头像</label>
            <div className="grid grid-cols-8 gap-2">
              {avatars.map((a) => (
                <button
                  key={a}
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={cn(
                    'aspect-square rounded-xl text-2xl flex items-center justify-center transition-all',
                    form.avatar === a
                      ? 'bg-mint-500/15 ring-2 ring-mint-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">姓名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-500/50 text-sm"
                placeholder="孩子姓名"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">年龄</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50">
                <input
                  type="range"
                  min={0}
                  max={18}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) })}
                  className="flex-1 h-2 rounded-full bg-gradient-to-r from-mint-400 to-sky2-400 appearance-none cursor-pointer"
                />
                <span className="font-bold text-mint-500 w-10 text-right">{form.age}岁</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">性别</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setForm({ ...form, gender: 'male' as const })}
                className={cn(
                  'py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5',
                  (form.gender === 'male' || form.gender === 'boy')
                    ? 'bg-gradient-to-r from-sky2-400 to-blue-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                <span className="text-lg">👦</span>男孩
              </button>
              <button
                onClick={() => setForm({ ...form, gender: 'female' as const })}
                className={cn(
                  'py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5',
                  (form.gender === 'female' || form.gender === 'girl')
                    ? 'bg-gradient-to-r from-coral-400 to-pink-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                <span className="text-lg">👧</span>女孩
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">血型</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodTypes.map((b) => (
                <button
                  key={b}
                  onClick={() => setForm({ ...form, bloodType: b })}
                  className={cn(
                    'py-2.5 rounded-xl font-semibold text-sm transition-all',
                    form.bloodType === b
                      ? 'bg-gradient-to-r from-coral-400 to-orange-400 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">过敏源</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.allergies.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1.5 rounded-full bg-coral-500/10 text-coral-500 text-xs font-semibold flex items-center gap-1.5"
                >
                  ⚠ {a}
                  <button
                    onClick={() => setForm({ ...form, allergies: form.allergies.filter((x) => x !== a) })}
                    className="w-4 h-4 rounded-full bg-coral-500/20 flex items-center justify-center hover:bg-coral-500/30"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAllergy()}
                placeholder="添加过敏源，如：花生"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral-500/30 text-sm"
              />
              <button
                onClick={addAllergy}
                className="px-4 rounded-xl bg-coral-500/15 text-coral-500 font-semibold text-sm hover:bg-coral-500/25 transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (form.name.trim()) {
                  onSave(form);
                  onClose();
                }
              }}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white font-semibold shadow-lg shadow-mint-500/30 hover:shadow-xl transition-all text-sm"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteCaregiverModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: Omit<Caregiver, 'id'>) => void;
}) {
  const allPermissions = ['查看数据', '症状打卡', '用药提醒', '疫苗提醒', '就诊记录', '数据导出', '全部权限'];
  const [form, setForm] = useState({
    name: '',
    avatar: '👤',
    relation: '父亲',
    phone: '',
    permissions: [] as string[],
    createdAt: new Date().toISOString(),
    permission: 'view' as Caregiver['permission'],
  });

  const relations = ['父亲', '母亲', '祖父', '祖母', '外祖父', '外祖母', '保姆', '其他'];
  const avatars = ['👤', '👨', '👩', '👴', '👵', '👨‍🦱', '👩‍🦰', '🧔'];

  function togglePerm(p: string) {
    if (p === '全部权限') {
      setForm({
        ...form,
        permissions: form.permissions.includes('全部权限') ? [] : ['全部权限'],
      });
    } else {
      const newPerms = form.permissions.filter((x) => x !== '全部权限');
      setForm({
        ...form,
        permissions: newPerms.includes(p) ? newPerms.filter((x) => x !== p) : [...newPerms, p],
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-lavender-500/15 to-indigo-500/15 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-lavender-500" />
            邀请照护人
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">选择头像</label>
            <div className="grid grid-cols-8 gap-2">
              {avatars.map((a) => (
                <button
                  key={a}
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={cn(
                    'aspect-square rounded-xl text-2xl flex items-center justify-center transition-all',
                    form.avatar === a
                      ? 'bg-lavender-500/15 ring-2 ring-lavender-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">姓名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lavender-500/30 focus:border-lavender-500/50 text-sm"
                placeholder="如：爸爸"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">关系</label>
              <select
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lavender-500/30 text-sm"
              >
                {relations.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
              <Phone className="w-3 h-3" />
              手机号
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="138****8888"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lavender-500/30 focus:border-lavender-500/50 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              权限设置
            </label>
            <div className="flex flex-wrap gap-2">
              {allPermissions.map((p) => {
                const checked =
                  p === '全部权限'
                    ? form.permissions.includes('全部权限')
                    : form.permissions.includes(p) || form.permissions.includes('全部权限');
                const isAll = p === '全部权限';
                return (
                  <button
                    key={p}
                    onClick={() => togglePerm(p)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border-2',
                      checked
                        ? isAll
                          ? 'bg-gradient-to-r from-lavender-500 to-indigo-500 text-white border-transparent shadow-md'
                          : 'bg-lavender-500/15 text-lavender-600 border-lavender-500/30'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {checked && <Check className="w-3 h-3" />}
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (form.name.trim() && form.phone.trim()) {
                  const finalPerms = form.permissions.length > 0 ? form.permissions : ['查看数据'];
                  const careGiverData: any = {
                    name: form.name,
                    avatar: form.avatar,
                    relation: relationToEnum[form.relation] || 'other',
                    phone: form.phone,
                    permission: permissionToLevel(finalPerms),
                    permissions: finalPerms,
                    note: '',
                    createdAt: new Date().toISOString(),
                  };
                  onSave(careGiverData);
                  onClose();
                }
              }}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-lavender-500 to-indigo-400 text-white font-semibold shadow-lg shadow-lavender-500/30 hover:shadow-xl transition-all text-sm"
            >
              发送邀请
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportPreview({ child, onClose, onShare }: {
  child: Child;
  onClose: () => void;
  onShare: (method: 'link' | 'email') => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    setCopied(true);
    onShare('link');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-mint-500/10 to-coral-500/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-mint-500" />
            健康报告预览
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gradient-to-br from-mint-400 via-sky2-400 to-lavender-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-4xl">
                {child.avatar}
              </div>
              <div>
                <div className="text-xl font-bold">{child.name}的健康报告</div>
                <div className="text-sm opacity-80">{child.age}岁 · {child.bloodType}</div>
              </div>
            </div>
            <div className="text-xs opacity-75">
              生成时间：{new Date().toLocaleString('zh-CN')}
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-coral-500/5 border border-coral-500/10">
              <div className="flex items-center gap-2 text-coral-500 font-semibold text-sm mb-3">
                <Heart className="w-4 h-4" /> 健康概览
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-coral-500">5</div>
                  <div className="text-xs text-gray-500">症状记录</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-mint-500">4</div>
                  <div className="text-xs text-gray-500">就诊次数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lavender-500">3</div>
                  <div className="text-xs text-gray-500">疫苗接种</div>
                </div>
              </div>
            </div>

            {child.allergies.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <div className="text-amber-600 font-semibold text-sm mb-2">⚠ 过敏提醒</div>
                <div className="flex flex-wrap gap-2">
                  {child.allergies.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 text-xs font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-mint-500/5 border border-mint-500/10">
              <div className="text-mint-600 font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI健康建议
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                根据近期健康数据分析，{child.name}整体状况良好。建议注意季节交替时的保暖，保持规律作息，每日户外活动不少于2小时。如有发热超过38.5°C持续不退，请及时就医。
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={copyLink}
              className={cn(
                'flex-1 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all',
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制链接'}
            </button>
            <button
              onClick={() => onShare('email')}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-mint-500 to-sky2-500 text-white font-semibold shadow-lg shadow-mint-500/30 hover:shadow-xl transition-all text-sm flex items-center justify-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              邮件发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const store = useHealthStore();
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [expandedCaregiver, setExpandedCaregiver] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);

  const [exportForm, setExportForm] = useState({
    childId: store.activeChildId,
    timeRange: '30d' as '30d' | '90d' | '1y' | 'custom',
    content: {
      growth: true,
      vaccine: true,
      visit: true,
      medication: false,
      allergy: true,
    } as Record<string, boolean>,
  });

  const activeChild = store.children.find((c) => c.id === store.activeChildId) || store.children[0];
  const displayedCaregivers = store.caregivers.slice(0, 4);
  const extraCaregivers = store.caregivers.length - 4;

  const timeRanges = [
    { value: '30d', label: '近30天' },
    { value: '90d', label: '近3个月' },
    { value: '1y', label: '近1年' },
    { value: 'custom', label: '自定义' },
  ];
  const contentOptions = [
    { key: 'growth', label: '生长数据', icon: TrendingUp, color: 'text-coral-500' },
    { key: 'vaccine', label: '疫苗记录', icon: Syringe, color: 'text-mint-500' },
    { key: 'visit', label: '就诊档案', icon: Stethoscope, color: 'text-sky2-500' },
    { key: 'medication', label: '用药历史', icon: Pill, color: 'text-amber-500' },
    { key: 'allergy', label: '过敏史', icon: Shield, color: 'text-lavender-500' },
  ];

  const reminderOptions = [
    { key: 'vaccine' as const, label: '疫苗提醒', icon: Syringe, color: 'bg-mint-500' },
    { key: 'medication' as const, label: '用药提醒', icon: Pill, color: 'bg-amber-500' },
    { key: 'visit' as const, label: '就诊提醒', icon: Stethoscope, color: 'bg-sky2-500' },
    { key: 'water' as const, label: '饮水提醒', icon: Droplets, color: 'bg-blue-500' },
    { key: 'sleep' as const, label: '睡眠提醒', icon: Moon, color: 'bg-indigo-500' },
  ];

  function handleGenerateReport() {
    setGenerating(true);
    setGenerateProgress(0);
    const timer = setInterval(() => {
      setGenerateProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setGenerating(false);
            setShowReport(true);
          }, 300);
          return 100;
        }
        return p + 8;
      });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-500/5 via-white to-lemon-500/10 pb-8">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-white to-white/80 backdrop-blur-lg px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-7 h-7 text-lavender-500" />
              家庭中心
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">管理孩子档案与照护人权限</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lavender-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-lavender-500/30">
            <Heart className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-5 space-y-7">
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Baby className="w-4 h-4 text-coral-500" />
              孩子档案
            </h2>
            <span className="text-xs text-gray-400">{store.children.length}个孩子</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
            {store.children.map((c) => (
              <ChildCard
                key={c.id}
                child={c}
                active={store.activeChildId === c.id}
                onClick={() => {
                  store.setActiveChild(c.id);
                  setEditingChild(c);
                }}
              />
            ))}
            <AddChildButton onClick={() => setShowAddChild(true)} />
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-lavender-500" />
              照护人管理
            </h2>
            <button
              onClick={() => setShowInvite(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-lavender-500 to-indigo-400 text-white text-sm font-semibold shadow-md shadow-lavender-500/30 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              邀请
            </button>
          </div>

          <div className="flex items-center mb-5 px-1">
            <div className="flex -space-x-3">
              {displayedCaregivers.map((cg, i) => (
                <div
                  key={cg.id}
                  className="w-12 h-12 rounded-full border-3 border-white shadow-md flex items-center justify-center text-2xl bg-gradient-to-br from-warm-100 to-lemon-500/30 z-10 relative"
                  style={{ zIndex: 10 - i }}
                >
                  {cg.avatar || '👤'}
                </div>
              ))}
              {extraCaregivers > 0 && (
                <div className="w-12 h-12 rounded-full border-3 border-white bg-gray-100 text-gray-500 font-bold text-sm flex items-center justify-center shadow-md">
                  +{extraCaregivers}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="font-semibold text-gray-700 text-sm">{store.caregivers.length}位家庭成员</div>
              <div className="text-xs text-gray-400">共同守护孩子健康</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {store.caregivers.map((cg) => {
              const expanded = expandedCaregiver === cg.id;
              return (
                <div key={cg.id} className="rounded-2xl overflow-hidden border border-gray-100">
                  <button
                    onClick={() => setExpandedCaregiver(expanded ? null : cg.id)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-500/20 to-indigo-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                      {cg.avatar}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-gray-800 flex items-center gap-2">
                        {cg.name}
                        <span className="text-xs text-gray-400 font-normal">· {relationMap[cg.relation]}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {cg.phone}
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      'w-5 h-5 text-gray-400 transition-transform flex-shrink-0',
                      expanded && 'rotate-180'
                    )} />
                  </button>
                  {expanded && (
                    <div className="px-4 pb-4 animate-slide-up">
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(cg.permissions || ['查看数据']).map((p) => (
                          <span
                            key={p}
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
                              p === '全部权限'
                                ? 'bg-gradient-to-r from-lavender-500 to-indigo-500 text-white'
                                : 'bg-lavender-500/10 text-lavender-600'
                            )}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {p}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {}}
                          className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-4 h-4" />
                          编辑权限
                        </button>
                        <button
                          onClick={() => store.removeCaregiver(cg.id)}
                          className="py-2.5 px-4 rounded-xl bg-coral-500/10 text-coral-500 text-sm font-semibold hover:bg-coral-500/20 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-card">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-5">
            <Download className="w-5 h-5 text-mint-500" />
            数据导出
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">选择孩子</label>
              <div className="relative">
                <select
                  value={exportForm.childId}
                  onChange={(e) => setExportForm({ ...exportForm, childId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-mint-500/30 text-sm appearance-none pr-10"
                >
                  {store.children.map((c) => (
                    <option key={c.id} value={c.id}>{c.avatar} {c.name}（{c.age}岁）</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                时间范围
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeRanges.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setExportForm({ ...exportForm, timeRange: r.value as any })}
                    className={cn(
                      'py-2.5 rounded-xl text-xs font-semibold transition-all',
                      exportForm.timeRange === r.value
                        ? 'bg-gradient-to-r from-mint-500 to-sky2-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">导出内容</label>
              <div className="space-y-2">
                {contentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const checked = exportForm.content[opt.key];
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setExportForm({
                        ...exportForm,
                        content: { ...exportForm.content, [opt.key]: !checked },
                      })}
                      className={cn(
                        'w-full p-3 rounded-2xl border-2 flex items-center gap-3 transition-all text-left',
                        checked
                          ? 'border-mint-500/40 bg-mint-500/5'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                        checked ? 'bg-mint-500/15' : 'bg-gray-100'
                      )}>
                        <Icon className={cn('w-4.5 h-4.5', checked ? opt.color : 'text-gray-400')} />
                      </div>
                      <span className={cn(
                        'flex-1 font-semibold text-sm',
                        checked ? 'text-gray-800' : 'text-gray-500'
                      )}>
                        {opt.label}
                      </span>
                      <div className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                        checked ? 'bg-mint-500 text-white' : 'bg-gray-200'
                      )}>
                        {checked && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {generating ? (
              <div className="p-4 rounded-2xl bg-mint-500/5 border border-mint-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-mint-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-bounce-soft" />
                    正在生成报告...
                  </span>
                  <span className="text-sm font-bold text-mint-500">{Math.min(generateProgress, 100)}%</span>
                </div>
                <div className="h-3 rounded-full bg-mint-500/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-mint-500 to-sky2-500 transition-all duration-200"
                    style={{ width: `${Math.min(generateProgress, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateReport}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-mint-500 via-sky2-500 to-lavender-500 text-white font-bold shadow-xl shadow-mint-500/30 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <ArrowDownToLine className="w-5 h-5" />
                生成健康报告
              </button>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-5 shadow-card">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-500" />
            设置
          </h2>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-2">提醒偏好</div>
            {reminderOptions.map((opt) => {
              const Icon = opt.icon;
              const on = store.reminders[opt.key];
              return (
                <button
                  key={opt.key}
                  onClick={() => store.toggleReminder(opt.key)}
                  className="w-full p-4 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    on ? `${opt.color} text-white` : 'bg-gray-100 text-gray-400'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-left font-semibold text-sm text-gray-700">{opt.label}</span>
                  <div className={cn(
                    'w-12 h-7 rounded-full relative transition-colors flex-shrink-0',
                    on ? opt.color : 'bg-gray-200'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform flex items-center justify-center',
                      on ? 'translate-x-5' : 'translate-x-0.5'
                    )}>
                      {on && <Check className="w-3.5 h-3.5 text-gray-700" />}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 pt-4 pb-2">数据与关于</div>
            <button className="w-full p-4 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center flex-shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm text-gray-700">数据备份与恢复</div>
                <div className="text-xs text-gray-400">上次备份：今天 08:30</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
            <button className="w-full p-4 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-lavender-500/15 text-lavender-500 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm text-gray-700">关于我们</div>
                <div className="text-xs text-gray-400">版本 v1.0.0</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </section>
      </div>

      {editingChild && (
        <ChildEditModal
          child={editingChild}
          onClose={() => setEditingChild(null)}
          onSave={(data) => store.updateChild(editingChild.id, data)}
        />
      )}
      {showAddChild && (
        <ChildEditModal
          child={null}
          onClose={() => setShowAddChild(false)}
          onSave={(data) => store.addChild(data)}
        />
      )}
      {showInvite && (
        <InviteCaregiverModal
          onClose={() => setShowInvite(false)}
          onSave={(data) => store.addCaregiver(data)}
        />
      )}
      {showReport && activeChild && (
        <ReportPreview
          child={activeChild}
          onClose={() => {
            setShowReport(false);
            setGenerateProgress(0);
          }}
          onShare={() => {}}
        />
      )}
    </div>
  );
}
