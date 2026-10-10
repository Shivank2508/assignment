const API_URL = process.env.REACT_APP_API_URL || "https://assignment-lhft.onrender.com/api/orders";

export const getTotalOrdersCount = () => 10000;

/**
 * Fetch orders from backend API with search, filter, sort, and pagination
 */
export async function fetchOrders(params = {}, { signal } = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}?${query.toString()}`, { signal });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server Error ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch single order by ID for detail view
 */
export async function fetchOrderById(id, { signal } = {}) {
  const response = await fetch(`${API_URL}/${id}`, { signal });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Order ${id} not found.`);
  }

  return response.json();
}
