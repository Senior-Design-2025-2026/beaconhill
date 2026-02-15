# Development Modes

You can run the Beacon Hill app locally in two modes: **testing** (no login, mock data) or **production** (login required, real AWS data). Use the commands below to start the app in the mode you need.

---

## Prerequisites (once per machine)

1. **Node.js and npm** installed.
2. **Dependencies installed** from the project root:
   ```bash
   npm install
   ```
3. **Config file** `src/aws-exports.json` present (for production mode; see team for the shared config if missing).

---

## Testing mode (no login, mock data)

Use this mode to develop and test the UI without signing in or calling AWS. The app skips the login screen and uses dummy data stored only in the browser.

### How to start

1. Open a terminal in the project root.
2. Run:
   ```bash
   npm run start:test
   ```
3. When the dev server is ready, open **http://localhost:3000** in your browser.

### Testing Mode:
Use this mode for building and testing layouts, components, and flows with fake data before switching to the real backend.
- No login screen 
- Mock data only (no connection to DynamoDB or the API)

---

## Production mode (login required, real data)

Use this mode to run the app against the real AWS backend: Cognito for sign-in and the live API (e.g. `/items`) for data.

### How to start

1. Open a terminal in the project root.
2. Run either:
   ```bash
   npm start
   ```
   or:
   ```bash
   npm run start:prod
   ```
   Both commands start the app in production mode.
3. When the dev server is ready, open **http://localhost:3000** in your browser.

### What you get
Use this mode to test teh layouts, components, and flows with the real backend
- Login required (the Amplify Authenticator (Cognito) is shown at start)
- Real API and data (uses the live API Gateway, Lambdas, and DynamoDB backend)

---

## Quick reference

| Goal                    | Command              | Login   | Data source   |
|-------------------------|----------------------|--------|---------------|
| Local UI with fake data | `npm run start:test` | Bypassed | Mock (local)  |
| Local UI with real AWS  | `npm start` or `npm run start:prod` | Required (Cognito) | Live API / DynamoDB |

Only one server can use port 3000 at a time. If you see “Something is already running on port 3000,” stop the other process (Ctrl+C in its terminal) or change the port (e.g. `PORT=3001 npm run start:test`).
