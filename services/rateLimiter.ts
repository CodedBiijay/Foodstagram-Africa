// Simple rate limiter to prevent API abuse
// Limits: 10 requests per minute per user

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private limits: Map<string, RateLimitEntry> = new Map();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number = 10, windowMinutes: number = 1) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMinutes * 60 * 1000;
    }

    checkLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
        const now = Date.now();
        const entry = this.limits.get(userId);

        // No previous requests or window expired
        if (!entry || now > entry.resetTime) {
            this.limits.set(userId, {
                count: 1,
                resetTime: now + this.windowMs
            });
            return {
                allowed: true,
                remaining: this.maxRequests - 1,
                resetIn: this.windowMs
            };
        }

        // Within rate limit window
        if (entry.count < this.maxRequests) {
            entry.count++;
            return {
                allowed: true,
                remaining: this.maxRequests - entry.count,
                resetIn: entry.resetTime - now
            };
        }

        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetTime - now
        };
    }

    // Clean up old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [userId, entry] of this.limits.entries()) {
            if (now > entry.resetTime) {
                this.limits.delete(userId);
            }
        }
    }
}

// Export singleton instance
export const rateLimiter = new RateLimiter(10, 1); // 10 requests per minute

// Cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
