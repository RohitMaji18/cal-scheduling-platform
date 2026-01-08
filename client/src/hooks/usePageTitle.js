import { useEffect } from "react";

/**
 * Custom Hook: usePageTitle
 * -------------------------
 * Automatically updates the browser tab title when a component mounts
 * or when the title argument changes.
 * * @param {string} title - The text to display in the browser tab.
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    // If a title is provided, format it as "Page Name | Cal Scheduling"
    // Otherwise, fallback to the default app name.
    if (title) {
      document.title = `${title} | Cal Scheduling`;
    } else {
      document.title = "Cal Scheduling";
    }
  }, [title]); // Re-run this logic only if the 'title' changes
};
