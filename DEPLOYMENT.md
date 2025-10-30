# Macro Journal - Deployment Guide

This guide will walk you through deploying the Macro Journal PWA to production.

## Prerequisites

1. **Supabase Account**: Sign up at [https://supabase.com](https://supabase.com)
2. **OpenAI Account**: Get API key from [https://platform.openai.com](https://platform.openai.com)
3. **Vercel Account**: Sign up at [https://vercel.com](https://vercel.com)
4. **GitHub Account**: For repository hosting and CI/CD

---

## Step 1: Set Up Supabase Database

### 1.1 Create a New Project

1. Log in to your Supabase account
2. Click "New Project"
3. Choose an organization and enter project details:
   - Project Name: `macro-journal-prod`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be created (2-3 minutes)

### 1.2 Run Database Migrations

1. Navigate to the SQL Editor in your Supabase dashboard
2. Run the SQL scripts in order:
   - First: Copy and paste contents of `supabase/schema.sql`
   - Click "Run" to execute
   - Then: Copy and paste contents of `supabase/rls-policies.sql`
   - Click "Run" to execute

### 1.3 Get Your Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key (under Project API keys)
3. Save these for later use

### 1.4 Configure Email Authentication

1. Go to Authentication > Providers
2. Enable "Email" provider
3. (Optional) Customize email templates:
   - Go to Authentication > Email Templates
   - Customize the confirmation email, password recovery, etc.

---

## Step 2: Get OpenAI API Key

1. Log in to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys section
3. Click "Create new secret key"
4. Name it (e.g., "Macro Journal Production")
5. Copy the API key immediately (you won't be able to see it again)
6. Save it securely

---

## Step 3: Push Code to GitHub

### 3.1 Initialize Git Repository

```bash
cd /home/ravi/Development/MacroLog
git init
git add .
git commit -m "Initial commit: Macro Journal PWA"
```

### 3.2 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `macro-journal` or similar
3. Don't initialize with README (we already have code)
4. Copy the repository URL

### 3.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/macro-journal.git
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Log in to [Vercel](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 4.2 Configure Environment Variables

Before deploying, add the following environment variables:

| Name | Value | Where to Get |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard > Settings > API |
| `OPENAI_API_KEY` | Your OpenAI API key | OpenAI Platform > API Keys |

**Steps:**
1. In Vercel project settings, go to "Environment Variables"
2. Add each variable with its value
3. Select all environments (Production, Preview, Development)

### 4.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, you'll get a production URL (e.g., `macro-journal.vercel.app`)

### 4.4 Add Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

---

## Step 5: Test Your Deployment

### 5.1 Basic Functionality Tests

1. Visit your production URL
2. Test user signup:
   - Click "Sign Up"
   - Enter email and password
   - Check if profile is created
3. Test login with your new account
4. Test meal logging:
   - Add a meal entry
   - Verify AI parsing works
   - Check if entry appears in dashboard
5. Test history page
6. Test profile settings update

### 5.2 PWA Installation Test

1. On Chrome (mobile or desktop):
   - Visit your site
   - Click the "Install" prompt or menu option
   - Install the app
2. Verify the app works as a standalone application

### 5.3 Offline Test

1. Install the PWA
2. Disconnect from internet
3. Try navigating between pages
4. Verify cached pages load correctly

---

## Step 6: Post-Deployment Configuration

### 6.1 Update Supabase Site URL (Important!)

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Set "Site URL" to your production URL
3. Add your production URL to "Redirect URLs"

### 6.2 Email Configuration

If using custom email domain:
1. Go to Supabase Dashboard > Project Settings > Email
2. Configure custom SMTP settings

---

## Monitoring & Maintenance

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor page load times and visitor stats

### Supabase Monitoring

1. Check Database usage in Supabase Dashboard
2. Monitor API requests and authentication events

### Error Tracking (Optional)

Consider integrating:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

---

## Updating the Application

### Making Changes

1. Make changes to your code locally
2. Test thoroughly in development:
   ```bash
   npm run dev
   ```
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel will automatically deploy the updates

### Rollback

If you need to rollback:
1. Go to Vercel Dashboard > Deployments
2. Find the previous working deployment
3. Click "Promote to Production"

---

## Troubleshooting

### Build Fails on Vercel

- Check the build logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Verify TypeScript has no errors locally: `npm run build`

### Authentication Not Working

- Verify Supabase URL and keys are correct
- Check if Site URL is set correctly in Supabase
- Ensure cookies are not blocked

### OpenAI API Errors

- Check API key is valid
- Verify you have credits/billing enabled on OpenAI
- Check API rate limits

### Database Connection Issues

- Verify Supabase credentials
- Check if RLS policies are enabled
- Test database connection in Supabase SQL Editor

---

## Security Checklist

- [ ] Environment variables are set correctly (never commit `.env.local`)
- [ ] Supabase RLS policies are enabled on all tables
- [ ] OpenAI API key is kept secret (server-side only)
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Authentication is properly configured
- [ ] CORS settings are restrictive (handled by Supabase)

---

## Cost Estimates

### Free Tier Limits

**Supabase Free Tier:**
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

**Vercel Free Tier:**
- 100 GB bandwidth
- 6,000 build minutes
- Unlimited deployments

**OpenAI:**
- Pay-as-you-go (GPT-4o-mini is very affordable)
- Estimated cost: ~$0.0001-0.0003 per meal log

---

## Support & Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **OpenAI API Documentation**: https://platform.openai.com/docs
- **Vercel Documentation**: https://vercel.com/docs

---

## Success!

Your Macro Journal PWA should now be live and accessible at your production URL. Users can:
- Sign up and log in securely
- Log meals with AI-powered parsing
- Track daily macros
- View history and set goals
- Install the app on their devices

Enjoy your new macro tracking app!
