import React from "react";
import { AlertCircle, RefreshCw, SearchX, Loader2 } from "lucide-react";

/**
 * Honest Error State:
 * Shows the server error message and a retry button.
 * Old stale records are cleared so they never look current.
 */
export function ErrorStateView({ error, onRetry }) {
  return (
    <div className="state-card error-card" role="alert">
      <AlertCircle size={32} className="text-rose" />
      <h3 className="state-title">Server Request Failed</h3>
      <p className="state-desc text-muted">
        {error || "An unexpected error occurred while fetching orders."}
      </p>
      <button type="button" className="btn-primary" onClick={onRetry}>
        <RefreshCw size={14} />
        <span>Retry Request</span>
      </button>
    </div>
  );
}

/**
 * Empty State:
 * Shown when no records match search/filter criteria.
 */
export function EmptyStateView({ onReset }) {
  return (
    <div className="state-card empty-card" role="status">
      <SearchX size={32} className="text-muted" />
      <h3 className="state-title">No Orders Found</h3>
      <p className="state-desc text-muted">
        No records match your active search and filter criteria.
      </p>
      <button type="button" className="btn-secondary" onClick={onReset}>
        Clear Filters
      </button>
    </div>
  );
}

/**
 * Modern Loading State:
 * Shows a glowing spinner, status text, and shimmering skeleton rows until data arrives.
 */
export function TableLoader({ message = "Loading orders from server..." }) {
  return (
    <div className="table-loader-container" aria-busy="true" aria-label="Loading orders dataset">
      <div className="loader-banner">
        <div className="spinner-wrapper">
          <Loader2 size={26} className="spinner-icon text-cyan" />
        </div>
        <div className="loader-text-group">
          <span className="loader-heading">{message}</span>
          <span className="loader-subtext">Fetching real-time orders from Supabase...</span>
        </div>
      </div>
      <div className="skeleton-list">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-row shimmer"
            style={{ opacity: Math.max(0.3, 1 - i * 0.08) }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return <TableLoader />;
}
