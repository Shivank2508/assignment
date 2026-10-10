import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

export function VirtualTable({
  data = [],
  sort = "createdAt",
  order = "desc",
  onSort,
  selectedId,
  onSelectRow
}) {
  const parentRef = useRef(null);

  // TanStack Virtualizer: Only renders visible rows in DOM (~15-20 rows out of thousands)
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 6
  });

  const renderSortIcon = (field) => {
    if (sort !== field) return <ArrowUpDown size={13} className="sort-icon-muted" />;
    return order === "asc" ? <ArrowUp size={13} className="sort-icon-active" /> : <ArrowDown size={13} className="sort-icon-active" />;
  };

  const getAriaSort = (field) => {
    if (sort !== field) return "none";
    return order === "asc" ? "ascending" : "descending";
  };

  return (
    <div className="table-wrapper" role="region" aria-label="Orders Data Table">
      {/* Sticky Table Header */}
      <div className="table-header-row" role="row">
        <div
          role="columnheader"
          aria-sort={getAriaSort("id")}
          className="th-cell col-id sortable"
          onClick={() => onSort("id")}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort("id")}
        >
          <span>Order ID</span>
          {renderSortIcon("id")}
        </div>

        <div
          role="columnheader"
          aria-sort={getAriaSort("customer")}
          className="th-cell col-customer sortable"
          onClick={() => onSort("customer")}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort("customer")}
        >
          <span>Customer & Company</span>
          {renderSortIcon("customer")}
        </div>

        <div
          role="columnheader"
          aria-sort={getAriaSort("status")}
          className="th-cell col-status sortable"
          onClick={() => onSort("status")}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort("status")}
        >
          <span>Status</span>
          {renderSortIcon("status")}
        </div>

        <div
          role="columnheader"
          aria-sort={getAriaSort("priority")}
          className="th-cell col-priority sortable"
          onClick={() => onSort("priority")}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort("priority")}
        >
          <span>Priority</span>
          {renderSortIcon("priority")}
        </div>

        <div
          role="columnheader"
          aria-sort={getAriaSort("amount")}
          className="th-cell col-amount sortable"
          onClick={() => onSort("amount")}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort("amount")}
        >
          <span>Amount</span>
          {renderSortIcon("amount")}
        </div>

        <div
          role="columnheader"
          aria-sort={getAriaSort("category")}
          className="th-cell col-category sortable"
          onClick={() => onSort("category")}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort("category")}
        >
          <span>Category</span>
          {renderSortIcon("category")}
        </div>

        <div role="columnheader" className="th-cell col-city">
          <span>City</span>
        </div>

        <div
          role="columnheader"
          aria-sort={getAriaSort("createdAt")}
          className="th-cell col-date sortable"
          onClick={() => onSort("createdAt")}
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSort("createdAt")}
        >
          <span>Date</span>
          {renderSortIcon("createdAt")}
        </div>

        <div role="columnheader" className="th-cell col-action">
          <span>View</span>
        </div>
      </div>

      {/* Virtual Scroll Area */}
      <div ref={parentRef} className="virtual-viewport custom-scrollbar" tabIndex={0} role="grid">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative"
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const orderItem = data[virtualRow.index];
            if (!orderItem) return null;

            const isSelected = selectedId === orderItem.id;
            const dateFormatted = new Date(orderItem.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            return (
              <div
                key={orderItem.id}
                role="row"
                tabIndex={0}
                aria-selected={isSelected}
                className={`table-row ${isSelected ? "row-selected" : ""}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
                onClick={() => onSelectRow(orderItem.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectRow(orderItem.id);
                  }
                }}
              >
                <div role="gridcell" className="td-cell col-id font-mono text-cyan">
                  {orderItem.id}
                </div>

                <div role="gridcell" className="td-cell col-customer">
                  <div className="customer-cell">
                    <span className="customer-name">{orderItem.customer.name}</span>
                    <span className="customer-company text-muted">{orderItem.customer.company}</span>
                  </div>
                </div>

                <div role="gridcell" className="td-cell col-status">
                  <span className={`status-pill status-${orderItem.status}`}>
                    {orderItem.status}
                  </span>
                </div>

                <div role="gridcell" className="td-cell col-priority">
                  <span className={`priority-pill priority-${orderItem.priority}`}>
                    {orderItem.priority}
                  </span>
                </div>

                <div role="gridcell" className="td-cell col-amount font-mono">
                  ${orderItem.amount.toFixed(2)}
                </div>

                <div role="gridcell" className="td-cell col-category">
                  {orderItem.category}
                </div>

                <div role="gridcell" className="td-cell col-city text-muted">
                  {orderItem.city}
                </div>

                <div role="gridcell" className="td-cell col-date text-muted">
                  {dateFormatted}
                </div>

                <div role="gridcell" className="td-cell col-action">
                  <button
                    type="button"
                    className="btn-view-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRow(orderItem.id);
                    }}
                    aria-label={`View details for ${orderItem.id}`}
                  >
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
