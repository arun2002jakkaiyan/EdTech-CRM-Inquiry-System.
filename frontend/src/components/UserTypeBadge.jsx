import React from 'react';
import { Users, GraduationCap, School } from 'lucide-react';

export default function UserTypeBadge({ userType }) {
  const configs = {
    'Parent': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: Users,
    },
    'Student': {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      icon: GraduationCap,
    },
    'School': {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: School,
    },
  };

  const config = configs[userType] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Users,
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{userType}</span>
    </span>
  );
}
