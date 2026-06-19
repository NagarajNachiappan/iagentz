# Deploying iagentz.ai to AWS (S3 + CloudFront)

The site is a static Vite SPA. `npm run build` emits everything to `dist/`.
GitHub Actions (`.github/workflows/deploy.yml`) builds on every push to `main`,
syncs `dist/` to an S3 bucket, and invalidates CloudFront so it goes live.

You do the one-time AWS setup below, add a few GitHub secrets, and point your
GoDaddy DNS at CloudFront. After that, every push deploys automatically.

---

## 0. One-command provisioning with CloudFormation (recommended)

`infra/cloudformation.yaml` creates everything in section 1 (S3 bucket, OAC,
bucket policy, ACM cert, CloudFront distribution, IAM deploy user + access key)
as a single stack. Use this instead of the manual steps in section 1.

You need the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
installed and logged in (`aws configure`) with an admin/poweruser identity.

**1. Launch the stack (must be us-east-1):**

```bash
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name iagentz-site \
  --template-file infra/cloudformation.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

**2. Validate the certificate (the deploy will sit and wait here).**
A few seconds after launch, the ACM cert exists in "Pending validation". Read its
two DNS validation records and add them at GoDaddy (section 3a):

```bash
# find the cert ARN
aws cloudformation describe-stack-resources --region us-east-1 \
  --stack-name iagentz-site \
  --query "StackResources[?ResourceType=='AWS::CertificateManager::Certificate'].PhysicalResourceId" \
  --output text
# read the CNAME name/value to paste into GoDaddy
aws acm describe-certificate --region us-east-1 --certificate-arn <CERT_ARN> \
  --query 'Certificate.DomainValidationOptions[].ResourceRecord'
```

Once those records resolve, ACM issues the cert and the `deploy` command finishes
on its own (give it 10–20 min total the first time).

**3. Read the outputs** — these are the exact values for GitHub (section 2):

```bash
aws cloudformation describe-stacks --region us-east-1 \
  --stack-name iagentz-site \
  --query "Stacks[0].Outputs" --output table
```

You'll get `BucketName`, `DistributionId`, `DistributionDomainName`,
`DeployAccessKeyId`, and `DeploySecretAccessKey`. Copy the access key + secret
into GitHub secrets **now** (the secret is only retrievable from stack outputs).

**Teardown:** empty the bucket, then `aws cloudformation delete-stack --region
us-east-1 --stack-name iagentz-site`. (The bucket has `Retain` set, so it survives
stack deletion — remove it manually if you want it gone.)

Then skip to **section 2** (GitHub config) and **section 3** (GoDaddy DNS).

---

## 1. Manual alternative — one-time AWS infrastructure

> Skip this entire section if you used the CloudFormation stack in section 0.

Do this once in **your AWS commercial account**. The CLI quick-path is below;
the console equivalents are in parentheses.

> Set these shell variables first (pick your own bucket name — it must be globally unique):
>
> ```bash
> BUCKET=iagentz-site-prod
> REGION=us-east-1
> ```

### 1a. S3 bucket (private — CloudFront reads it via OAC)

```bash
aws s3api create-bucket --bucket "$BUCKET" --region "$REGION"
# Keep it fully private; CloudFront Origin Access Control will read it.
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

### 1b. ACM certificate (MUST be in us-east-1 for CloudFront)

Request a cert covering the apex and www:

```bash
aws acm request-certificate --region us-east-1 \
  --domain-name iagentz.ai \
  --subject-alternative-names www.iagentz.ai \
  --validation-method DNS \
  --query CertificateArn --output text
```

Then read the DNS validation records you need to add at GoDaddy:

```bash
aws acm describe-certificate --region us-east-1 \
  --certificate-arn <CERT_ARN> \
  --query 'Certificate.DomainValidationOptions[].ResourceRecord'
```

You'll get one CNAME per domain (a long `_xxxx.iagentz.ai → _yyyy.acm-validations.aws`).
Add both at GoDaddy (see section 3). The cert flips to **Issued** once they resolve
(usually minutes).

### 1c. CloudFront distribution

Create a distribution (console is easiest here: **CloudFront → Create distribution**):

- **Origin**: your S3 bucket, with **Origin access control (OAC)** — let the console
  create the OAC and it will print the bucket policy to paste into S3.
