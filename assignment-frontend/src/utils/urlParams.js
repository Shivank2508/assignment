/**
 * Helpers to read and write explorer state to the browser URL
 */

export const DEFAULT_STATE = {
  q: "",
  status: "",
  priority: "",
  category: "",
  sort: "createdAt",
  order: "desc",
  page: 1,
  pageSize: 50,
  detailId: ""
};

/**
 * Parse URL query string into an object
 */
export function parseUrlParams(search = window.location.search) {
  const params = new URLSearchParams(search);

  return {
    q: params.get("q") || "",
    status: params.get("status") || "",
    priority: params.get("priority") || "",
    category: params.get("category") || "",
    sort: params.get("sort") || DEFAULT_STATE.sort,
    order: params.get("order") || DEFAULT_STATE.order,
    page: parseInt(params.get("page") || "1", 10),
    pageSize: parseInt(params.get("pageSize") || "50", 10),
    detailId: params.get("detailId") || ""
  };
}

/**
 * Convert explorer state to URL query string
 */
export function stringifyUrlParams(state) {
  const params = new URLSearchParams();

  if (state.q) params.set("q", state.q.trim());
  if (state.status) params.set("status", state.status);
  if (state.priority) params.set("priority", state.priority);
  if (state.category) params.set("category", state.category);
  if (state.sort && state.sort !== DEFAULT_STATE.sort) params.set("sort", state.sort);
  if (state.order && state.order !== DEFAULT_STATE.order) params.set("order", state.order);
  if (state.page && state.page > 1) params.set("page", String(state.page));
  if (state.pageSize && state.pageSize !== DEFAULT_STATE.pageSize) params.set("pageSize", String(state.pageSize));
  if (state.detailId) params.set("detailId", state.detailId);

  const str = params.toString();
  return str ? `?${str}` : "";
}
