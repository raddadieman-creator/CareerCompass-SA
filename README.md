# 🧭 CareerCompass-SA
### بوصلة القرار المهني 2030

**An interactive career decision support prototype for Saudi high school students, grounded in Holland's RIASEC typology, Super's Career Maturity Inventory, and aligned with Vision 2030 labor market priorities.**

---

> ⚠️ **This is a Prototype.** CareerCompass-SA is an exploratory research tool, not a validated psychometric instrument. Results are advisory and intended to support — not replace — professional career counseling.

---

## 📌 Project Overview

CareerCompass-SA is a browser-based, fully offline interactive system that guides secondary school students through a structured career exploration journey. It simulates a multi-agent conversational experience using pre-defined logic, producing a personalized career profile report grounded in established theoretical frameworks.

The system was developed as part of academic research on integrating AI-agent design patterns into school-based career counseling, with a focus on reducing counselor workload while improving the quality of career guidance for Saudi students.

---

## 🎯 Objectives

- Help students explore their vocational interests and identify dominant Holland patterns
- Assess career maturity readiness using CMI-inspired dimensions
- Connect personal interests to Vision 2030 labor market sectors
- Generate a structured career profile report suitable for counselor review
- Serve as a data collection instrument for academic research

---

## 👥 Target Population

Saudi secondary school students (Grades 10–12) across all academic tracks:
- مسار عام · مسار صحة وحياة · مسار هندسة · مسار شريعة

---

## 🧩 System Components

| Component | Description |
|-----------|-------------|
| **Agent 1 — Vocational Interests** | 12 adaptive questions mapping to Holland's RIASEC typology |
| **Agent 2 — Career Maturity** | 7 questions assessing CMI dimensions (clarity, planning, confidence, etc.) |
| **Agent 3 — Vision 2030 Alignment** | 6 questions linking interests to national labor market priorities |
| **Report Engine** | Generates a three-letter Holland code, maturity level, sector recommendations, job forecasts, and an action step |

---

## ❓ Question Structure

### Section A — Vocational Interests (Holland RIASEC) — 12 Questions
Covers all six Holland types with at least 2 questions per type:

| Type | Description |
|------|-------------|
| **R** — Realistic | Practical, technical, hands-on work preference |
| **I** — Investigative | Analytical, research-oriented, problem-solving |
| **A** — Artistic | Creative expression, aesthetic sensitivity |
| **S** — Social | Helping, teaching, interpersonal engagement |
| **E** — Enterprising | Leadership, persuasion, entrepreneurship |
| **C** — Conventional | Organization, precision, structured tasks |

Question types: preference · behavior · environment · situation · decision

### Section B — Career Maturity (CMI) — 7 Questions
Assesses seven dimensions:
1. Goal clarity
2. Self-awareness of abilities
3. Information gathering
4. Consultation and mentoring
5. Decision confidence
6. Planning orientation
7. Labor market knowledge

### Section C — Vision 2030 & Labor Market — 6 Questions
Links student aspirations to:
- Career ambition
- Core motivational driver
- Preferred sector
- Work environment preference
- Future skill priorities
- National development challenge of interest

---

## 📊 Report Output

The final report includes:
- **Three-letter Holland Code** (e.g., IAS, REC)
- **RIASEC score distribution** (bar chart)
- **Top 3 patterns** with clarity indicator
- **Career maturity level** (High / Medium / Developing)
- **Maturity dimension breakdown** (strengths + areas needing support)
- **Professional personality analysis**
- **Recommended sectors** aligned with Vision 2030
- **Top 5 future jobs** with demand indicators
- **Top 5 university specializations**
- **Actionable next step**
- **Full summary grid** for counselor use

---

## 🛠️ Tech Stack

| Technology | Role |
|------------|------|
| HTML5 | Structure |
| CSS3 | Styling (dark professional theme) |
| Vanilla JavaScript (ES6) | Logic, quiz engine, report builder |
| Google Fonts (Cairo + Tajawal) | Arabic typography |
| Google Forms (optional) | Data collection backend |

No frameworks. No dependencies. No build step required.

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/career-compass-sa.git
cd career-compass-sa

