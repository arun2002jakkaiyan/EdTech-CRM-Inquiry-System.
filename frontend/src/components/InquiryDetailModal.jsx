import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import UserTypeBadge from './UserTypeBadge';
import CategoryBadge from './CategoryBadge';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Save,
  Trash2,
  Copy,
  Check,
  Clock,
  ExternalLink
} from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Contacted', 'Resolved'];

export default function InquiryDetailModal({
  inquiry,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onDelete
}) {
  if (!inquiry) return null;

  const [notes, setNotes] = useState(inquiry.notes || '');
  const [currentStatus, setCurrentStatus] = useState(inquiry.status || 'Pending');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    await onUpdateStatus(inquiry.id, newStatus);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateNotes(inquiry.id, notes);
    setIsSavingNotes(false);
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
              {inquiry.name ? inquiry.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                {inquiry.name}
              </h3>
              <p className="text-xs text-slate-500">
                Inquiry ID: <span className="font-mono text-slate-700">{String(inquiry.id).substring(0, 13)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Metadata Badges & Status Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2">
              <UserTypeBadge userType={inquiry.user_type} />
              <CategoryBadge category={inquiry.category} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                  <a href={`mailto:${inquiry.email}`} className="text-xs font-semibold text-slate-800 hover:text-indigo-600 truncate block">
                    {inquiry.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCopy(inquiry.email, 'email')}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors ml-2"
                title="Copy Email"
              >
                {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone Number</span>
                  <a href={`tel:${inquiry.phone}`} className="text-xs font-semibold text-slate-800 hover:text-emerald-600 truncate block">
                    {inquiry.phone}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCopy(inquiry.phone, 'phone')}
                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors ml-2"
                title="Copy Phone"
              >
                {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Full Message / Query Content */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Inquiry Message</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </div>

          {/* Internal Admin CRM Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Internal Staff Notes</span>
              </span>
              <span className="text-[11px] text-slate-400">Only visible to administrators</span>
            </div>
            <textarea
              rows={3}
              placeholder="Record follow-up calls, advisor assigned, scholarship status, or interview details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-600/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Saving Notes...' : 'Save Internal Notes'}</span>
              </button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Submitted: {formatDate(inquiry.created_at)}</span>
            </span>
            {inquiry.updated_at && (
              <span>Updated: {formatDate(inquiry.updated_at)}</span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this inquiry permanently?')) {
                onDelete(inquiry.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-transparent transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Inquiry</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
