# CORS Error Fix Instructions

## Problem
Your application is being blocked by CORS policy when users access it from `https://mnpayequityvoor.bolt.host` because Supabase doesn't recognize this domain.

## Solution 1: Configure Supabase CORS (Recommended - Takes 2 minutes)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project: `aubbcfqafggsfpprefsk`

2. **Navigate to API Settings**
   - Click **Settings** (gear icon in left sidebar)
   - Click **API**
   - Scroll down to find **CORS Configuration** or **Additional Allowed Origins**

3. **Add Your Domain**
   - Add: `https://mnpayequityvoor.bolt.host`
   - If you have additional domains (like a custom domain), add those too
   - You can add multiple domains, one per line
   - Click **Save**

4. **Wait 1-2 minutes**
   - Changes may take a moment to propagate
   - Refresh your application
   - The CORS error should be gone

## Solution 2: Use Edge Function Proxy (For Restricted Networks)

If your users are behind corporate firewalls that block Supabase entirely, I've deployed an Edge Function that acts as a proxy. This function runs on Supabase's servers, so it bypasses CORS entirely.

### Using the Edge Function

Replace direct API calls with the proxy function:

```typescript
import { proxyApiRequest } from './lib/apiProxy';

// Instead of direct fetch:
// const response = await fetch('https://api.example.com/data');

// Use the proxy:
const data = await proxyApiRequest('/data', 'param=value');
```

The edge function is already deployed and ready to use:
- Function name: `proxy-api-request`
- URL: `{VITE_SUPABASE_URL}/functions/v1/proxy-api-request`

## Solution 3: Environment-Specific Configuration

Make sure your production deployment has the correct environment variables:

```env
VITE_SUPABASE_URL=https://aubbcfqafggsfpprefsk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1YmJjZnFhZmdnc2ZwcHJlZnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjU3OTcsImV4cCI6MjA3ODA0MTc5N30.ZE56FO0QGXehOzKQ9lI6z9w_CevYMFQ94lmk6aarFFU
```

## Verification

After applying Solution 1, verify the fix:

1. Clear browser cache
2. Open DevTools (F12)
3. Go to Network tab
4. Reload your application
5. Check that requests to `aubbcfqafggsfpprefsk.supabase.co` succeed

## Still Having Issues?

If CORS errors persist after configuring Supabase:

1. **Check if it's a different domain**
   - The error might be from a different API call
   - Look at the URL in the error message
   - You may need to add multiple domains

2. **Corporate Firewall Issues**
   - Some organizations block all external API calls
   - In this case, use Solution 2 (Edge Function Proxy)
   - The edge function runs server-side, bypassing client-side restrictions

3. **Supabase Service Role**
   - For admin operations, you might need to use the service role key
   - NEVER expose service role key in client-side code
   - Use Edge Functions for sensitive operations

## Contact Support

If none of these solutions work:
- Check Supabase Status: https://status.supabase.com
- Supabase Support: https://supabase.com/support
- Verify your Supabase project is active and not paused
