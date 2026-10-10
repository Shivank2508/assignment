import React from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { STATUSES, PRIORITIES, CATEGORIES } from "../services/db";

export function FilterBar({
  searchInput,
  onSearchChange,
  isDebouncing,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  sort,
  order,
  onSortChange,
  onOrderToggle,
  onReset,
  hasFilters
}) {
  return (
    <div className="filter-bar-container" role="region" aria-label="Search and Filter Controls">
      {/* 1. Debounced Search Input */}
      <div className="search-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by ID, customer, company, city, tracking..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search dataset"
        />
        {searchInput && (
          <button
            type="button"
            className="btn-clear-search"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
        {isDebouncing && (
          <span className="debouncing-pill">Syncing...</span>
        )}
      </div>

      {/* 2. Filter Dropdowns */}
      <div className="filters-group">
        {/* Status */}
        <select
          className="filter-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          className="filter-select"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          aria-label="Filter by Priority"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        {/* Category */}
        <select
          className="filter-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by Category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Sort Field */}
        <select
          className="filter-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort by column"
        >
          <option value="createdAt">Date Created</option>
          <option value="amount">Amount ($)</option>
          <option value="customer">Customer Name</option>
          <option value="id">Order ID</option>
        </select>

        {/* Sort Order Button */}
        <button
          type="button"
          className="btn-order-toggle"
          onClick={onOrderToggle}
          aria-label={`Sort direction ${order.toUpperCase()}`}
          title="Toggle sort direction"
        >
          {order.toUpperCase()}
        </button>

        {/* Reset Filters */}
        {hasFilters && (
          <button
            type="button"
            className="btn-reset"
            onClick={onReset}
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
