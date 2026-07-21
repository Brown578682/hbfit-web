# RDS PostgreSQL Setup for Honor Bound FIT

This document covers provisioning the PostgreSQL database used by Prisma.

---

## Recommended Configuration

| Setting | Value | Notes |
|---|---|---|
| Engine | PostgreSQL 16.x | Latest stable |
| Instance class | `db.t3.micro` | Free-tier eligible |
| Storage type | gp2 | General-purpose SSD |
| Allocated storage | 20 GB | More than enough for a small gym |
| Multi-AZ | **No** | Single-AZ to keep costs low |
| Public access | **No** | Only accessible from within the VPC |
| Backup retention | 7 days | Automated backups enabled |
| Deletion protection | **Yes** | Prevent accidental drops |

---

## Step-by-Step Setup

### 1. Create the DB Subnet Group

1. In the AWS Console, go to **RDS → Subnet groups → Create DB subnet group**.
2. Add at least two private subnets in different Availability Zones (even though Multi-AZ is off, this is required by RDS).
3. Name it `hbfit-db-subnets`.

### 2. Create the Security Group

1. Go to **EC2 → Security Groups → Create security group**.
2. Name it `hbfit-rds-sg`.
3. Add one **inbound rule**:
   - Type: `PostgreSQL` (port 5432)
   - Source: the security group ID attached to your App Runner VPC connector (see App Runner → VPC connectors).
4. No outbound rules are needed.

> **Important:** Never allow `0.0.0.0/0` on port 5432.

### 3. Create the RDS Instance

1. Go to **RDS → Databases → Create database**.
2. Choose:
   - Standard create
   - PostgreSQL engine
   - Free tier template
3. Set:
   - DB instance identifier: `hbfit-db`
   - Master username: `hbfit_admin`
   - Master password: *(store in AWS Secrets Manager)*
   - DB instance class: `db.t3.micro`
   - Storage: 20 GB gp2, storage autoscaling disabled
   - Multi-AZ: No
   - VPC: your project VPC
   - Subnet group: `hbfit-db-subnets`
   - Public access: No
   - VPC security group: `hbfit-rds-sg`
   - Initial database name: `hbfit`

### 4. Set the DATABASE_URL Environment Variable

Once the instance is available, copy the **Endpoint** from the RDS console and set:

```
DATABASE_URL="postgresql://hbfit_admin:<PASSWORD>@<ENDPOINT>:5432/hbfit?schema=public&sslmode=require"
```

Add this secret to:
- **App Runner** → your service → Configuration → Environment variables
- **GitHub Actions** secrets (for migration runs in CI)

### 5. Run Database Migrations

After your first deploy (or any schema change), run:

```bash
npx prisma migrate deploy
```

You can do this from the GitHub Actions pipeline, or manually by spinning up a temporary EC2 bastion in the same VPC:

```bash
# On the bastion:
export DATABASE_URL="postgresql://..."
cd /path/to/app
npx prisma migrate deploy
```

### 6. Optional: Seed Initial Data

```bash
npx prisma db seed
```

Make sure `prisma.seed` is configured in `package.json` first.

---

## Cost Estimate

| Resource | Monthly cost |
|---|---|
| db.t3.micro (750 hrs free tier) | **$0** first 12 months, ~$15/mo after |
| 20 GB gp2 storage (100 GB free tier) | **$0** first 12 months, ~$2.30/mo after |
| Automated backups (20 GB) | **$0** (same size as instance storage) |

---

## Monitoring

Enable **Enhanced Monitoring** and **Performance Insights** (both have free tiers) for visibility into slow queries.

Set a **CloudWatch alarm** on `FreeStorageSpace` to alert when < 2 GB remaining.
