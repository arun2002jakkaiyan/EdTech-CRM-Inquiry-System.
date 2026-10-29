import React from 'react';
import { Clock, CheckCircle2, PhoneCall, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    'Pending': {
      bg: 'bg-amber-50',
      border: 'border-amber-200/90',
      text: 'text-amber-800',
      dot: 'bg-amber-500 animate-pulse',
      icon: Clock,
    },
    'In Progress': {
      bg: 'bg-blue-50',
      border: 'border-blue-200/90',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
      icon: AlertCircle,
    },
    'Contacted': {
      bg: 'bg-purple-50',
      border: 'border-purple-200/90',
      text: 'text-purple-800',
      dot: 'bg-purple-500',
      icon: PhoneCall,
    },
    'Resolved': {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/90',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
    },
  };

  const config = configs[status] || configs['Pending'];
  const Icon = config.icon;

  const isXs = size === 'xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-sm transition-all ${
        config.bg
      } ${config.border} ${config.text} ${
        isXs ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className={isXs ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
}
