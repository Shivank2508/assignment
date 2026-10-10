# Frontend Developer Assignment — Final Submission Document

## Candidate Information & Links
- **GitHub Repository (Public)**: [https://github.com/Shivank2508/assignment](https://github.com/Shivank2508/assignment)
- **Live Frontend Application**: `https://<your-site-name>.netlify.app` *(Replace with your Netlify site URL)*
- **Live Backend API**: [https://assignment-lhft.onrender.com](https://assignment-lhft.onrender.com)
  - **Health Check**: [https://assignment-lhft.onrender.com/health](https://assignment-lhft.onrender.com/health)
  - **Orders API**: [https://assignment-lhft.onrender.com/api/orders?limit=10](https://assignment-lhft.onrender.com/api/orders?limit=10)
- **Database**: PostgreSQL hosted on Supabase (10,000 order records)
- **Demo Video Link**: `<Paste your 5-min demo video link here (Loom/Google Drive/YouTube)>`

---

## 1. Live Deployment Details
The application is deployed across cloud free tiers with full monorepo CI/CD:
- **Frontend**: Deployed on **Netlify** with continuous deployment connected to the GitHub repository `main` branch. Configured with single-page app redirection rules (`_redirects`) to guarantee refresh reliability across deep-linked routes.
- **Backend**: Deployed on **Render** as a Node.js / Express Web Service with automated deployment from Git. 
- **Database**: Cloud-hosted PostgreSQL instance on **Supabase** containing all 10,000 order records with indexed columns for performant filtering, searching, and sorting.

---

## 2. Short Demo Video Walkthrough Guide (< 5 Minutes)

Use this script during your video walkthrough to cover all required criteria:

| Time | Section | Actions & Talking Points |
| :--- | :--- | :--- |
| **0:00 – 1:00** | **App Overview & 60 FPS Virtualization** | • Open the live app in your browser.<br>• Point out the **10,000 Total Records** counter in the header.<br>• Scroll rapidly through the table to demonstrate **TanStack Virtual** — explain that only ~15 to 20 DOM nodes exist in memory at any given time, ensuring zero scroll jank or memory leaks. |
| **1:00 – 2:00** | **Search, Filtering, & URL State** | • Type in the search box (e.g. `electronics`, `Austin`, or a customer name); explain the **250ms debounce** preventing excess queries.<br>• Combine multiple filters: Status (`shipped`), Priority (`high`).<br>• Click an order row to open the **deep-linked slide-over detail drawer** (`?detailId=ORD-xxxx`).<br>• Copy the full URL, open an **Incognito window**, and paste it: show how all active filters and the open drawer restore identically. |
| **2:00 – 3:30** | **Failure & Network Edge Cases (Live Demo)** | • **10% Chaos Failure Rate**: The backend has built-in chaos middleware that randomly injects a 10% failure rate (HTTP 500). When a failure occurs, demonstrate the **honest error banner** and click **"Retry Request"** to show instant recovery.<br>• **Network Throttling**: Open Chrome DevTools (`F12`) -> **Network** tab -> select **"Slow 3G"**.<br>• Trigger a filter or page change to show the animated `<TableLoader />` spinner and shimmering skeleton rows clearly indicating data is loading until the response arrives.<br>• **Race Condition Prevention**: Rapidly change search queries while throttled: show earlier in-flight requests canceled via `AbortController` (highlighted red in DevTools Network tab), proving stale data never overrides current data. |
| **3:30 – 4:30** | **Offline Mode Edge Case** | • In Chrome DevTools Network tab, switch network mode to **"Offline"**.<br>• Change page or filter.<br>• Show the honest error card displaying network failure.<br>• Switch back to **"Online"** and click **"Retry Request"** to immediately reload data. |
| **4:30 – 5:00** | **Architecture Wrap-Up** | • Conclude with key technical highlights: zero stale results via `AbortController` + monotonic request IDs, URL as single source of truth, and WCAG 2.1 AA keyboard accessibility. |

---

## 3. Key Architecture & State-Management Decisions

### Key Decisions
1. **URL as the Single Source of Truth**:
   - Every piece of exploration state (`q`, `status`, `priority`, `category`, `sort`, `order`, `page`, `pageSize`, `detailId`) is synchronized directly with the browser URL query string via a custom `useUrlState` hook.
   - **Rationale**: Eliminates synchronization divergence between client state and browser navigation. Users can reload, bookmark, or share the exact view with colleagues.
2. **TanStack Virtual (`@tanstack/react-virtual`)**:
   - Rather than rendering thousands of DOM elements which freezes browsers, the virtualizer measures viewport scroll height and renders only the ~15–20 items currently visible, reusing elements via absolute CSS transforms.
3. **Race-Condition Immunity (`AbortController` + Monotonic ID Counter)**:
   - When users type fast or toggle filters repeatedly, network responses may arrive out of order.
   - We implemented two layers of defense:
     1. `AbortController.abort()` immediately cancels in-flight fetch promises.
     2. A monotonic `requestIdRef` counter discards any superseded responses that were already delivered before abort could fire.
4. **Honest States (Loading, Empty, Error)**:
   - **Loading**: An animated spinner and shimmering skeleton loader (`<TableLoader />`) informs the user until data arrives.
   - **Error**: Displays clear error messages with a **"Retry Request"** button. Stale records are cleared so old data is never falsely presented as current.
   - **Empty**: Contextual empty state with a 1-click **"Clear Filters"** button when search criteria yield 0 results.
5. **Decoupled Client-Server Architecture**:
   - **Frontend**: Clean React 19 single-page application styled with pure CSS (modern design tokens, dark theme, smooth micro-animations).
   - **Backend**: Express REST API on Render connected to Supabase PostgreSQL, featuring parameterized SQL queries, pagination, and chaos simulation middleware.

### Tradeoffs Made
| Decision | Alternative | Justification |
| :--- | :--- | :--- |
| **Server-Side Pagination** | Client-Side 10,000 JSON Download | Sending all 10,000 rows upfront creates a multi-megabyte payload delaying first contentful paint. Server-side queries return in ~25KB per page. |
| **URL-Native State** | Redux Toolkit / Zustand | Eliminates bundle bloat and avoids dual-state desynchronization bugs between client store and browser URL bar. |
| **Vanilla CSS Design System** | TailwindCSS or Component Library (MUI/AntD) | 0KB external CSS runtime, full control over transitions, custom scrollbars, and WCAG contrast compliance. |
| **250ms Debounce** | Immediate keystroke queries | Instant queries create excessive network noise; 250ms feels instantaneous while slashing server requests by >80%. |

---

## 4. Automated Tests

The test suite in [`assignment-frontend/src/App.test.js`](file:///c:/Users/shivank/Desktop/assignment/assignment-frontend/src/App.test.js) focuses on critical edge-case behaviors:

1. **AbortSignal Cancellation**:
   - Verifies that passing an aborted `AbortSignal` to the API client properly rejects the promise with an `AbortError`.
2. **Server-Side Search & Pagination**:
   - Validates live querying against the dataset (searching customer names, filtering statuses, enforcing page size) and validates data integrity with built-in retry logic for chaos tolerance.
3. **Deep-Linked Order Fetching**:
   - Validates `fetchOrderById` correctly fetches full customer and logistics details for single order views.
4. **URL Query Serialization & Parsing**:
   - Tests two-way conversion between complex filter objects and browser query strings.
5. **UI Mounting & Search Interaction**:
   - Tests header rendering, total record counter display, search input typing, and search clear action.

Run tests locally:
```bash
cd assignment-frontend
npm test -- --watchAll=false
```

---

## 5. Sources & References

- **Libraries & Core Technologies**:
  - [React 19](https://react.dev/) — User interface library
  - [@tanstack/react-virtual](https://tanstack.com/virtual/latest) — Headless virtualization
  - [Lucide React](https://lucide.dev/) — Icon set
  - [Express.js](https://expressjs.com/) — REST backend
  - [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) — PostgreSQL client
- **Hosting & Infrastructure**:
  - [Netlify](https://www.netlify.com/) — Frontend edge CDN & deployment
  - [Render](https://render.com/) — Backend web service
  - [Supabase](https://supabase.com/) — Cloud PostgreSQL database
- **Web Standards & APIs**:
  - [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — In-flight request cancellation
  - [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — URL query parsing
  - [W3C WCAG 2.1 AA Standards](https://www.w3.org/WAI/WCAG21/quickref/) — Web accessibility guidelines

---

## 6. AI Usage Disclosure

- **Tools Used**: Google DeepMind Antigravity / Gemini 3.8 / Claude 3.5 Sonnet.
- **How AI Was Directed**:
  - Scaffolded PostgreSQL migrations for the 10,000-record dataset on Supabase.
  - Implemented chaos middleware (200ms–3s latency spikes and 10% failure injection) for realistic resilience testing.
  - Built defensive frontend hooks combining `AbortController` cancellation with monotonic request IDs.
  - Drafted Jest / React Testing Library specs for network cancellation and URL sync.
- **Review & Verification**:
  - Every AI-generated file was reviewed for code quality, tested locally, and verified against edge cases.
  - Resolved Netlify monorepo deployment settings and `CI=true` build configurations.

---

## 7. How to Run Locally

### Prerequisites
- Node.js v18+
- npm

### Step 1: Clone Repository
```bash
git clone https://github.com/Shivank2508/assignment.git
cd assignment
```

### Step 2: Start Backend
```bash
cd assignment-backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### Step 3: Start Frontend
```bash
cd ../assignment-frontend
npm install
npm start
```
Frontend opens automatically at `http://localhost:3000`.
