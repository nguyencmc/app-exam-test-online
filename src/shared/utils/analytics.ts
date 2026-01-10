// Analytics and Performance Monitoring Utilities
// Wrapper for tracking events and performance metrics

type EventName =
    | 'page_view'
    | 'exam_start'
    | 'exam_complete'
    | 'flashcard_review'
    | 'course_enroll'
    | 'ai_tutor_query'
    | 'error'
    | 'performance';

interface EventProperties {
    [key: string]: string | number | boolean | undefined;
}

interface PerformanceMetric {
    name: string;
    value: number;
    unit: 'ms' | 's' | 'count' | 'bytes';
}

/**
 * Track an analytics event
 */
export function trackEvent(name: EventName, properties?: EventProperties): void {
    // In development, log to console
    if (import.meta.env.DEV) {
        console.log(`[Analytics] ${name}:`, properties);
        return;
    }

    // In production, send to Sentry as breadcrumb
    if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.addBreadcrumb({
            category: 'analytics',
            message: name,
            level: 'info',
            data: properties,
        });
    }
}

/**
 * Track performance metric
 */
export function trackPerformance(metric: PerformanceMetric): void {
    if (import.meta.env.DEV) {
        console.log(`[Performance] ${metric.name}: ${metric.value}${metric.unit}`);
        return;
    }

    // Send to Sentry performance monitoring
    if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.setMeasurement(metric.name, metric.value, metric.unit);
    }
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
    name: string,
    fn: () => Promise<T>
): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        const duration = performance.now() - start;
        trackPerformance({ name, value: duration, unit: 'ms' });
        return result;
    } catch (error) {
        const duration = performance.now() - start;
        trackPerformance({ name: `${name}_error`, value: duration, unit: 'ms' });
        throw error;
    }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, path: string): void {
    trackEvent('page_view', { page: pageName, path });
}

/**
 * Track error with context
 */
export function trackError(error: Error, context?: EventProperties): void {
    trackEvent('error', {
        message: error.message,
        name: error.name,
        ...context,
    });

    // Also send to Sentry
    if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
            extra: context,
        });
    }
}

// Export singleton instance for easy usage
export const analytics = {
    track: trackEvent,
    trackPerformance,
    measureAsync,
    trackPageView,
    trackError,
};
