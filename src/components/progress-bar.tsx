"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarImpl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Triggered when pathname or searchParams change (meaning page navigation complete)
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400); // 400ms for full progress bar slide and fade out transition
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Handle document click interception for standard <a> tags
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;

      // Find the closest anchor tag
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== "A") {
        if (
          target.tagName === "BUTTON" ||
          target.getAttribute("role") === "button" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT"
        ) {
          return;
        }
        target = target.parentElement;
      }

      if (!target) return;

      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute("href");

      // Check if it's a valid link to a different page on the same origin
      if (!href) return;

      // Ignore hash links, external links, mailto, tel, target="_blank", etc.
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      // Check if user clicked with command/ctrl/shift keys (which open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
        return;
      }

      // Resolve relative URL to absolute
      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Check if same origin and different path/search
        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname ||
            targetUrl.search !== currentUrl.search)
        ) {
          // Reset progress and show the bar
          setProgress(5);
          setVisible(true);
        }
      } catch (err) {
        // Ignore invalid URLs
      }
    };

    // Use bubbling phase instead of capturing phase so that buttons with e.stopPropagation() (like MUA button) can prevent it.
    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, []);

  // Listen to custom window events for programmatic navigation support
  useEffect(() => {
    const startProgress = () => {
      setProgress(5);
      setVisible(true);
    };

    const stopProgress = () => {
      setProgress(100);
    };

    window.addEventListener("route-change-start", startProgress);
    window.addEventListener("route-change-complete", stopProgress);

    return () => {
      window.removeEventListener("route-change-start", startProgress);
      window.removeEventListener("route-change-complete", stopProgress);
    };
  }, []);

  // Animate the progress bar when visible (fake loading steps to simulate progress)
  useEffect(() => {
    if (!visible || progress >= 90) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        // Increment slower as it gets higher to simulate realistic loading
        const increment = Math.random() * 4 + 1;
        return Math.min(prev + increment, 90);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [visible, progress]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${progress}%`,
        background: "linear-gradient(to right, var(--color-secondary-1, #f2bc57), var(--color-primary-1, #d3242c))",
        boxShadow: "0 0 10px var(--color-primary-2, #dc5056), 0 0 5px var(--color-secondary-1, #f2bc57)",
        zIndex: 99999,
        transition: progress === 100 ? "width 0.3s ease-out, opacity 0.4s ease-in-out" : "width 0.2s cubic-bezier(0.1, 0.8, 0.1, 1)",
        opacity: progress === 100 ? 0 : 1,
        pointerEvents: "none",
      }}
    />
  );
}

export default function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarImpl />
    </Suspense>
  );
}
