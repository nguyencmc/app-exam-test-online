// Rate Limiting Utility for Supabase Edge Functions
// Prevents abuse by limiting requests per user/IP

interface RateLimitConfig {
    maxRequests: number;  // Max requests allowed
    windowMs: number;     // Time window in milliseconds
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

// In-memory store (for single instance, consider Redis for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if request is within rate limit
 * @param key - Unique identifier (userId, IP, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): RateLimitResult {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    // If no record or window expired, start fresh
    if (!record || now >= record.resetAt) {
        const resetAt = now + config.windowMs;
        rateLimitStore.set(key, { count: 1, resetAt });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetAt,
        };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    // Check if over limit
    if (record.count > config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: record.resetAt,
        };
    }

    return {
        allowed: true,
        remaining: config.maxRequests - record.count,
        resetAt: record.resetAt,
    };
}

/**
 * Rate limit response helper
 * Returns a 429 response if rate limited
 */
export function rateLimitResponse(result: RateLimitResult): Response | null {
    if (!result.allowed) {
        return new Response(
            JSON.stringify({
                error: "Too many requests",
                retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(result.resetAt),
                },
            }
        );
    }
    return null;
}

/**
 * Apply rate limiting to a request
 * @param req - Request object
 * @param userId - Optional user ID (falls back to IP)
 * @param config - Rate limit config
 */
export async function applyRateLimit(
    req: Request,
    userId?: string,
    config?: RateLimitConfig
): Promise<Response | null> {
    // Use userId if available, otherwise use IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const key = userId || `ip:${ip}`;

    const result = checkRateLimit(key, config);
    return rateLimitResponse(result);
}

// Default configs for different use cases
export const RATE_LIMITS = {
    // AI endpoints - expensive operations
    ai: { maxRequests: 20, windowMs: 60000 },
    // General API
    api: { maxRequests: 100, windowMs: 60000 },
    // Auth endpoints - stricter
    auth: { maxRequests: 10, windowMs: 60000 },
} as const;
