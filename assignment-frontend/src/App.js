import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useUrlState } from "./hooks/useUrlState";
import { useDebounce } from "./hooks/useDebounce";
import { useDataExplorer } from "./hooks/useDataExplorer";
import { getTotalOrdersCount } from "./services/mockApi";

import { FilterBar } from "./components/FilterBar";
import { VirtualTable } from "./components/VirtualTable";
import { Pagination } from "./components/Pagination";
import { DetailDrawer } from "./components/DetailDrawer";
import { ErrorStateView, EmptyStateView, TableLoader } from "./components/StateViews";
import { Database, Loader2 } from "lucide-react";

import "./App.css";

export default function App() {
  const totalRecords = useMemo(() => getTotalOrdersCount(), []);

  // 1. URL State: Reads and writes search, filters, sort, page, and detailId to the URL
  const { state: urlState, updateState, resetFilters } = useUrlState();

  // 2. Search Input Local State & Debounce
  const [searchInput, setSearchInput] = useState(urlState.q);
  const { debouncedValue: debouncedQuery, isDebouncing } = useDebounce(searchInput, 250);
  const isFirstRenderRef = useRef(true);
  const lastSyncedUrlQRef = useRef(urlState.q);

  // Sync debounced search to URL state
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (debouncedQuery !== urlState.q) {
      lastSyncedUrlQRef.current = debouncedQuery;
      updateState(prev => ({ ...prev, q: debouncedQuery, page: 1 }), true);
    }
  }, [debouncedQuery, urlState.q, updateState]);

  // Sync input if URL query changes externally (e.g. Back/Forward browser buttons)
  useEffect(() => {
    if (urlState.q !== lastSyncedUrlQRef.current) {
      lastSyncedUrlQRef.current = urlState.q;
      setSearchInput(urlState.q);
    }
  }, [urlState.q]);

  // 3. Query params passed to the Data Explorer
  const queryParams = useMemo(() => ({
    q: urlState.q,
    status: urlState.status,
    priority: urlState.priority,
    category: urlState.category,
    sort: urlState.sort,
    order: urlState.order,
    page: urlState.page,
    pageSize: urlState.pageSize
  }), [
    urlState.q,
    urlState.status,
    urlState.priority,
    urlState.category,
    urlState.sort,
    urlState.order,
    urlState.page,
    urlState.pageSize
  ]);

  // 4. Data Explorer: Handles fetch, AbortController cancellation, and race-condition prevention
  const { data, meta, isLoading, isError, error, retry } = useDataExplorer(queryParams);

  // Filter change handlers
  const handleStatusChange = useCallback((status) => {
    updateState(prev => ({ ...prev, status, page: 1 }));
  }, [updateState]);

  const handlePriorityChange = useCallback((priority) => {
    updateState(prev => ({ ...prev, priority, page: 1 }));
  }, [updateState]);

  const handleCategoryChange = useCallback((category) => {
    updateState(prev => ({ ...prev, category, page: 1 }));
  }, [updateState]);

  const handleSortChange = useCallback((sort) => {
    updateState(prev => ({ ...prev, sort, page: 1 }));
  }, [updateState]);

  const handleOrderToggle = useCallback(() => {
    updateState(prev => ({ ...prev, order: prev.order === "asc" ? "desc" : "asc", page: 1 }));
  }, [updateState]);

  const handleSortFromColumn = useCallback((column) => {
    updateState(prev => {
      if (prev.sort === column) {
        return { ...prev, order: prev.order === "asc" ? "desc" : "asc", page: 1 };
      }
      return { ...prev, sort: column, order: "desc", page: 1 };
    });
  }, [updateState]);

  const handlePageChange = useCallback((newPage) => {
    updateState(prev => ({ ...prev, page: newPage }));
  }, [updateState]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    updateState(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  }, [updateState]);

  const handleSelectRow = useCallback((detailId) => {
    updateState(prev => ({ ...prev, detailId }));
  }, [updateState]);

  const handleCloseDetail = useCallback(() => {
    updateState(prev => ({ ...prev, detailId: "" }));
  }, [updateState]);

  const handleResetFilters = useCallback(() => {
    setSearchInput("");
    lastSyncedUrlQRef.current = "";
    resetFilters();
  }, [resetFilters]);

  const hasActiveFilters = Boolean(urlState.q || urlState.status || urlState.priority || urlState.category);

  return (
    <div className="app-container">
      {/* Screen Reader Announcement Live Region */}
      <div className="sr-only" role="status" aria-live="polite">
        {!isLoading && !isError && `Loaded ${meta.total} orders, page ${meta.page} of ${meta.totalPages}`}
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="header-title">
            Orders <span className="text-cyan">Explorer</span>
          </h1>
          <div className="dataset-pill">
            <Database size={13} className="text-cyan" />
            <span>{totalRecords.toLocaleString()} Total Records</span>
          </div>
        </div>


      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Search & Filters */}
        <FilterBar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          isDebouncing={isDebouncing}
          status={urlState.status}
          onStatusChange={handleStatusChange}
          priority={urlState.priority}
          onPriorityChange={handlePriorityChange}
          category={urlState.category}
          onCategoryChange={handleCategoryChange}
          sort={urlState.sort}
          order={urlState.order}
          onSortChange={handleSortChange}
          onOrderToggle={handleOrderToggle}
          onReset={handleResetFilters}
          hasFilters={hasActiveFilters}
        />

        {/* Results Data Section */}
        <section className="table-card">
          <div className="table-meta-bar">
            {isLoading ? (
              <span className="text-cyan meta-loading-indicator">
                <Loader2 size={14} className="spinner-icon" />
                <span>Loading latest orders from server...</span>
              </span>
            ) : (
              <span>
                Found <strong>{meta.total.toLocaleString()}</strong> orders
                {meta.latencyMs > 0 && <span className="text-muted"> (Latency: {meta.latencyMs}ms)</span>}
              </span>
            )}
          </div>

          {/* Conditional Views: Error, Loading, Empty, or Virtual Table */}
          {isError ? (
            <ErrorStateView error={error} onRetry={retry} />
          ) : isLoading ? (
            <TableLoader />
          ) : data.length === 0 ? (
            <EmptyStateView onReset={handleResetFilters} />
          ) : (
            <VirtualTable
              data={data}
              sort={urlState.sort}
              order={urlState.order}
              onSort={handleSortFromColumn}
              selectedId={urlState.detailId}
              onSelectRow={handleSelectRow}
            />
          )}

          {/* Pagination */}
          {!isError && meta.total > 0 && (
            <Pagination
              page={meta.page}
              pageSize={meta.pageSize}
              total={meta.total}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={isLoading}
            />
          )}
        </section>
      </main>

      {/* Deep-Linked Detail Drawer View */}
      {urlState.detailId && (
        <DetailDrawer
          detailId={urlState.detailId}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
