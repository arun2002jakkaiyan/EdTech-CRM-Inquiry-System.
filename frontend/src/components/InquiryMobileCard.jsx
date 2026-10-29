import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import UserTypeBadge from './UserTypeBadge';
import CategoryBadge from './CategoryBadge';
import {
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Calendar,
  MessageSquare
} from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Contacted', 'Resolved'];

export default function InquiryMobileCard({
  inquiry,
  onViewDetails,
  onUpdateStatus,
  onDelete
}) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3.5 transition-all">
      {/* Header: Name, Avatar, Date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0 border border-indigo-100">
            {inquiry.name ? inquiry.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h4 
              onClick={() => onViewDetails(inquiry)}
              className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {inquiry.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(inquiry.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => onViewDetails(inquiry)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
          title="Open Modal"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Badges: User Type and Category */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <UserTypeBadge userType={inquiry.user_type} />
        <CategoryBadge category={inquiry.category} />
      </div>

      {/* Contact Quick Links */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <a
          href={`tel:${inquiry.phone}`}
          className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold truncate hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="truncate">{inquiry.phone}</span>
        </a>

        <a
          href={`mailto:${inquiry.email}`}
          className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold truncate hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span className="truncate">{inquiry.email}</span>
        </a>
      </div>

      {/* Message Accordion */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-500 py-1 hover:text-slate-800 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Inquiry Message</span>
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-2 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap animate-fade-in">
            {inquiry.message}
            {inquiry.notes && (
              <div className="mt-2 pt-2 border-t border-indigo-100 text-[11px] text-indigo-800">
                <strong>Staff Note:</strong> {inquiry.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar: Status Select and Delete */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
          <select
            value={inquiry.status || 'Pending'}
            onChange={(e) => onUpdateStatus(inquiry.id, e.target.value)}
            className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            if (window.confirm(`Delete inquiry from ${inquiry.name}?`)) {
              onDelete(inquiry.id);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
