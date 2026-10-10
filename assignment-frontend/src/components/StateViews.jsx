import React from "react";
import { AlertCircle, RefreshCw, SearchX } from "lucide-react";

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
 * Skeleton Loader:
 * Shimmering rows shown during initial/fresh loading with aria-busy="true".
 */
export function TableSkeleton() {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Loading orders dataset">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="skeleton-row shimmer"></div>
      ))}
    </div>
  );
}
