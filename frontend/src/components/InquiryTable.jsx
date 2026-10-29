import React from 'react';
import StatusBadge from './StatusBadge';
import UserTypeBadge from './UserTypeBadge';
import CategoryBadge from './CategoryBadge';
import {
  Eye,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Inbox,
  ArrowUpDown
} from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Contacted', 'Resolved'];

export default function InquiryTable({
  inquiries = [],
  onViewDetails,
  onUpdateStatus,
  onDelete
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No Inquiries Found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No inquiry matches your current filter or search criteria. Try clearing the filters or submitting a new public inquiry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-5">Inquirer Details</th>
              <th className="py-4 px-4">User Type</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">Submitted Date</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.map((inq) => {
              const { date, time } = formatDate(inq.created_at);
              return (
                <tr
                  key={inq.id}
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  {/* Name, Phone, Email */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-indigo-100">
                        {inq.name ? inq.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => onViewDetails(inq)}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate block text-left"
                        >
                          {inq.name}
                        </button>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <a href={`mailto:${inq.email}`} className="hover:text-indigo-600 truncate max-w-[140px]">
                              {inq.email}
                            </a>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a href={`tel:${inq.phone}`} className="hover:text-emerald-600 truncate">
                              {inq.phone}
                            </a>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* User Type */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <UserTypeBadge userType={inq.user_type} />
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <CategoryBadge category={inq.category} />
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-xs">
                      <span className="font-semibold text-slate-700 block">{date}</span>
                      <span className="text-slate-400 text-[11px] block">{time}</span>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center">
                      <select
                        value={inq.status || 'Pending'}
                        onChange={(e) => onUpdateStatus(inq.id, e.target.value)}
                        className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(inq)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Full Query & Notes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete inquiry from ${inq.name}?`)) {
                            onDelete(inq.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