- **Viewer protocol policy**: Redirect HTTP → HTTPS.
- **Default root object**: `index.html`
- **Alternate domain names (CNAMEs)**: `iagentz.ai` and `www.iagentz.ai`
- **Custom SSL certificate**: the ACM cert from 1b.
- **Custom error responses** (so deep links / refresh work as an SPA):
  - 403 → response page `/index.html`, response code `200`
  - 404 → response page `/index.html`, response code `200`

Note the distribution's **Domain name** (e.g. `d1234abcd.cloudfront.net`) and its
**Distribution ID** — you need both below.

### 1d. IAM user for GitHub Actions

Create an IAM user (programmatic access) with this least-privilege policy
(replace the bucket name and distribution ARN):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::iagentz-site-prod"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::iagentz-site-prod/*"
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

Save the access key ID and secret.

> **Hardening (optional):** instead of long-lived keys, use GitHub OIDC. Create an
> IAM role trusting `token.actions.githubusercontent.com` for this repo, attach the
> same policy, and in `deploy.yml` swap the two `aws-access-key-*` lines for
> `role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}`. The `id-token: write`
> permission is already set.

---

## 2. GitHub repo configuration

In the GitHub repo: **Settings → Secrets and variables → Actions**.

**Secrets:**

| Name | Value |
|------|-------|
| `AWS_ACCESS_KEY_ID` | from the IAM user (1d) |
| `AWS_SECRET_ACCESS_KEY` | from the IAM user (1d) |

**Variables:**

| Name | Value |
|------|-------|
| `S3_BUCKET` | `iagentz-site-prod` (your bucket name) |
| `CLOUDFRONT_DISTRIBUTION_ID` | your distribution ID |
| `AWS_REGION` | `us-east-1` (or your bucket's region) |

Push to `main` (or run the workflow manually from the Actions tab) and it deploys.

---

## 3. GoDaddy DNS changes

Your domain stays registered at GoDaddy. You have two options for DNS.

### Option A — Keep DNS at GoDaddy (what you asked for)

In GoDaddy: **My Products → DNS → Manage DNS**.

**3a. Certificate validation (add the two CNAMEs from step 1b).** For each ACM
record, GoDaddy's "Name" is the part *before* `.iagentz.ai` (strip the trailing
`.iagentz.ai.`), and "Value" is the full `_yyyy.acm-validations.aws.` target.

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `_abc123…` (from ACM) | `_def456….acm-validations.aws.` | 1 hour |

**3b. The `www` subdomain → CloudFront.**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` | `d1234abcd.cloudfront.net` | 600 sec |

> Replace `d1234abcd.cloudfront.net` with **your** distribution domain from 1c.
> Do **not** include `https://` or a trailing slash.

**3c. The apex `iagentz.ai`.** DNS rules forbid a CNAME on the root domain, and
GoDaddy has no ALIAS/ANAME record, so you can't point the bare `iagentz.ai`
straight at CloudFront here. Use GoDaddy **Domain Forwarding** instead:

- GoDaddy → your domain → **Forwarding → Add** (Domain forwarding)
- Forward `iagentz.ai` to `https://www.iagentz.ai`
- Type: **Permanent (301)**, Settings: **Forward only**

Net result: `www.iagentz.ai` is served by CloudFront; the bare `iagentz.ai`
301-redirects to `www`. Remove any old GitHub Pages `A`/`CNAME` records for the
apex and `www` first so they don't conflict.

### Option B — Move DNS to Route 53 (cleanest for the bare apex)

If you'd rather have `iagentz.ai` (no `www`) be the real CloudFront site with no
redirect, host DNS in Route 53:

1. Route 53 → create a **public hosted zone** for `iagentz.ai`.
2. Add the ACM validation CNAMEs (1b) and an **Alias A record** (and Alias AAAA)
   at the apex pointing to your CloudFront distribution. Add the same for `www`.
3. In **GoDaddy → Nameservers**, switch to the 4 nameservers Route 53 assigned to
   the hosted zone. (You keep the domain registered at GoDaddy; only DNS moves.)

This makes the apex a true alias to CloudFront, no forwarding hop.

---

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview  # serve the production build locally
```

## Notes

- The old GitHub Pages `CNAME` file is no longer used by AWS. It's harmless to
  leave, but once you're live on CloudFront you can delete it and disable GitHub
  Pages for the repo to avoid confusion.
- Three images in the design (`human-os.jpg`, `skill-to-agent.jpg`,
  `pillar-optimize.jpg`) stand in for assets that were hosted remotely in the
  original Lovable export. They're bundled locally so the site is fully
  self-contained. Swap them anytime in `src/assets/` + the imports in `src/App.tsx`.
