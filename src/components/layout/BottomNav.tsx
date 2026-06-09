import { NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Syringe, Pill, ClipboardList, Stethoscope, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: '首页', Icon: Home },
  { path: '/growth', label: '成长', Icon: TrendingUp },
  { path: '/vaccine', label: '疫苗', Icon: Syringe },
  { path: '/medicine', label: '用药', Icon: Pill },
  { path: '/symptom', label: '症状', Icon: ClipboardList },
  { path: '/visit', label: '就诊', Icon: Stethoscope },
  { path: '/family', label: '家庭', Icon: Users },
] as const;

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2">
      <div className="mx-auto max-w-md">
        <div className="rounded-4xl bg-white/70 px-2 py-2 shadow-card backdrop-blur-xl border border-white/60">
          <ul className="flex items-center justify-between gap-1">
            {NAV_ITEMS.map(({ path, label, Icon }) => {
              const isActive =
                path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(path);

              return (
                <li key={path} className="flex-1">
                  <NavLink
                    to={path}
                    className={cn(
                      'group relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-full transition-all duration-300 ease-out',
                      isActive
                        ? 'bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-lg shadow-mint-400/30 scale-105'
                        : 'text-slate-500 hover:text-mint-600 hover:bg-mint-50 active:scale-95'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-transform duration-300',
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      )}
                      strokeWidth={isActive ? 2.3 : 2}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-medium leading-tight transition-all duration-300',
                        isActive ? 'text-white' : ''
                      )}
                    >
                      {label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
