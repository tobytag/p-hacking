import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, subtitle, trend, icon: Icon, color = 'bg-blue-500' }) {
    const gradientMap = {
        'bg-blue-500': 'from-blue-500 to-blue-600',
        'bg-purple-500': 'from-purple-500 to-purple-600',
        'bg-emerald-500': 'from-emerald-500 to-emerald-600',
        'bg-amber-500': 'from-amber-500 to-amber-600',
        'bg-rose-500': 'from-rose-500 to-rose-600',
    };

    const gradient = gradientMap[color] || 'from-blue-500 to-blue-600';

    return (
        <div className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

            {/* Icon with gradient background */}
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-${color.split('-')[1]}-500/20`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    </div>
                )}
            </div>

            {/* Content */}
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{value}</p>
                {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
        </div>
    );
}
