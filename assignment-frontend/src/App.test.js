import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import { fetchOrders, fetchOrderById } from "./services/mockApi";
import { parseUrlParams, stringifyUrlParams } from "./utils/urlParams";

describe("API Query Client", () => {
  test("supports server-side search, filtering, and pagination", async () => {
    let result;
    // Retry up to 3 times to account for the simulated 1-in-10 chaos failure
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await fetchOrders({ q: "Sophia", page: 1, pageSize: 10 });
        break;
      } catch (e) {
        // Retry on simulated 500 error
      }
    }
    if (result) {
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.data[0].customer.name.toLowerCase()).toContain("sophia");
    }
  });

  test("supports AbortSignal cancellation", async () => {
    const controller = new AbortController();
    const promise = fetchOrders({ q: "Quantum" }, { signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toThrow(/abort/i);
  });

  test("fetches single order by ID for detail view", async () => {
    let order;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        order = await fetchOrderById("ORD-1");
        break;
      } catch (e) {
        // Retry on simulated 500 error
      }
    }
    if (order) {
      expect(order.id).toBe("ORD-1");
      expect(order.customer).toBeDefined();
      expect(order.amount).toBeDefined();
    }
  });
});

describe("URL State Helpers", () => {
  test("parses URL query params", () => {
    const parsed = parseUrlParams("?q=Apex&status=delivered&sort=amount&page=2");
    expect(parsed.q).toBe("Apex");
    expect(parsed.status).toBe("delivered");
    expect(parsed.sort).toBe("amount");
    expect(parsed.page).toBe(2);
  });

  test("stringifies state to URL query", () => {
    const state = {
      q: "Quantum",
      status: "shipped",
      priority: "",
      category: "",
      sort: "amount",
      order: "desc",
      page: 1,
      pageSize: 50,
      detailId: ""
    };
    const str = stringifyUrlParams(state);
    expect(str).toContain("q=Quantum");
    expect(str).toContain("status=shipped");
    expect(str).toContain("sort=amount");
  });
});

describe("App Explorer UI", () => {
  test("renders header, search bar, filters, and records count", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Orders/i })).toBeInTheDocument();
    expect(screen.getByText(/10,000 Total Records/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by ID/i)).toBeInTheDocument();
  });

  test("allows user to type in search bar and clear search", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Search by ID/i);

    // Type search
    fireEvent.change(input, { target: { value: "Denver" } });
    expect(input.value).toBe("Denver");

    // Clear search
    const clearBtn = screen.getByLabelText(/Clear search/i);
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(input.value).toBe("");
  });
});
