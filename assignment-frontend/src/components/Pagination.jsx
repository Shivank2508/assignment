import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page = 1,
  pageSize = 50,
  total = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  isLoading
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="pagination-container" role="navigation" aria-label="Pagination">
      <div className="pagination-text">
        Showing <strong className="text-cyan font-mono">{start.toLocaleString()}</strong>–
        <strong className="text-cyan font-mono">{end.toLocaleString()}</strong> of{" "}
        <strong className="font-mono">{total.toLocaleString()}</strong> records
      </div>

      <div className="pagination-actions">
        {/* Page size */}
        <div className="page-size-box">
          <label htmlFor="pageSizeInput" className="text-muted">Per page:</label>
          <select
            id="pageSizeInput"
            className="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        {/* Prev / Next buttons */}
        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <span className="page-badge font-mono">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          className="btn-page"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
