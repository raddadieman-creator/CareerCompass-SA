/**
 * config.example.js
 * Career Decision Compass 2030 — CareerCompass-SA
 *
 * ─────────────────────────────────────────────────────────
 *  HOW TO USE THIS FILE
 * ─────────────────────────────────────────────────────────
 * 1. Copy this file and rename it to config.js
 * 2. Fill in your actual values (Google Forms entries, etc.)
 * 3. NEVER commit config.js to GitHub — it is listed in .gitignore
 *
 * ─────────────────────────────────────────────────────────
 *  WHY NO API KEY HERE?
 * ─────────────────────────────────────────────────────────
 * An API Key is a secret password that grants access to a paid service.
 * If you commit it to a public GitHub repository, anyone can:
 *   - Use your API quota (costing you money)
 *   - Get your account suspended by the provider
 *   - Access data tied to your account
 *
 * The correct approach for connecting to an API (e.g. Anthropic Claude):
 *   - Store the API Key in a backend server, a serverless function,
 *     or an environment variable — NEVER in frontend JavaScript.
 *   - Your frontend sends answers to YOUR backend.
 *   - Your backend attaches the API Key and forwards to the AI provider.
 *   - Recommended services: Vercel Edge Functions, Netlify Functions,
 *     AWS Lambda, or a Node.js/Python backend.
 *
 * ─────────────────────────────────────────────────────────
 *  FUTURE BACKEND STRUCTURE (suggested)
 * ─────────────────────────────────────────────────────────
 *  career-compass/
 *  ├── index.html
 *  ├── js/
 *  │   ├── app.js
 *  │   ├── questions.js
 *  │   └── results.js
 *  └── api/                  ← Add this folder later
 *      ├── analyze.js        ← Serverless function (Vercel / Netlify)
 *      └── .env              ← API key stored here (never committed)
 */

const CONFIG = {

  // ── Prototype mode ──────────────────────────────────────
  // Set to false when connected to a real API backend
  PROTOTYPE_MODE: true,

  // ── API Integration (leave empty in prototype) ──────────
  // When ready, point this to YOUR backend endpoint — not directly to Anthropic
  // Example: "https://your-project.vercel.app/api/analyze"
  API_ENDPOINT: "",

  // ── Google Forms ─────────────────────────────────────────
  // Replace with your actual Google Form URL
  FORMS_URL: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform",

  // Replace these with your actual entry IDs from your Google Form
  FORMS_ENTRIES: {
    name:           "entry.XXXXXXXXX",
    gender:         "entry.XXXXXXXXX",
    school:         "entry.XXXXXXXXX",
    grade:          "entry.XXXXXXXXX",
    major:          "entry.XXXXXXXXX",
    hollandCode:    "entry.XXXXXXXXX",
    careerPattern:  "entry.XXXXXXXXX",
    maturityLevel:  "entry.XXXXXXXXX",
    maturityPercent:"entry.XXXXXXXXX",
    sector:         "entry.XXXXXXXXX",
    ambition:       "entry.XXXXXXXXX",
    driver:         "entry.XXXXXXXXX"
  },

  // ── Project info ─────────────────────────────────────────
  VERSION: "2.0-prototype",
  PROJECT_NAME: "CareerCompass-SA"
};
