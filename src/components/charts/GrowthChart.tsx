import { useState, useMemo, useCallback } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface GrowthDataPoint {
  date: string;
  ageMonth?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  note?: string;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
  metrics?: ('height' | 'weight' | 'bmi')[];
  className?: string;
  heightUnit?: string;
  weightUnit?: string;
  bmiUnit?: string;
  onPointClick?: (point: GrowthDataPoint) => void;
}

const HEIGHT_COLOR = '#4ECDC4';
const WEIGHT_COLOR = '#45B7D1';
const BMI_COLOR = '#B39DDB';

export default function GrowthChart({
  data,
  metrics = ['height', 'weight'],
  className,
  heightUnit = 'cm',
  weightUnit = 'kg',
  bmiUnit = '',
  onPointClick,
}: GrowthChartProps) {
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>(
    Object.fromEntries(metrics.map((m) => [m, true]))
  );

  const heightRange = useMemo(() => {
    if (!data.some((d) => d.height !== undefined)) return [0, 100];
    const values = data.map((d) => d.height!).filter((v) => v !== undefined);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(5, (max - min) * 0.2);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data]);

  const weightRange = useMemo(() => {
    if (!data.some((d) => d.weight !== undefined)) return [0, 20];
    const values = data.map((d) => d.weight!).filter((v) => v !== undefined);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(2, (max - min) * 0.25);
    return [Math.floor(Math.max(0, min - padding)), Math.ceil(max + padding)];
  }, [data]);

  const handleLegendClick = useCallback((e: { value: string }) => {
    setActiveKeys((prev) => ({ ...prev, [e.value]: !prev[e.value] }));
  }, []);

  const CustomTooltip = useCallback(
    ({ active, payload, label }: TooltipProps<number, string>) => {
      if (!active || !payload || payload.length === 0) return null;
      const pointData = data.find((d) => d.date === label);

      return (
        <div className="rounded-2xl border border-white/60 bg-white/95 p-4 shadow-soft backdrop-blur-xl">
          <p className="mb-2 text-xs font-semibold text-slate-500">{label}</p>
          {pointData?.ageMonth !== undefined && (
            <p className="mb-2 text-xs text-slate-400">
              {pointData.ageMonth}月龄
            </p>
          )}
          <div className="space-y-1.5">
            {payload.map((entry) => {
              const labelMap: Record<string, string> = {
                height: '身高',
                weight: '体重',
                bmi: 'BMI',
              };
              const unitMap: Record<string, string> = {
                height: heightUnit,
                weight: weightUnit,
                bmi: bmiUnit,
              };
              return (
                <div
                  key={entry.dataKey}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: String(entry.color) }}
                  />
                  <span className="text-slate-600">
                    {labelMap[String(entry.dataKey)] ?? entry.dataKey}
                  </span>
                  <span className="ml-auto font-bold text-slate-900">
                    {entry.value}
                    <span className="ml-0.5 text-xs font-normal text-slate-400">
                      {unitMap[String(entry.dataKey)]}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          {pointData?.note && (
            <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
              📝 {pointData.note}
            </p>
          )}
        </div>
      );
    },
    [data, heightUnit, weightUnit, bmiUnit]
  );

  const renderCustomLegend = useCallback(
    (props: { payload?: { value: string; color: string }[] }) => {
      if (!props.payload) return null;
      const labelMap: Record<string, string> = {
        height: `身高 (${heightUnit})`,
        weight: `体重 (${weightUnit})`,
        bmi: `BMI${bmiUnit ? ` (${bmiUnit})` : ''}`,
      };
      return (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {props.payload.map((entry) => {
            const isActive = activeKeys[entry.value] !== false;
            return (
              <button
                key={entry.value}
                onClick={() => handleLegendClick({ value: entry.value })}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300',
                  isActive
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-slate-300 line-through'
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-30'
                  )}
                  style={{ backgroundColor: entry.color }}
                />
                {labelMap[entry.value] ?? entry.value}
              </button>
            );
          })}
        </div>
      );
    },
    [activeKeys, heightUnit, weightUnit, bmiUnit, handleLegendClick]
  );

  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="text-center">
          <div className="mb-3 text-5xl">📈</div>
          <p className="text-sm text-slate-500">暂无生长数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          onClick={(state) => {
            if (state?.activePayload?.[0]?.payload && onPointClick) {
              onPointClick(state.activePayload[0].payload as GrowthDataPoint);
            }
          }}
        >
          <defs>
            <linearGradient id="heightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={HEIGHT_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={HEIGHT_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={WEIGHT_COLOR} stopOpacity={0.3} />
              <stop offset="100%" stopColor={WEIGHT_COLOR} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bmiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BMI_COLOR} stopOpacity={0.25} />
              <stop offset="100%" stopColor={BMI_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={{ stroke: '#F1F5F9' }}
            interval="preserveStartEnd"
          />

          {metrics.includes('height') && (
            <YAxis
              yAxisId="height"
              orientation="left"
              domain={heightRange}
              tick={{ fontSize: 11, fill: HEIGHT_COLOR }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
          )}

          {(metrics.includes('weight') || metrics.includes('bmi')) && (
            <YAxis
              yAxisId="weight"
              orientation="right"
              domain={weightRange}
              tick={{ fontSize: 11, fill: WEIGHT_COLOR }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
          )}

          <Tooltip
            content={CustomTooltip as any}
            cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }}
          />

          <Legend content={renderCustomLegend} verticalAlign="bottom" />

          {metrics.includes('height') && activeKeys.height !== false && (
            <>
              <Area
                yAxisId="height"
                type="monotone"
                dataKey="height"
                fill="url(#heightGradient)"
                stroke="none"
                connectNulls
              />
              <Line
                yAxisId="height"
                type="monotone"
                dataKey="height"
                stroke={HEIGHT_COLOR}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: 'white',
                  stroke: HEIGHT_COLOR,
                  strokeWidth: 2,
                  className: 'cursor-pointer transition-all hover:r-6',
                }}
                activeDot={{
                  r: 7,
                  fill: HEIGHT_COLOR,
                  stroke: 'white',
                  strokeWidth: 3,
                }}
                connectNulls
              />
            </>
          )}

          {metrics.includes('weight') && activeKeys.weight !== false && (
            <>
              <Area
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                fill="url(#weightGradient)"
                stroke="none"
                connectNulls
              />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                stroke={WEIGHT_COLOR}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: 'white',
                  stroke: WEIGHT_COLOR,
                  strokeWidth: 2,
                  className: 'cursor-pointer',
                }}
                activeDot={{
                  r: 7,
                  fill: WEIGHT_COLOR,
                  stroke: 'white',
                  strokeWidth: 3,
                }}
                connectNulls
              />
            </>
          )}

          {metrics.includes('bmi') && activeKeys.bmi !== false && (
            <>
              <Area
                yAxisId="weight"
                type="monotone"
                dataKey="bmi"
                fill="url(#bmiGradient)"
                stroke="none"
                connectNulls
              />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="bmi"
                stroke={BMI_COLOR}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{
                  r: 3.5,
                  fill: 'white',
                  stroke: BMI_COLOR,
                  strokeWidth: 2,
                  className: 'cursor-pointer',
                }}
                activeDot={{
                  r: 6,
                  fill: BMI_COLOR,
                  stroke: 'white',
                  strokeWidth: 3,
                }}
                connectNulls
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
