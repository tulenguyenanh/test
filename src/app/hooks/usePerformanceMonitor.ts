"use client";

import { useCallback, useEffect } from "react";

interface PerformanceMeasure {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export const usePerformanceMonitor = () => {
  const measures: Map<string, PerformanceMeasure> = new Map();

  // Initialize Web Vitals tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Track Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log performance metrics
          console.log(`Performance: ${entry.name}`, {
            value: entry.startTime,
            rating: getRating(entry.name, entry.startTime),
            timestamp: Date.now(),
          });

          // Dispatch custom event for external monitoring
          window.dispatchEvent(
            new CustomEvent("performance-metric", {
              detail: {
                name: entry.name,
                value: entry.startTime,
                timestamp: Date.now(),
              },
            })
          );
        }
      });

      // Observe paint and navigation timing
      try {
        observer.observe({ entryTypes: ["paint", "navigation", "measure"] });
      } catch (e) {
        console.warn("Performance Observer not supported:", e);
      }

      return () => observer.disconnect();
    }
  }, []);

  const startMeasure = useCallback((name: string): string => {
    const id = `${name}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const measure: PerformanceMeasure = {
      id,
      name,
      startTime: performance.now(),
    };

    measures.set(id, measure);

    // Use Performance API if available
    if (typeof window !== "undefined" && window.performance?.mark) {
      try {
        performance.mark(`${id}-start`);
      } catch (e) {
        console.warn("Performance mark failed:", e);
      }
    }

    return id;
  }, []);

  const endMeasure = useCallback((id: string): number | null => {
    const measure = measures.get(id);
    if (!measure) return null;

    const endTime = performance.now();
    const duration = endTime - measure.startTime;

    measure.endTime = endTime;
    measure.duration = duration;

    // Use Performance API if available
    if (
      typeof window !== "undefined" &&
      window.performance?.mark &&
      window.performance?.measure
    ) {
      try {
        performance.mark(`${id}-end`);
        performance.measure(measure.name, `${id}-start`, `${id}-end`);
      } catch (e) {
        console.warn("Performance measure failed:", e);
      }
    }

    // Log performance data
    console.log(`Performance Measure: ${measure.name}`, {
      duration,
      startTime: measure.startTime,
      endTime,
      timestamp: Date.now(),
    });

    // Dispatch custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("custom-performance-measure", {
          detail: {
            name: measure.name,
            duration,
            timestamp: Date.now(),
          },
        })
      );
    }

    measures.delete(id);
    return duration;
  }, []);

  return { startMeasure, endMeasure };
};

// Helper function to rate performance metrics
function getRating(
  metricName: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, { good: number; poor: number }> = {
    "first-contentful-paint": { good: 1800, poor: 3000 },
    "largest-contentful-paint": { good: 2500, poor: 4000 },
    "first-input-delay": { good: 100, poor: 300 },
    "cumulative-layout-shift": { good: 0.1, poor: 0.25 },
    "interaction-to-next-paint": { good: 200, poor: 500 },
  };

  const threshold = thresholds[metricName];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}
