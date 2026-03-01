# Resonance

AI-powered text-to-speech and voice cloning platform built with Next.js, React, and Prisma.

## Tech Stack

- **Framework**: Next.js 16 + React 19
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk
- **API**: tRPC for type-safe API routes
- **State Management**: TanStack Query
- **Error Tracking**: Sentry
- **Payments**: Polar.sh
- **Storage**: Cloudflare R2 for audio files
- **TTS Inference**: Chatterbox TTS running on Modal.com

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Railway

This project is configured for deployment on [Railway](https://railway.com).

### Prerequisites

- A Railway account
- This repository pushed to GitHub

### Step 1: Create a Railway Project

1. Log in to [Railway Dashboard](https://railway.com/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose this repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically inject the `DATABASE_URL` environment variable into your app service

### Step 3: Configure Environment Variables

Add the following environment variables in your Railway service settings:

```env
# Required
DATABASE_URL=${{ Postgres.DATABASE_URL }}  # Auto-injected when you add PostgreSQL
NEXT_PUBLIC_APP_URL=https://your-app-url.railway.app

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Cloudflare R2 (audio storage)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=resonance-app

# Polar.sh (billing)
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_SERVER=sandbox  # or "production"
POLAR_PRODUCT_ID=your-product-id

# Chatterbox TTS API (Modal.com)
CHATTERBOX_API_URL=https://your-modal-app-url.modal.run
CHATTERBOX_API_KEY=your-api-key

# Sentry (optional)
SENTRY_AUTH_TOKEN=your-sentry-token  # Only needed for source maps upload
```

### Step 4: Deploy

1. Railway will automatically detect the `railway.json` configuration
2. The build process will:
   - Run `prisma generate` to generate the Prisma client
   - Run `next build` to build the Next.js app
   - Run `prisma migrate deploy` before starting (handles database migrations)
3. Once the build completes, your app will be deployed

### Step 5: Set up Custom Domain (Optional)

1. In Railway, go to your service settings
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain and follow the DNS instructions

## Configuration Files

- **`railway.json`** - Railway deployment configuration (build commands, health checks, etc.)
- **`next.config.ts`** - Next.js configuration with standalone output for Railway
- **`prisma/schema.prisma`** - Database schema

## Local Development

1. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up the database:
   ```bash
   bun prisma migrate dev
   bun prisma generate
   ```

4. Run the development server:
   ```bash
   bun dev
   ```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Railway Documentation](https://docs.railway.com)
- [Prisma Documentation](https://www.prisma.io/docs)
