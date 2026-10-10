# Problem Statement 1: High-Performance Enterprise Orders Explorer

A fast, accessible, and resilient Data Explorer built over a large dataset (**10,000 order records** from `orders_10000.json`). It provides real-time search, multi-filter capability, sorting, virtualization, URL synchronization, race-condition immunity, honest state handling, and deep-linkable detail views.

---

## 🚀 Key Features & Architectural Guarantees

### 1. Controlled Mock API with Real-world Chaos
- **Dataset**: 10,000 records loaded from `src/data/orders_10000.json`.
- **Server-Side Operations**: Search across customer/company/ID/city/tracking, multi-status & priority & category filtering, sorting, and pagination.
- **Latency & Failure Simulation**: Adds random simulated latency (**200ms to 3s**) and fails roughly **1 in 10 requests (10% chaos rate)** to prove honest error handling.
- **AbortSignal Support**: Supports immediate cancellation of in-flight network promises using standard `AbortController`.

### 2. Zero Stale Results & Race Condition Protection
- **Debounced Search**: 250ms debounce prevents flooding the server on keystrokes.
- **Abort on Change**: Any new query, filter change, or pagination immediately aborts the pending request.
- **Monotonic Request ID**: Responses from superseded or slow earlier requests are automatically discarded if their request ID does not match the latest request counter.

### 3. State in the URL (Two-Way Sync & Deep-Linking)
- Query parameters (`q`, `status`, `priority`, `category`, `sort`, `order`, `page`, `pageSize`, `detailId`) live in the browser URL.
- **Browser Navigation**: Back/Forward buttons (`popstate`), page refreshes, and shared links restore the exact same view.
- **1-Click Share**: "Share View" button copies the exact deep-link to clipboard.

### 4. 60 FPS Virtualization (TanStack Virtual)
- Uses `@tanstack/react-virtual` to render only the visible ~15–20 rows in the DOM at any time.
- Smooth, jank-free scrolling through all 10,000 rows with minimal memory footprint.

### 5. Honest States
- **Loading**: Shimmering skeleton rows with `aria-busy="true"`.
- **Empty**: Contextual message when 0 records match, with a one-click "Clear Filters" action.
- **Error**: Prominent failure banner with simulated error details and a direct **Retry Request** button (old data is cleared so stale records never look current).
- **Chaos Toggle**: A toggle button in the header (`1-in-10 Failures: ON/OFF`) lets you easily disable or enable simulated errors during evaluation.

### 6. Accessible UI (WCAG 2.1 AA)
- Keyboard navigation: Arrow keys (`ArrowUp`/`ArrowDown`), `Enter`/`Space` to open detail, `Escape` to close drawer.
- Sortable table headers have `aria-sort="ascending" | "descending"`.
- ARIA live region announces result counts and page shifts to screen readers.

### 7. Slide-Over Detail View
- Clicking any row opens a slide-over drawer deep-linked via `?detailId=ORD-xxxxx`.
- Displays customer contact information, order total, logistics tracking, shipping destination, and internal notes.
- Closing the drawer updates the URL without altering the list's scroll position or active filters.

---

## 📂 Project Structure

```
src/
├── components/
│   ├── DetailDrawer.jsx    # Slide-over order detail view (deep-linkable)
│   ├── FilterBar.jsx       # Search input & filter dropdowns
│   ├── Pagination.jsx      # Page navigation, page size, and range indicator
│   ├── StateViews.jsx      # Loading skeleton, empty state, and error card
│   └── VirtualTable.jsx    # 60 FPS virtualized table (@tanstack/react-virtual)
├── data/
│   └── orders_10000.json   # 10,000 JSON records
├── hooks/
│   ├── useDataExplorer.js  # Fetching, cancellation, and race-condition prevention
│   ├── useDebounce.js      # Keystroke debounce hook
│   └── useUrlState.js      # Two-way URL synchronization hook
├── services/
│   ├── db.js               # In-memory dataset engine & schema exports
│   └── mockApi.js          # Mock API with latency, 1-in-10 failure, and AbortSignal
├── utils/
│   └── urlParams.js        # URL search params parser & stringifier
├── App.css                 # Clean, modern stylesheet
├── App.js                  # Main application component
├── App.test.js             # Automated unit & integration tests
├── index.css               # Design tokens & theme variables
└── index.js                # React root entry point
```

---

## 🛠️ Scripts & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm start
```
Opens [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Test Suite
```bash
npm test -- --watchAll=false
```

### 4. Build Production Bundle
```bash
npm run build
```
Creates an optimized production bundle in the `build/` folder.
