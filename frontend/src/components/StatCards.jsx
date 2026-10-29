import React from 'react';
import {
  Inbox,
  Clock,
  AlertCircle,
  PhoneCall,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function StatCards({ metrics = {}, activeStatus, onSelectStatus }) {
  const cards = [
    {
      id: 'All',
      label: 'Total Inquiries',
      value: metrics.total || 0,
      icon: Inbox,
      color: 'indigo',
      border: 'border-indigo-100',
      activeRing: 'ring-2 ring-indigo-500 bg-indigo-50/50',
      iconBg: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'Pending',
      label: 'Pending Attention',
      value: metrics.pending || 0,
      icon: Clock,
      color: 'amber',
      border: 'border-amber-100',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/50',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'In Progress',
      label: 'In Progress',
      value: metrics.in_progress || 0,
      icon: AlertCircle,
      color: 'blue',
      border: 'border-blue-100',
      activeRing: 'ring-2 ring-blue-500 bg-blue-50/50',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'Contacted',
      label: 'Contacted',
      value: metrics.contacted || 0,
      icon: PhoneCall,
      color: 'purple',
      border: 'border-purple-100',
      activeRing: 'ring-2 ring-purple-500 bg-purple-50/50',
      iconBg: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'Resolved',
      label: 'Resolved',
      value: metrics.resolved || 0,
      icon: CheckCircle2,
      color: 'emerald',
      border: 'border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/50',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatus === card.id || (card.id === 'All' && !activeStatus);

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus(card.id)}
            className={`text-left p-4 rounded-2xl bg-white border ${card.border} shadow-sm transition-all hover:shadow-md cursor-pointer ${
              isSelected ? card.activeRing : 'hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </span>
              {card.id === 'All' && metrics.today > 0 && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +{metrics.today} today
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
