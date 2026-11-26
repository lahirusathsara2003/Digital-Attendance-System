import React from 'react';

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  onClick,
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-blue-50 border-blue-200 text-blue-600',
      glow: 'hover:border-blue-300',
    },
    emerald: {
      bg: 'bg-green-50 border-green-200 text-green-600',
      glow: 'hover:border-green-300',
    },
    rose: {
      bg: 'bg-red-50 border-red-200 text-red-600',
      glow: 'hover:border-red-300',
    },
    amber: {
      bg: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      glow: 'hover:border-yellow-300',
    },
    cyan: {
      bg: 'bg-blue-50 border-blue-200 text-blue-600',
      glow: 'hover:border-blue-300',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-6 rounded-3xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
      } ${scheme.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
            {trend && (
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-600 font-medium">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl border ${scheme.bg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
