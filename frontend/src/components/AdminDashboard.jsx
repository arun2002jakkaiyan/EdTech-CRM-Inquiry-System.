import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import AdminLogin from './AdminLogin';
import StatCards from './StatCards';
import FilterBar from './FilterBar';
import InquiryTable from './InquiryTable';
import InquiryMobileCard from './InquiryMobileCard';
import InquiryDetailModal from './InquiryDetailModal';
import {
  Shield,
  Layers,
  Download,
  RotateCcw,
  PlusCircle,
  Inbox,
  Loader2,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard({ onNavigateToInquiry }) {
  const { isAuthenticated, admin, logout } = useAuth();
  const { showToast } = useToast();

  const [inquiries, setInquiries] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    contacted: 0,
    resolved: 0,
    today: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dbInfo, setDbInfo] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    category: 'All',
    user_type: 'All',
    status: 'All',
    search: '',
  });

  // Selected Inquiry for Modal view
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Fetch inquiries from backend
  const fetchInquiries = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    try {
      const res = await api.getInquiries(currentFilters);
      if (res.data) {
        setInquiries(res.data);
      }
      if (res.metrics) {
        setMetrics(res.metrics);
      }
      if (res.database) {
        setDbInfo(res.database);
      }
    } catch (err) {
      if (err.status !== 401) {
        showToast(err.message || 'Error loading inquiries', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
    }
  }, [isAuthenticated, fetchInquiries]);

  // Handle single filter change
  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    fetchInquiries(updated);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetState = {
      category: 'All',
      user_type: 'All',
      status: 'All',
      search: '',
    };
    setFilters(resetState);
    fetchInquiries(resetState);
  };

  // Update Status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateStatus(id, newStatus);
      // Optimistic update
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Status updated to "${newStatus}"`, 'success');
      // Refresh metrics
      fetchInquiries();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Update Notes
  const handleUpdateNotes = async (id, notes) => {
    try {
      await api.updateNotes(id, notes);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, notes } : inq))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, notes }));
      }
      showToast('Staff notes saved successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save notes', 'error');
    }
  };

  // Delete Inquiry
  const handleDelete = async (id) => {
    try {
      await api.deleteInquiry(id);
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      showToast('Inquiry removed successfully', 'info');
      fetchInquiries();
    } catch (err) {
      showToast(err.message || 'Failed to delete inquiry', 'error');
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (inquiries.length === 0) {
      showToast('No inquiries available to export.', 'info');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'User Type', 'Category', 'Status', 'Date', 'Message', 'Notes'];
    const rows = inquiries.map((inq) => [
      `"${inq.id}"`,
      `"${(inq.name || '').replace(/"/g, '""')}"`,
      `"${inq.email || ''}"`,
      `"${inq.phone || ''}"`,
      `"${inq.user_type || ''}"`,
      `"${inq.category || ''}"`,
      `"${inq.status || ''}"`,
      `"${inq.created_at || ''}"`,
      `"${(inq.message || '').replace(/"/g, '""')}"`,
      `"${(inq.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edtech_crm_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV successfully!', 'success');
  };

  // If not logged in, render Admin Login screen
  if (!isAuthenticated) {
    return (
      <div className="py-6">
        <AdminLogin onLoginSuccess={() => fetchInquiries()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inquiry Management CRM
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700">
              Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor, filter, and respond to public inquiries from parents, students, and partner schools.
          </p>
        </div>

        {/* Database Status & New Inquiry Shortcut */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-sm text-xs text-slate-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{dbInfo?.provider || 'Supabase PostgreSQL'}</span>
          </div>

          <button
            onClick={onNavigateToInquiry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Public Inquiry</span>
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <StatCards
        metrics={metrics}
        activeStatus={filters.status}
        onSelectStatus={(statusId) => handleFilterChange('status', statusId)}
      />

      {/* Search and Filters Bar (Mandatory Features) */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onExportCsv={handleExportCsv}
        onRefresh={() => fetchInquiries()}
        totalCount={metrics.total}
        filteredCount={inquiries.length}
        isLoading={isLoading}
      />

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-indigo-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Synchronizing with PostgreSQL Database...</span>
        </div>
      )}

      {/* Inquiries Content: Tabular on Desktop (>= 768px), Card on Mobile (< 768px) */}
      <div className="space-y-4">
        {/* Desktop View: Tabular View */}
        <div className="hidden md:block">
          <InquiryTable
            inquiries={inquiries}
            onViewDetails={(inq) => setSelectedInquiry(inq)}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDelete}
          />
        </div>

        {/* Mobile View: High-Touch Cards View */}
        <div className="md:hidden space-y-3">
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center">
              <Inbox className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No Inquiries Found</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing filters or search</p>
            </div>
          ) : (
            inquiries.map((inq) => (
              <InquiryMobileCard
                key={inq.id}
                inquiry={inq}
                onViewDetails={(item) => setSelectedInquiry(item)}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNotes={handleUpdateNotes}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
