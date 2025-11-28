# Setting Up API Usage Limits & Quotas

This guide shows you how to protect your Gemini API key from abuse and unexpected charges by setting up usage limits.

## Quick Summary

**Recommended Setup:**
1. ✅ API Key Restrictions (HTTP referrers) - **Done in VERCEL_SETUP.md**
2. ✅ Set budget alerts in Google Cloud Console
3. ✅ Monitor usage regularly
4. ⚠️ Optional: Add application-level rate limiting

---

## Option 1: Google Cloud Console (Recommended)

### Step 1: Set Up Budget Alerts

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **Billing** → **Budgets & alerts**
4. Click **"Create Budget"**

**Configure Budget:**
- **Name**: "Gemini API Monthly Budget"
- **Budget amount**: $10 (or your preferred limit)
- **Time range**: Monthly
- **Alert thresholds**: 
  - 50% ($5)
  - 90% ($9)
  - 100% ($10)
- **Email recipients**: Your email

5. Click **"Finish"**

You'll receive email alerts when you hit these thresholds.

### Step 2: View Current Quotas

1. Go to **APIs & Services** → **Enabled APIs**
2. Click **"Generative Language API"**
3. Click **"Quotas & System Limits"** tab

**Default Free Tier Limits:**
- **Requests per minute (RPM)**: 60
- **Requests per day (RPD)**: 1,500
- **Tokens per minute (TPM)**: 32,000

These limits are automatically enforced.

### Step 3: Request Quota Increase (If Needed)

If you need higher limits:
1. Click on the quota you want to increase
2. Click **"Edit Quotas"** (top right)
3. Fill out the form with justification
4. Submit for Google's review

---

## Option 2: Google AI Studio (Simple Monitoring)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click your profile → **"API usage"**
3. View your current usage dashboard

**What you'll see:**
- Requests today
- Tokens used
- Rate limit status

This is read-only but useful for monitoring.

---

## Option 3: Application-Level Rate Limiting

I've created a rate limiter for you at `services/rateLimiter.ts`.

### How to Use It

**1. Import in App.tsx:**

```typescript
import { rateLimiter } from './services/rateLimiter';
```

**2. Add check before API calls:**

```typescript
const handleInputSubmit = async (type, value, preview) => {
  // Get user ID (or use IP address if not logged in)
  const userId = currentUser?.id || 'guest';
  
  // Check rate limit
  const { allowed, remaining, resetIn } = rateLimiter.checkLimit(userId);
  
  if (!allowed) {
    const minutes = Math.ceil(resetIn / 60000);
    setError(`Rate limit exceeded. Please wait ${minutes} minute(s) before trying again.`);
    setAppState(AppState.ERROR);
    return;
  }
  
  // Continue with normal flow...
  setAppState(AppState.ANALYZING);
  // ... rest of your code
};
```

**Configuration:**
- Default: 10 requests per minute per user
- Adjust in `rateLimiter.ts`: `new RateLimiter(maxRequests, windowMinutes)`

---

## Monitoring & Best Practices

### Daily Monitoring

Check your usage regularly:
1. [Google AI Studio Usage](https://aistudio.google.com/)
2. [Google Cloud Console Billing](https://console.cloud.google.com/billing)

### Cost Estimation

**Gemini 2.5 Flash Pricing (as of 2024):**
- Free tier: 1,500 requests/day
- Paid: ~$0.00025 per request (varies)

**Example:**
- 100 users/day × 5 requests each = 500 requests/day
- Cost: ~$0.125/day = ~$3.75/month

### Warning Signs

🚨 **Watch for:**
- Sudden spike in requests
- Unusual traffic patterns
- Requests from unexpected domains

**Action:**
1. Check Vercel analytics
2. Review API key restrictions
3. Regenerate API key if compromised

---

## Security Checklist

- ✅ HTTP referrer restrictions set
- ✅ API restricted to Generative Language API only
- ✅ Budget alerts configured
- ✅ Regular usage monitoring
- ⚠️ Application rate limiting (optional)
- ⚠️ Logging/analytics for abuse detection

---

## Troubleshooting

### "Quota exceeded" Error

**Cause**: Hit daily or per-minute limit

**Solutions:**
1. Wait for quota to reset (daily quotas reset at midnight PT)
2. Request quota increase in Cloud Console
3. Implement caching to reduce API calls

### Unexpected High Usage

**Investigate:**
1. Check Vercel analytics for traffic spikes
2. Review API logs in Google Cloud Console
3. Check for bot traffic

**Fix:**
1. Add CAPTCHA for recipe generation
2. Implement stricter rate limiting
3. Add authentication requirements

---

## Next Steps

1. ✅ Set up budget alerts (5 minutes)
2. ✅ Monitor usage for first week
3. ⚠️ Add rate limiting if needed
4. ⚠️ Consider caching popular recipes

**Current Status:**
- API key: ✅ Restricted to your domain
- Budget alerts: ⚠️ Set up now
- Rate limiting: ⚠️ Optional (code provided)
