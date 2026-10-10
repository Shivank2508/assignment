import { useState, useEffect, useCallback } from "react";
import { parseUrlParams, stringifyUrlParams, DEFAULT_STATE } from "../utils/urlParams";

/**
 * useUrlState:
 * Keeps state in sync with the browser URL.
 * Supports Back/Forward browser buttons, refresh, and deep-linking.
 */
export function useUrlState() {
  const [state, setState] = useState(() => parseUrlParams(window.location.search));

  // Sync state when user clicks Back/Forward browser buttons
  useEffect(() => {
    const onPopState = () => {
      setState(parseUrlParams(window.location.search));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Updates state and changes the URL in the browser
  const updateState = useCallback((updates, replace = false) => {
    setState(prev => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };
      const queryString = stringifyUrlParams(next);
      const targetUrl = window.location.pathname + queryString;

      if (replace) {
        window.history.replaceState(null, "", targetUrl);
      } else {
        window.history.pushState(null, "", targetUrl);
      }

      return next;
    });
  }, []);

  // Quick reset for all search and filters
  const resetFilters = useCallback(() => {
    updateState(DEFAULT_STATE);
  }, [updateState]);

  return { state, updateState, resetFilters };
}
