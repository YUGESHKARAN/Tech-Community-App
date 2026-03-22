# Security Policy

## Supported Versions

Only the latest release of this project receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| < latest | :x:               |

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in this project, **please do not open a public GitHub issue.**

### How to Report

Report vulnerabilities privately via one of the following:

- **GitHub Private Vulnerability Reporting:** Use the [Security tab](../../security/advisories/new) on this repository *(Settings → Security → Report a vulnerability)*

Please include as much of the following information as possible to help us understand and resolve the issue quickly:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected component(s) (e.g., authentication, OTP flow, API endpoint)
- Potential impact or severity assessment
- Any suggested fix or mitigation (optional)

### What to Expect

| Timeline | Action |
|----------|--------|
| **Within 48 hours** | Acknowledgement of your report |
| **Within 7 days** | Initial assessment and severity triage |
| **Within 30 days** | Resolution or mitigation plan shared with reporter |
| **After fix is released** | Public disclosure (coordinated with reporter) |

We follow [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure). We will credit reporters in the release notes unless they prefer to remain anonymous.

---

## Scope

### In Scope

The following are considered in scope for vulnerability reports:

- Authentication & session management (login, registration, OTP verification)
- Authorization flaws (privilege escalation, insecure direct object references)
- Injection attacks (SQL, NoSQL, command injection)
- Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)
- Sensitive data exposure (credentials, PII, tokens)
- Insecure API endpoints
- Rate limiting bypass or brute-force vulnerabilities
- Dependency vulnerabilities with a direct exploit path

### Out of Scope

The following are **not** considered valid vulnerability reports:

- Theoretical vulnerabilities without a working proof of concept
- Issues in third-party services (e.g., Gmail SMTP, Redis cloud provider)
- Denial of Service (DoS) attacks requiring significant resources
- Social engineering attacks targeting contributors or maintainers
- Vulnerabilities in outdated browsers or unsupported environments
- Missing security headers without a demonstrated exploitable impact
- Rate limits on non-sensitive endpoints

---

## Security Best Practices for Contributors

When contributing to this project, please follow these guidelines:

### Authentication & OTP
- OTPs must be 6 digits, cryptographically random, and stored only in Redis with a TTL
- Never log OTPs or tokens to console or files
- OTPs must be invalidated immediately after successful use (one-time use)
- Enforce a rate limit on OTP generation endpoints to prevent abuse

### Passwords
- Never store plaintext passwords — always hash with **bcrypt** (minimum cost factor: 12)
- Never log or return passwords in API responses, even partially

### Environment Variables
- Never commit `.env` files or secrets to version control
- Use `.env.example` with placeholder values only
- Rotate credentials immediately if accidentally exposed

### API Security
- Validate and sanitize all user inputs on the server side
- Enforce university email domain check (`@dsuniversity.ac.in`) server-side, never only on the client
- Use parameterized queries / Mongoose schema validation to prevent injection
- Return generic error messages to clients; log detailed errors server-side only

### Dependencies
- Keep dependencies up to date; run `npm audit` regularly
- Do not install packages with known high/critical CVEs without a documented reason

---

## Security-Related Configuration

This project relies on the following security-sensitive configurations. Ensure these are set correctly in production:

| Variable | Description |
|----------|-------------|
| `EMAIL_USER` | Gmail address used to send OTP emails |
| `EMAIL_PASS` | Gmail App Password (**not** your account password) |
| `REDIS_URL` | Redis connection string (use TLS in production) |
| `JWT_SECRET` | Secret for signing auth tokens (min 32 chars, random) |

includes other services security keys:
- AWS-S3 bucket
  |----------|
  |`BUCKET_NAME`|
  |`BUCKET_REGION`|
  |`ACCESS_KEY`|
  |`SECRET_ACCESS_KEY`|
  
- Mongodb connection url
  |----------|
  |`MONGDB_URL`|


---

## Acknowledgements

We thank all security researchers and contributors who help keep this project safe. Responsible disclosures will be credited in our release notes.

---

*This security policy follows the [GitHub recommended community standards](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository) 
