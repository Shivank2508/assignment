import { useState, useEffect, useRef, useCallback } from "react";
import { fetchOrders } from "../services/mockApi";

/**
 * useDataExplorer:
 * Handles data fetching, prevents race conditions, cancels superseded requests,
 * and ensures honest loading/error/empty states.
 */
export function useDataExplorer(queryParams) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 50, totalPages: 1, latencyMs: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Generation counter to discard out-of-order responses (prevents race conditions)
  const requestIdRef = useRef(0);

  // 2. AbortController to cancel previous in-flight requests
  const abortControllerRef = useRef(null);

  const executeFetch = useCallback(async (params) => {
    // Increment request ID so previous pending requests become stale
    const currentReqId = ++requestIdRef.current;

    // Abort previous in-flight request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchOrders(params, { signal: controller.signal });

      // If a newer request was triggered while this one was in-flight, discard it
      if (currentReqId !== requestIdRef.current) {
        return;
      }

      setData(response.data);
      setMeta({
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        latencyMs: response.latencyMs
      });
      setIsLoading(false);
    } catch (err) {
      // Ignore AbortError (triggered when user changes search/filter quickly)
      if (err.name === "AbortError") {
        return;
      }

      // Ignore errors from superseded requests
      if (currentReqId !== requestIdRef.current) {
        return;
      }

      // Honest Error State: Clear old data so stale data never looks current
      setData([]);
      setError(err.message || "Failed to load orders");
      setIsLoading(false);
    }
  }, []);

  // Fetch data whenever queryParams change
  useEffect(() => {
    executeFetch(queryParams);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryParams, executeFetch]);

  // Retry function for honest error recovery
  const retry = useCallback(() => {
    executeFetch(queryParams);
  }, [queryParams, executeFetch]);

  return {
    data,
    meta,
    isLoading,
    isError: Boolean(error),
    error,
    retry
  };
}
