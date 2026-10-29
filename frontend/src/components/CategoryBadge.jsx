import React from 'react';
import { Award, Music, BookOpen, HelpCircle } from 'lucide-react';

export default function CategoryBadge({ category }) {
  const configs = {
    'Scholarship': {
      bg: 'bg-amber-50 text-amber-900 border-amber-200/90',
      icon: Award,
    },
    'Concert': {
      bg: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200/90',
      icon: Music,
    },
    'Admission': {
      bg: 'bg-blue-50 text-blue-900 border-blue-200/90',
      icon: BookOpen,
    },
    'General Query': {
      bg: 'bg-slate-100 text-slate-800 border-slate-200/90',
      icon: HelpCircle,
    },
  };

  const config = configs[category] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: HelpCircle,
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{category}</span>
    </span>
  );
}
