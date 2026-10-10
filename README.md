# Enterprise Orders Explorer (Full-Stack Monorepo)

A high-performance, accessible, and resilient Data Explorer built over a large dataset (**10,000 order records**). Powered by a **React 19** frontend deployed on **Netlify**, an **Express.js** backend deployed on **Render**, and a **PostgreSQL** database on **Supabase**.

---

## 🌐 1. Live Deployment Links

- **Frontend (Live App)**: `https://<your-site-name>.netlify.app` *(Replace with your Netlify site URL)*
- **Backend (API)**: [https://assignment-lhft.onrender.com](https://assignment-lhft.onrender.com)
  - **Health Check**: [https://assignment-lhft.onrender.com/health](https://assignment-lhft.onrender.com/health)
  - **Orders API**: [https://assignment-lhft.onrender.com/api/orders?limit=10](https://assignment-lhft.onrender.com/api/orders?limit=10)
- **Database**: PostgreSQL hosted on Supabase

---

## 📹 2. Demo Video Walkthrough Guide (< 5 Minutes)

Use this step-by-step script when recording your demo video:

| Timestamp | Topic | What to Show & Say |
| :--- | :--- | :--- |
| **0:00 – 1:00** | **App Overview & Virtualization** | • Open the live app.<br>• Scroll smoothly through the table (explain **TanStack Virtual** keeping only ~15 DOM nodes rendered for 60 FPS).<br>• Point out the total dataset count (10,000 records). |
| **1:00 – 2:00** | **Search, Filtering, & URL State** | • Type a search query (e.g. `electronics` or a customer name) and observe debouncing (250ms).<br>• Apply multi-criteria filters (Status: `shipped`, Priority: `high`).<br>• Click a row to open the deep-linked detail drawer (`?detailId=ORD-xxxx`).<br>• Copy the URL, open an incognito window, and paste it: show how the exact filters and open drawer state restore instantly. |
| **2:00 – 3:30** | **Live Failure & Edge Case (Chaos Testing)** | • **Simulated 10% Backend Failure**: Demonstrate honest error handling when the server returns a 500 status. Show the error banner and click **"Retry Request"** to recover.<br>• **DevTools Network Throttling**: Open Chrome DevTools -> Network Tab -> select **"Slow 3G"**.<br>• Show the glowing animated loader (`TableLoader`) and skeletons indicating data is being fetched until response arrives.<br>• **Race Condition Prevention**: Rapidly type different queries in DevTools Network tab to show earlier in-flight requests canceled via `AbortController` (canceled requests in red), proving zero stale data. |
| **3:30 – 4:30** | **Offline Edge Case** | • In Chrome DevTools Network tab, select **"Offline"**.<br>• Trigger a page or filter shift.<br>• Show the honest error card with the failure message.<br>• Switch back to **"Online"** and click **"Retry Request"** to immediately restore the view. |
| **4:30 – 5:00** | **Summary & Architectural Takeaways** | • Wrap up highlighting the robust state model: URL sync, AbortController race-condition immunity, and 60 FPS virtualization. |

---

## 🏛️ 3. Architecture & State Management Decisions

### Key Decisions
1. **URL as the Single Source of Truth**:
   - Filter criteria (`q`, `status`, `priority`, `category`), sorting (`sort`, `order`), pagination (`page`, `pageSize`), and drawer state (`detailId`) are synced directly into the browser URL search params via `useUrlState`.
   - **Why?** Guarantees deep-linkability, persistent state on page reload, and flawless back/forward browser history navigation without external heavy state libraries.
2. **TanStack Virtual Table (`@tanstack/react-virtual`)**:
   - Rather than rendering 10,000 DOM rows (which causes browser freezes and high memory usage), the table dynamically renders only the rows visible in the viewport (~15–20 DOM elements).
   - Recycles DOM elements with absolute CSS transforms for 60 FPS scrolling.
3. **Race-Condition Immunity (`AbortController` + Monotonic ID)**:
   - When users type rapidly or click filters in succession, network responses often return out of order.
   - We combine two defensive mechanisms:
     1. `AbortController.abort()` immediately cancels the previous fetch request.
     2. A monotonic `requestIdRef` counter discards any superseded responses if they arrive late.
4. **Honest State Handling**:
   - **Loading State**: An animated spinner and shimmering skeleton loader (`<TableLoader />`) informs the user until data arrives.
   - **Error State**: Displays the exact failure cause and an instant **"Retry Request"** action. Stale data is cleared so out-of-date records are never misrepresented as current.
   - **Empty State**: Friendly messaging with a 1-click **"Clear Filters"** button when no records match.
5. **Decoupled Monorepo Architecture**:
   - **Frontend**: Lightweight React 19 client with pure CSS styling (no heavy UI frameworks).
   - **Backend**: Express 5 REST API on Render with Supabase PostgreSQL connection, parameterized queries, and chaos engineering middleware (200ms–3s latency, 10% failure injection) to stress-test UI resilience.

### Tradeoffs Made
| Decision | Alternative Considered | Why We Chose It |
| :--- | :--- | :--- |
| **Server-side Pagination with Limit/Offset** | Loading all 10,000 rows to the client at once | Loading all 10,000 records in JSON at once bloats initial payload (>5MB) and delays initial paint. Server-side queries return in ~25KB per page. |
| **URL State instead of Redux/Zustand** | Redux Toolkit / Zustand store | For a data explorer, users expect to bookmark and share views. URL-native state eliminates synchronization mismatches between client store and browser URL. |
| **Vanilla CSS with Custom Tokens** | TailwindCSS or UI component libraries (MUI/AntD) | Zero bundle overhead, full granular control over responsive breakpoints, high-performance animations, and custom scrollbars. |
| **250ms Debounce** | Immediate query execution on every keystroke | Instant requests choke network and backend during typing; 250ms provides instantaneous user feel while reducing query volume by >80%. |

---

## 🧪 4. Automated Tests

The automated test suite in [`assignment-frontend/src/App.test.js`](file:///c:/Users/shivank/Desktop/assignment/assignment-frontend/src/App.test.js) focuses on the trickiest behaviors:

1. **AbortSignal Cancellation Test**:
   - Validates that passing an aborted `AbortSignal` correctly cancels the in-flight request, throwing an `AbortError`.
2. **Server-Side Search & Pagination Test**:
   - Exercises real query filtering against the dataset (customer name search, status filters, page limits) and validates schema fields (`amount`, `customer`, `status`).
   - Accounts for simulated 10% chaos failures with retry assertions.
3. **Deep-Linked Order Detail Fetch**:
   - Tests `fetchOrderById` to verify retrieval of full customer details, addresses, and tracking notes.
4. **URL Serialization & Deserialization**:
   - Tests two-way parsing and serialization between complex filter objects and browser query strings.
5. **UI Rendering & Search Interaction**:
   - Tests initial UI mounting, screen reader labels, search input typing, and search clear buttons.

To run tests:
```bash
cd assignment-frontend
npm test -- --watchAll=false
```

---

## 📚 5. Sources & References

- **Libraries & Frameworks**:
  - [React 19](https://react.dev/) — Core UI library
  - [@tanstack/react-virtual](https://tanstack.com/virtual/latest) — Headless virtualization for smooth DOM recycling
  - [Lucide React](https://lucide.dev/) — Accessible, lightweight SVG icon system
  - [Express.js](https://expressjs.com/) — Node.js backend server
  - [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) — PostgreSQL database client
- **Cloud Infrastructure & Free-Tier Services**:
  - [Netlify](https://www.netlify.com/) — Frontend continuous deployment and edge CDN
  - [Render](https://render.com/) — Backend web service hosting
  - [Supabase](https://supabase.com/) — Managed PostgreSQL database
- **Web Standards & Documentation**:
  - [MDN Web Docs: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — Network request cancellation
  - [MDN Web Docs: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — URL state synchronization
  - [W3C WCAG 2.1 AA Standards](https://www.w3.org/WAI/WCAG21/quickref/) — Accessibility, ARIA live regions, and keyboard semantics

---

## 🤖 6. AI Usage Disclosure

In compliance with assignment guidelines, AI tools were utilized during the development of this project:

- **AI Tools Used**: Google DeepMind Antigravity / Gemini 3.8 / Claude 3.5 Sonnet
- **How AI Was Directed**:
  - Generating initial seed schemas and PostgreSQL migrations for 10,000 order records.
  - Designing chaos engineering middleware to simulate realistic 200ms–3s latency spikes and 10% failure rates.
  - Crafting robust TypeScript/JavaScript hooks for `AbortController` cancellation and monotonic request tracking.
  - Formulating edge-case test specs in React Testing Library.
- **Review and Iteration Process**:
  - Every AI suggestion was manually verified against active code, tested in browser DevTools, and validated through automated test runs.
  - Resolved CI build issues (`process.env.CI = true` ESLint warnings on Netlify) and deployment configuration on Render monorepo structure.

---

## 💻 Local Setup & Development

### Prerequisites
- Node.js v18+ 
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Shivank2508/assignment.git
cd assignment
```

### 2. Run the Backend
```bash
cd assignment-backend
npm install
npm run dev
```
The backend will run on `http://localhost:5000`.

### 3. Run the Frontend
```bash
cd ../assignment-frontend
npm install
npm start
```
The frontend will open on `http://localhost:3000`.
