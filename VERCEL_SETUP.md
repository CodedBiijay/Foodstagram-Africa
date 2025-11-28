# Vercel Deployment Setup Guide

This guide will help you deploy Foodstagram Africa to Vercel with proper API key configuration.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Google Gemini API key](https://aistudio.google.com/apikey)
3. GitHub repository connected to Vercel

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select a Google Cloud project (or create a new one)
5. Copy the generated API key

> [!IMPORTANT]
> Keep your API key secure! Never commit it to git or share it publicly.

## Step 2: Configure API Key Restrictions (Recommended)

To prevent unauthorized use of your API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key and click **Edit**
3. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add your Vercel domain: `https://foodstagram-africa.vercel.app/*`
   - Add `https://*.vercel.app/*` for preview deployments
4. Under **API restrictions**:
   - Select **Restrict key**
   - Enable **Generative Language API**
5. Click **Save**

## Step 3: Add Environment Variable to Vercel

### Via Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key (paste it here)
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

### Via Vercel CLI

```bash
vercel env add VITE_GEMINI_API_KEY
# Paste your API key when prompted
# Select all environments
```

## Step 4: Redeploy

After adding the environment variable, trigger a new deployment:

### Option A: Push to GitHub
```bash
git push
```
Vercel will automatically redeploy.

### Option B: Manual Redeploy
1. Go to your project in Vercel Dashboard
2. Click **Deployments**
3. Click the **⋯** menu on the latest deployment
4. Select **Redeploy**

## Step 5: Verify

1. Visit your deployed site: `https://foodstagram-africa.vercel.app/`
2. Try uploading a food image or using the "Feeling Hungry" button
3. If you see the recipe generated successfully, it's working! 🎉

## Troubleshooting

### "Service Interruption - An API Key must be set"

**Cause**: The environment variable is not set or not accessible.

**Solution**:
1. Verify the variable name is exactly `VITE_GEMINI_API_KEY` (case-sensitive)
2. Check that it's set for the correct environment (Production)
3. Redeploy after adding the variable
4. Check Vercel deployment logs for errors

### "Authentication failed"

**Cause**: Invalid or restricted API key.

**Solution**:
1. Verify your API key is correct
2. Check API key restrictions in Google Cloud Console
3. Ensure your domain is allowed in HTTP referrers

### "Quota exceeded"

**Cause**: You've hit the API usage limit.

**Solution**:
1. Check your usage in [Google AI Studio](https://aistudio.google.com/)
2. Wait for the quota to reset (usually daily)
3. Consider upgrading to a paid plan if needed

## Local Development

To run the app locally with your API key:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

> [!NOTE]
> `.env.local` is gitignored and will never be committed.

## Security Best Practices

1. **Never commit API keys** - Always use environment variables
2. **Restrict your API key** - Use HTTP referrer restrictions
3. **Monitor usage** - Check Google Cloud Console regularly
4. **Rotate keys** - If a key is compromised, generate a new one immediately
5. **Set quotas** - Limit daily API usage to prevent unexpected charges

## Cost Considerations

- Gemini API has a free tier with generous limits
- Monitor your usage in Google AI Studio
- Set up billing alerts in Google Cloud Console
- Consider implementing rate limiting for production apps

## Next Steps

- ✅ Set up custom domain in Vercel
- ✅ Configure analytics
- ✅ Set up monitoring for API errors
- ✅ Implement caching to reduce API calls
