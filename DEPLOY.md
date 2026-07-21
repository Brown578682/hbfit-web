# Honor Bound FIT — Deployment Guide

This guide walks through deploying the Honor Bound FIT Next.js application to AWS App Runner with an RDS PostgreSQL database.

---

## Prerequisites

| Requirement | Details |
|---|---|
| AWS account | With IAM permissions for App Runner, RDS, S3, and Secrets Manager |
| GitHub repository | `honorboundfit/hbfit-web` (or your fork) |
| Stripe account | For membership billing — live + test API keys |
| Domain | `honorboundfit.com` managed in Route 53 or an external registrar |
| Node.js 18+ | For local development and migrations |

---

## Environment Variables

Set all of the following as **secrets** in GitHub Actions and as **environment variables** in the App Runner service configuration.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (see [aws/rds-setup.md](./aws/rds-setup.md)) |
| `NEXTAUTH_SECRET` | Random 32-byte hex string — generate with `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...` or `pk_test_...`) |
| `AWS_ACCESS_KEY_ID` | IAM access key for CI/CD deployments |
| `AWS_SECRET_ACCESS_KEY` | IAM secret access key |
| `AWS_S3_BUCKET` | S3 bucket name for member photo / file uploads |
| `NEXT_PUBLIC_APP_URL` | Full URL of the deployed app, e.g. `https://honorboundfit.com` |

> **Tip:** Never commit these values to git. Use AWS Secrets Manager for production and `.env.local` for local dev.

---

## Step-by-Step Deployment

### Step 1 — Set Up RDS PostgreSQL

Follow the detailed instructions in [aws/rds-setup.md](./aws/rds-setup.md).

**Quick summary:**
1. Create a `db.t3.micro` PostgreSQL instance in a private VPC subnet.
2. Attach a security group that only allows port 5432 from the App Runner VPC connector.
3. Note the endpoint and construct your `DATABASE_URL`:
   ```
   postgresql://hbfit_admin:<PASSWORD>@<ENDPOINT>:5432/hbfit?schema=public&sslmode=require
   ```

---

### Step 2 — Create S3 Bucket for Uploads

1. Go to **S3 → Create bucket**.
2. Name: `hbfit-uploads-prod` (or similar).
3. Region: same as your App Runner service.
4. Block all public access: **on** (serve uploads through Next.js API routes).
5. Enable versioning for safety.
6. Create an IAM policy with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `arn:aws:s3:::hbfit-uploads-prod/*` and attach it to your deployment IAM user.
7. Set `AWS_S3_BUCKET=hbfit-uploads-prod` in your env vars.

---

### Step 3 — Create the App Runner Service

#### Option A — Console (first time)
1. Go to **App Runner → Create service**.
2. Source: **Source code repository** → connect your GitHub account → select `honorboundfit/hbfit-web`, branch `main`.
3. Build settings:
   - Runtime: `Node.js 18`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Port: `3000`
4. Auto-deployments: **enabled**.
5. Environment variables: add all secrets from the table above.
6. Instance configuration: 1 vCPU / 2 GB RAM.
7. VPC connector: connect to the same VPC as your RDS instance.
8. Copy the service ARN and save it as the `APPRUNNER_SERVICE_ARN` GitHub secret.

#### Option B — AWS CLI (using the config file)
```bash
aws apprunner create-service \
  --cli-input-json file://aws/apprunner.json \
  --region us-east-1
```

---

### Step 4 — Point honorboundfit.com DNS to App Runner

1. In the App Runner console, open your service → **Custom domains → Add domain**.
2. Enter `honorboundfit.com` (and optionally `www.honorboundfit.com`).
3. App Runner will give you **CNAME records** to add to your DNS provider.
4. In Route 53 (or your registrar), create the CNAME records as instructed.
5. Wait for certificate validation (usually < 15 minutes).
6. Once validated, App Runner serves traffic over HTTPS automatically.

---

### Step 5 — Run Database Migrations

After the first successful deploy (or after any schema change), run migrations:

```bash
# From your local machine (requires DATABASE_URL in .env.local):
npx prisma migrate deploy

# Or via a bastion EC2 in the same VPC:
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

Verify the schema was applied:
```bash
npx prisma studio   # Opens a browser-based DB viewer
```

---

### Step 6 — Seed Initial Data

Populate lookup tables and default plans:

```bash
npx prisma db seed
```

Make sure `prisma.seed` is configured in `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
}
```

---

## Stripe Setup

### Create Products & Prices

1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com).
2. Go to **Products → Add product** for each membership plan:

| Plan | Billing | Suggested Price ID env var |
|---|---|---|
| Monthly Membership | $X/month recurring | `STRIPE_PRICE_MONTHLY` |
| Annual Membership | $X/year recurring | `STRIPE_PRICE_ANNUAL` |
| Day Pass | $X one-time | `STRIPE_PRICE_DAY_PASS` |

3. Copy each **Price ID** (`price_...`) and add to App Runner env vars.
4. Set up a **Webhook** endpoint:
   - URL: `https://honorboundfit.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Add the signing secret as `STRIPE_WEBHOOK_SECRET` env var.

---

## Migrating Members from GymDesk

> **Placeholder** — a full CSV import script should be written once the GymDesk export format is confirmed.

### Expected GymDesk CSV columns
```
first_name, last_name, email, phone, membership_type, start_date, status
```

### Import script placeholder
```bash
# scripts/import-gymdesk.ts
# TODO: implement CSV → Prisma member import
# 1. Read CSV with csv-parse
# 2. For each row: upsert Member record in Prisma
# 3. Optionally create a Stripe Customer and attach a subscription
# 4. Log successes and failures to import-log.txt

npx ts-node scripts/import-gymdesk.ts --file=gymdesk-export.csv --dry-run
```

---

## Post-Deploy Checklist

- [ ] App Runner health check returns HTTP 200 at `/`
- [ ] `honorboundfit.com` resolves and shows the site over HTTPS
- [ ] Stripe webhook endpoint reachable and verified
- [ ] Database migrations applied successfully
- [ ] At least one admin account created
- [ ] Test membership purchase end-to-end in Stripe test mode
- [ ] PWA installs correctly on iOS and Android

---

## Useful Commands

```bash
# Local dev
npm run dev

# Production build (local test)
npm run build && npm start

# Prisma migrations (development)
npx prisma migrate dev --name <migration-name>

# Prisma migrations (production)
npx prisma migrate deploy

# View database
npx prisma studio

# Check App Runner service status
aws apprunner describe-service \
  --service-arn $APPRUNNER_SERVICE_ARN \
  --query 'Service.Status'
```
