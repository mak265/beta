# AURA Beta — Quasar frontend + Express/MongoDB API

## Run locally

Use two terminals from this project directory.

Start the API:
```bash
cd backend
npm install
copy .env.example .env
# Set MONGODB_URI in .env, then:
npm run dev
```
The API health check is at `http://localhost:3000/api/health`.

Start the frontend in the other terminal:
```bash
npm install
npm run dev
```
Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The development server proxies `/api` requests to the API on port 3000.

For production, build the frontend with `npm run build` and reverse-proxy `/api` to the Express server (or configure your own API base URL). Don't expose MongoDB publicly.

## What is implemented
- Server-side validation for name, email, 18+ confirmation, age preferences, religion and relationship goal.
- Explicit sensitive-preference consent, email consent, rate limiting, secure headers, configured CORS, duplicate-email detection.
- MongoDB persistence with unique email and pending one-month premium reward.
- No distance filter.

## Before a public beta
- Publish real Privacy Notice and Terms and link them beside the checkboxes. Religion preferences may be sensitive personal information; define retention, deletion, access controls, and a lawful basis.
- Add verified email ownership (verification link), anti-bot challenge, and a deletion/privacy request workflow.
- Use HTTPS, secret management, restricted DB access, backups and monitoring.
- Premium activation is intentionally NOT exposed as a public endpoint: implement a secure, authenticated one-time launch redemption process linked to verified user accounts. No free premium is activated yet.
- Checkbox self-declaration is not robust age verification; apply age-appropriate safeguards before launching a dating service.