# No installation needed — open directly in browser
open index.html
```

Or use a local server (recommended to avoid CORS issues with external fonts):

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```

Then open: `http://localhost:8000`

---

## ⚙️ Configuration

1. Copy `config.example.js` → `config.js`
2. Fill in your Google Forms URL and entry IDs
3. `config.js` is excluded from git (see `.gitignore`)

```js
// config.js (never commit this file)
const CONFIG = {
  FORMS_URL: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform",
  FORMS_ENTRIES: {
    name: "entry.XXXXXXX",
    // ...
  }
};
```

---

## 🌐 Deploying to GitHub Pages

1. Push your repository to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Save — your site will be live at:

```
https://YOUR_USERNAME.github.io/career-compass-sa/
```

> **Note:** `config.example.js` is loaded by default. The app works without `config.js` — the Google Forms submission uses a fallback URL. For full data collection, create `config.js` locally and do not push it to GitHub.

---

## 🔐 API Key Security

### What is an API Key?
An API Key is a secret credential that grants access to a paid service (e.g., Anthropic Claude). It behaves like a password tied to your billing account.

### Why NOT to put it in GitHub
If an API Key is committed to a public repository:
- Anyone can use your quota (costing you money)
- The provider may suspend your account
- Bots scan GitHub continuously for exposed keys

### Correct approach for future API integration

```
Browser (frontend)
     ↓  sends answers (no key)
Your Backend / Serverless Function
     ↓  attaches API key (stored as env variable)
AI Provider (Anthropic, OpenAI, etc.)
     ↓  returns analysis
Your Backend
     ↓  forwards result to browser
```

Recommended platforms for the backend layer:
- **Vercel Edge Functions** (simplest for static sites)
- **Netlify Functions**
- **AWS Lambda**
- **Node.js / Python server**

The `api/` folder in this project is reserved for this future backend layer.

---

## 📁 Project Structure

```
career-compass-sa/
│
├── index.html              # Main entry point
├── style.css               # All styles
├── config.example.js       # Config template (safe to commit)
├── config.js               # Your real config (DO NOT commit)
├── .gitignore              # Excludes sensitive files
├── README.md               # This file
│
├── js/
│   ├── questions.js        # All 25 questions — edit here
│   ├── results.js          # Holland profiles, market data — edit here
│   └── app.js              # Application logic, quiz engine, report builder
│
└── api/                    # Reserved for future backend integration
    └── (to be added)
```

**Where to edit:**
- **Questions:** `js/questions.js` — find `HOLLAND_QUESTIONS`, `MATURITY_QUESTIONS`, `VISION_QUESTIONS`
- **Career profiles / jobs / specializations:** `js/results.js` — find `HOLLAND_PROFILES`
- **Google Forms mapping:** `config.js` (copy from `config.example.js`)

---

## 🔭 Future Improvements

- [ ] Connect to Claude API via secure backend for adaptive conversations
- [ ] Add Arabic voice input support
- [ ] Build counselor dashboard for batch result review
- [ ] Add persistent session storage (resume incomplete sessions)
- [ ] Validate psychometric properties of the question bank
- [ ] Support multiple languages (English interface option)
- [ ] Add PDF export for student report
- [ ] Build admin panel for question bank management

---

## ⚠️ Important Disclaimer

CareerCompass-SA is a **research prototype**, not a validated psychometric tool.

- Results are **advisory only** and should be interpreted in consultation with a professional career counselor
- The Holland code generated is based on a brief structured interaction, not a standardized assessment
- Career maturity scores are indicative, not diagnostic
- This tool does not replace professional psychological or career assessment

---

## 👩‍🔬 Author

**Iman Abdul Aziz Al-Raddadi**  
School Counselor & Career Guidance Specialist · Saudi Public Schools  
Master's Candidate — Educational Measurement and Evaluation  
Independent Academic Researcher

---

## 📄 License

This project is released for academic and non-commercial use.  
If you use or adapt this work, please cite the original researcher.

---

*CareerCompass-SA · Prototype v2.0 · Built for Vision 2030*
