import React from 'react';
import {
  Search,
  Filter,
  X,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const CATEGORIES = ['All', 'Scholarship', 'Concert', 'Admission', 'General Query'];
const USER_TYPES = ['All', 'Parent', 'Student', 'School'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Contacted', 'Resolved'];

export default function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onExportCsv,
  onRefresh,
  totalCount,
  filteredCount,
  isLoading
}) {
  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.user_type !== 'All' ||
    filters.status !== 'All' ||
    (filters.search && filters.search.trim().length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 mb-6 space-y-4">
      {/* Top Bar: Search and Actions */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Bar (Name or Phone number) */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by Name, Phone, or Email..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons: Export & Refresh */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
            title="Refresh Inquiries"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 active:scale-95 transition-all"
            title="Export filtered inquiries to CSV file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Selectors */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <div className="flex-1 sm:flex-initial min-w-[150px]">
          <select
            id="filter_category"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : `Category: ${cat}`}
              </option>
            ))}
          </select>
        </div>

        {/* User Type Filter */}
        <div className="flex-1 sm:flex-initial min-w-[150px]">
          <select
            id="filter_user_type"
            value={filters.user_type}
            onChange={(e) => onFilterChange('user_type', e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {USER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'All' ? 'All User Types' : `User Type: ${type}`}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 sm:flex-initial min-w-[140px]">
          <select
            id="filter_status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : `Status: ${status}`}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors ml-auto sm:ml-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}

        {/* Results Counter Pill */}
        <span className="text-xs text-slate-500 font-medium ml-auto hidden sm:block">
          Showing <strong className="text-slate-800">{filteredCount}</strong> of {totalCount} records
        </span>
      </div>
    </div>
  );
}
