import { getMockOrders } from "./db";

const allOrders = getMockOrders(10000);

export function getTotalOrdersCount() {
  return allOrders.length;
}

let simulateFailures = true;

export function setSimulateFailures(enabled) {
  simulateFailures = enabled;
}

export function getSimulateFailures() {
  return simulateFailures;
}

/**
 * Mock API: Server-side search, filter, sort, pagination, random latency, 1-in-10 failure, and AbortSignal support.
 */
export async function fetchOrders(params = {}, { signal } = {}) {
  const {
    q = "",
    status = "",
    priority = "",
    category = "",
    sort = "createdAt",
    order = "desc",
    page = 1,
    pageSize = 50
  } = params;

  // 1. Random latency between 200ms and 3000ms (as required)
  const latency = Math.floor(200 + Math.random() * 2800);

  return new Promise((resolve, reject) => {
    let timerId = null;

    // Handle AbortController cancellation
    const onAbort = () => {
      if (timerId) clearTimeout(timerId);
      reject(new DOMException("Request was aborted", "AbortError"));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    timerId = setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }

      // 2. 1 in 10 random requests fail (10% error rate as required)
      const shouldFail = simulateFailures && Math.random() < 0.10;
      if (shouldFail) {
        reject(new Error("Server Error 500: Temporary database timeout (simulated 1-in-10 failure)."));
        return;
      }

      // 3. Server-side Search
      let filtered = allOrders;
      if (q && q.trim()) {
        const queryTerm = q.trim().toLowerCase();
        filtered = filtered.filter(item => (
          item.id.toLowerCase().includes(queryTerm) ||
          item.customer.name.toLowerCase().includes(queryTerm) ||
          item.customer.company.toLowerCase().includes(queryTerm) ||
          item.city.toLowerCase().includes(queryTerm) ||
          item.trackingNumber.toLowerCase().includes(queryTerm)
        ));
      }

      // 4. Server-side Filtering
      if (status) {
        filtered = filtered.filter(item => item.status === status);
      }
      if (priority) {
        filtered = filtered.filter(item => item.priority === priority);
      }
      if (category) {
        filtered = filtered.filter(item => item.category === category);
      }

      // 5. Server-side Sorting
      const sorted = [...filtered].sort((a, b) => {
        let aVal = a[sort];
        let bVal = b[sort];

        if (sort === "customer") {
          aVal = a.customer.name;
          bVal = b.customer.name;
        }

        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
      });

      // 6. Server-side Pagination
      const currentPage = Math.max(1, parseInt(page, 10) || 1);
      const limit = Math.max(10, parseInt(pageSize, 10) || 50);
      const total = sorted.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const validPage = Math.min(currentPage, totalPages);
      const offset = (validPage - 1) * limit;
      const paginatedData = sorted.slice(offset, offset + limit);

      resolve({
        data: paginatedData,
        total,
        page: validPage,
        pageSize: limit,
        totalPages,
        latencyMs: latency
      });
    }, latency);
  });
}

/**
 * Fetch a single order by ID for the detail drawer view
 */
export async function fetchOrderById(id, { signal } = {}) {
  const latency = Math.floor(150 + Math.random() * 250);

  return new Promise((resolve, reject) => {
    let timerId = null;

    const onAbort = () => {
      if (timerId) clearTimeout(timerId);
      reject(new DOMException("Request was aborted", "AbortError"));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }

    timerId = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      const searchId = String(id).toUpperCase();
      const order = allOrders.find(item => 
        String(item.id).toUpperCase() === searchId || 
        String(item.id).toUpperCase() === `ORD-${searchId}`
      );
      if (!order) {
        reject(new Error(`Order ${id} not found.`));
        return;
      }
      resolve(order);
    }, latency);
  });
}
