const supabase = require('../config/supabase');

// Column mapping from frontend camelCase to database column names
const SORT_COLUMNS = {
  createdAt: 'created_at',
  customer: 'customer_name',
  trackingNumber: 'tracking_number',
  itemsCount: 'items_count',
  amount: 'amount',
  status: 'status',
  priority: 'priority',
  category: 'category',
  city: 'city',

  id: 'id'
};

function formatOrder(row) {
  if (!row) return null;
  return {
    id: typeof row.id === 'number' ? `ORD-${row.id}` : row.id,
    customer: row.customer || {
      name: row.customer_name || '',
      email: row.customer_email || '',
      company: row.customer_company || ''
    },
    amount: Number(row.amount || 0),
    status: row.status,
    priority: row.priority,
    category: row.category,
    city: row.city,
    trackingNumber: row.tracking_number || row.trackingNumber || '',
    createdAt: row.created_at || row.createdAt,
    itemsCount: row.items_count ?? row.itemsCount ?? 0,
    notes: row.notes || ''
  };
}

/**
 * Fetch orders from Supabase with server-side search, filtering, sorting, and pagination
 */
async function getOrders(params = {}) {
  const {
    q = '',
    status = '',
    priority = '',
    category = '',
    sort = 'createdAt',
    order = 'desc',
    page = 1,
    pageSize = 50
  } = params;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const limit = Math.max(1, parseInt(pageSize, 10) || 50);
  const offset = (currentPage - 1) * limit;

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' });

  // 1. Server-side Search
  if (q && q.trim()) {
    const term = `%${q.trim().replace(/,/g, '')}%`;
    const numericId = parseInt(q.replace(/\D/g, ''), 10);

    if (!isNaN(numericId)) {
      query = query.or(`id.eq.${numericId},customer_name.ilike.${term},customer_company.ilike.${term},city.ilike.${term},tracking_number.ilike.${term}`);
    } else {
      query = query.or(`customer_name.ilike.${term},customer_company.ilike.${term},city.ilike.${term},tracking_number.ilike.${term}`);
    }
  }

  // 2. Server-side Filtering
  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (category) query = query.eq('category', category);

  // 3. Server-side Sorting
  const sortColumn = SORT_COLUMNS[sort] || sort;
  query = query.order(sortColumn, { ascending: String(order).toLowerCase() === 'asc' });

  // 4. Server-side Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count || 0;
  return {
    data: (data || []).map(formatOrder),
    total,
    page: currentPage,
    pageSize: limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

/**
 * Fetch a single order by ID
 */
async function getOrderById(id) {
  const numericId = parseInt(String(id).replace(/\D/g, ''), 10);
  if (isNaN(numericId)) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', numericId)
    .maybeSingle();

  if (error) throw error;
  return formatOrder(data);
}

module.exports = {
  getOrders,
  getOrderById
};
