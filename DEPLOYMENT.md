# Raply - Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, make sure you have:

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code to GitHub
3. **Supabase Project** - Production database ready
4. **All API Keys** - Meta Ads, Google Ads, Claude API, Resend

---

## 🚀 Quick Deploy (Recommended)

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `Raply` repository from GitHub
4. Click **"Import"**

### Step 2: Configure Project Settings

Vercel will auto-detect Next.js. Keep these default settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add ALL variables from `.env.example`:

#### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### App Configuration (Required)
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### Meta Ads (Optional - for Task 4)
```
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
NEXT_PUBLIC_META_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback/meta
```

#### Google Ads (Optional - for Task 5)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback/google
```

#### Claude API (Optional - for Task 8)
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

#### Resend Email (Optional - for Task 11)
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important Notes:**
- Set all environment variables for **Production** environment
- Replace `your-domain.vercel.app` with your actual Vercel domain (you'll get this after first deploy)
- You can add more variables later in: **Project Settings > Environment Variables**

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will assign you a domain: `raply-xyz.vercel.app`

### Step 5: Update Redirect URLs

After getting your Vercel domain, update these URLs:

1. **In Vercel Dashboard** (Settings > Environment Variables):
   - `NEXT_PUBLIC_APP_URL=https://raply-xyz.vercel.app`
   - `NEXT_PUBLIC_META_REDIRECT_URI=https://raply-xyz.vercel.app/api/auth/callback/meta`
   - `NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://raply-xyz.vercel.app/api/auth/callback/google`

2. **In Meta Developer Dashboard**:
   - Add redirect URL: `https://raply-xyz.vercel.app/api/auth/callback/meta`

3. **In Google Cloud Console**:
   - Add redirect URL: `https://raply-xyz.vercel.app/api/auth/callback/google`

4. **In Supabase Dashboard** (Authentication > URL Configuration):
   - Add Site URL: `https://raply-xyz.vercel.app`
   - Add Redirect URL: `https://raply-xyz.vercel.app/auth/callback`

5. **Redeploy** - Click "Redeploy" in Vercel to apply new environment variables

---

## 📋 Post-Deployment Checklist

### ✅ Essential Checks

- [ ] Landing page loads correctly (both `/` and `/en`)
- [ ] User can sign up and sign in
- [ ] Dashboard loads after authentication
- [ ] Language switcher works (Polski ↔ English)
- [ ] Sidebar navigation works
- [ ] Admin panel accessible for your email
- [ ] Database queries work (check browser console for errors)
- [ ] No TypeScript errors in build logs

### ✅ Database Checks

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check if users table exists
SELECT * FROM users LIMIT 1;

-- Check if RLS policies are active
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Verify admin role is set
SELECT email, role FROM users WHERE role = 'admin';
```

### ✅ OAuth Integration Checks (when implemented)

- [ ] Meta Ads OAuth redirect works
- [ ] Google Ads OAuth redirect works
- [ ] Tokens are stored securely in database

---

## 🔧 Custom Domain Setup (Optional)

### Add Your Own Domain

1. Go to Vercel Dashboard > **Project Settings** > **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `raply.pl`)
4. Vercel will provide DNS records to add:

**For apex domain (raply.pl):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain (www.raply.pl):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

5. Add these records in your domain registrar (e.g., OVH, Cloudflare)
6. Wait 24-48 hours for DNS propagation
7. Vercel will auto-generate SSL certificate

### Update Environment Variables for Custom Domain

After domain is verified:

1. Update `NEXT_PUBLIC_APP_URL=https://raply.pl`
2. Update all redirect URIs to use `raply.pl`
3. Update OAuth redirect URLs in Meta/Google dashboards
4. Update Supabase Site URL
5. Redeploy

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error: "Type check failed"**
```bash
# Run locally first:
npm run type-check

# Fix TypeScript errors, then push and redeploy
```

**Error: "Module not found"**
```bash
# Clear node_modules and reinstall:
rm -rf node_modules package-lock.json
npm install

# Commit changes and redeploy
```

### Database Connection Issues

**Error: "Could not connect to Supabase"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is not paused (free tier pauses after 1 week inactivity)
- Verify RLS policies allow public access to `users` table via `auth.uid()`

### Authentication Not Working

**Error: "Redirect URL mismatch"**
- Add Vercel domain to Supabase **Redirect URLs**:
  - `https://raply-xyz.vercel.app/auth/callback`
  - `https://raply-xyz.vercel.app/**`
- Add Vercel domain to Supabase **Site URL**

**Error: "Session expired immediately"**
- Check middleware.ts is not blocking auth routes
- Verify cookies are being set (check browser DevTools > Application > Cookies)

### i18n Routing Issues

**Error: "404 on /dashboard"**
- i18n middleware adds locale prefix automatically
- Correct URLs: `/pl/dashboard` or `/en/dashboard`
- Polish (default) can be accessed at `/dashboard` (without `/pl`)

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ **Never commit `.env.local`** - already in `.gitignore`
- ✅ **Rotate secrets regularly** - especially `SUPABASE_SERVICE_ROLE_KEY`
- ✅ **Use environment-specific values** - different keys for dev/staging/prod
- ✅ **Limit service role key usage** - only use in server-side API routes

### Supabase RLS Policies

All tables have Row Level Security enabled. Verify:

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- rowsecurity should be TRUE for all tables
```

### Admin Access

Only `chudziszewski221[at]gmail[dot]com` has admin role by default. To add more admins:

```sql
-- Add new admin (run in Supabase SQL Editor)
UPDATE users
SET role = 'admin'
WHERE email = 'another-email@example.com';
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Included Free)

Enable in Vercel Dashboard > **Analytics**:
- Real-time visitor tracking
- Page views and unique visitors
- Performance metrics (Web Vitals)

### Supabase Logs

Monitor in Supabase Dashboard > **Logs**:
- **Database logs** - SQL queries and errors
- **Auth logs** - Sign-ups, sign-ins, failed attempts
- **API logs** - API route calls and performance

### Error Tracking

Recommended tools (optional):
- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Session replay and error tracking
- **Vercel Monitoring** - Built-in error and performance tracking

---

## 🚨 Emergency Rollback

If deployment breaks production:

1. Go to Vercel Dashboard > **Deployments**
2. Find last working deployment
3. Click **"⋯"** > **"Promote to Production"**
4. Instant rollback (< 30 seconds)

---

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🆘 Need Help?

**Check Vercel Logs:**
- Vercel Dashboard > Deployments > Click deployment > **Runtime Logs**

**Check Supabase Logs:**
- Supabase Dashboard > Logs Explorer

**Common Issues:**
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)
- [Supabase Discord](https://discord.supabase.com/)

---

**Deployment prepared by:** Claude Code
**Last updated:** 2025-10-13
