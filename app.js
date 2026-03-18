/**
 * app.js
 * Career Decision Compass 2030 — CareerCompass-SA
 *
 * Main application logic. Depends on:
 *   - questions.js  (HOLLAND_QUESTIONS, MATURITY_QUESTIONS, VISION_QUESTIONS)
 *   - results.js    (HOLLAND_PROFILES, MATURITY_LEVELS, PATTERN_NAMES, etc.)
 *   - config.js     (CONFIG — copy from config.example.js)
 *
 * Architecture:
 *   APP    — section navigation, state management, API-ready functions
 *   QUIZ   — question rendering and answer collection engine
 *   REPORT — final report builder
 */

// ─────────────────────────────────────────────────────────
//  APP — core state and navigation
// ─────────────────────────────────────────────────────────
const APP = (() => {

  // ── Application state ──────────────────────────────────
  const state = {
    user: { name: "", gender: "", school: "", grade: "", major: "" },
    holland: { scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, answers: [] },
    maturity: { dimensionScores: {}, answers: [] },
    vision: { ambition: "", driver: "", sector: "", worktype: "", skill: "", challenge: "", answers: [] },
    currentSection: 0
  };

  // ── Section navigation ─────────────────────────────────
  function startJourney() {
    document.getElementById("welcome-card").style.display = "none";
    document.getElementById("progress-wrap").style.display = "block";
    goToSection(1);
  }

  function goToSection(n) {
    if (n === 2) {
      state.user.name   = document.getElementById("fn").value.trim();
      state.user.gender = document.getElementById("fg2").value;
      state.user.school = document.getElementById("fsc").value.trim();
      state.user.grade  = document.getElementById("fgr").value;
      state.user.major  = document.getElementById("fmj").value;
      if (!state.user.name || !state.user.gender || !state.user.grade || !state.user.major) {
        alert("يرجى تعبئة جميع الحقول أولاً 😊");
        return;
      }
    }

    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById("section-" + n).classList.add("active");
    updateProgress(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
    state.currentSection = n;

    const shell2 = document.getElementById("quiz-shell-2");
    const shell3 = document.getElementById("quiz-shell-3");
    const shell4 = document.getElementById("quiz-shell-4");

    if (n === 2 && shell2 && shell2.children.length === 0)
      QUIZ.init(2, HOLLAND_QUESTIONS, "holland");
    if (n === 3 && shell3 && shell3.children.length === 0)
      QUIZ.init(3, MATURITY_QUESTIONS, "maturity");
    if (n === 4 && shell4 && shell4.children.length === 0)
      QUIZ.init(4, VISION_QUESTIONS, "vision");
    if (n === 5)
      REPORT.build();
  }

  function updateProgress(n) {
    const pf = document.getElementById("pf");
    if (pf) pf.style.width = (n / 5 * 100) + "%";

    ["s1l", "s2l", "s3l", "s4l", "s5l"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = "pstep";
      if (i + 1 < n) el.classList.add("done");
      else if (i + 1 === n) el.classList.add("active");
    });
  }

  function updateGreeting() {
    const n = document.getElementById("fn").value.trim();
    const g = document.getElementById("fg2").value;
    const bar = document.getElementById("gbar");
    if (!bar) return;

    if (n && g) {
      const t = g === "طالب" ? `عزيزي الطالب ${n}` : `عزيزتي الطالبة ${n}`;
      document.getElementById("gtxt").textContent = t + "، يسعدنا مشاركتك في هذه الرحلة 💛";
      bar.style.display = "flex";
    } else if (n) {
      document.getElementById("gtxt").textContent = `مرحباً ${n}، يسعدنا مشاركتك 💛`;
      bar.style.display = "flex";
    } else {
      bar.style.display = "none";
    }
  }

  // ── API-ready functions ────────────────────────────────
  // These are designed to be replaced with real API calls later.

  /**
   * collectAnswers()
   * Returns all user answers in a structured format ready to send to an API.
   */
  function collectAnswers() {
    return {
      user: state.user,
      holland_answers: state.holland.answers,
      maturity_answers: state.maturity.answers,
      vision_answers: state.vision.answers,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * calculateHollandCode()
   * Returns sorted patterns, top-3 code (e.g. "IAS"), and all scores.
   */
  function calculateHollandCode() {
    const sorted = Object.entries(state.holland.scores).sort((a, b) => b[1] - a[1]);
    return {
      top3: sorted.slice(0, 3).map(x => x[0]),
      code: sorted.slice(0, 3).map(x => x[0]).join(""),
      allScores: Object.fromEntries(sorted),
      topPattern: sorted[0][0],
      sorted
    };
  }

  /**
   * calculateCareerReadiness()
   * Returns overall maturity score and level (high / medium / low).
   */
  function calculateCareerReadiness() {
    const dimScores = state.maturity.dimensionScores;
    const vals = Object.values(dimScores);
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 50;
    return {
      overall: avg,
      level: avg >= 70 ? "high" : avg >= 45 ? "medium" : "low",
      dimensions: dimScores
    };
  }

  /**
   * generateReport()
   * Assembles the full report object. Ready to be sent to a backend / API.
   */
  function generateReport() {
    const holland = calculateHollandCode();
    const readiness = calculateCareerReadiness();
    return {
      user: state.user,
      hollandCode: holland.code,
      hollandScores: holland.allScores,
      careerReadiness: readiness,
      vision: state.vision,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * submitResults()
   * In prototype mode: opens Google Forms with pre-filled data.
   * In API mode (future): sends report to backend endpoint.
   *
   * TO ENABLE API MODE:
   *   1. Set CONFIG.PROTOTYPE_MODE = false in config.js
   *   2. Set CONFIG.API_ENDPOINT to your backend URL
   *   3. Uncomment the fetch block below
   */
  function submitResults() {
    const holland = calculateHollandCode();
    const readiness = calculateCareerReadiness();

    if (typeof CONFIG !== "undefined" && !CONFIG.PROTOTYPE_MODE && CONFIG.API_ENDPOINT) {
      // ── Future API call (uncomment when backend is ready) ──
      // const report = generateReport();
      // fetch(CONFIG.API_ENDPOINT, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(report)
      // }).then(r => r.json()).then(data => console.log("API response:", data));
    } else {
      // ── Prototype: Google Forms pre-fill ──
      if (typeof CONFIG === "undefined") {
        console.warn("config.js not found — using fallback Forms URL");
      }
      const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
      const formsUrl = cfg.FORMS_URL || "https://docs.google.com/forms/d/e/1FAIpQLSeKWPmTI_mmf3T-hCxtEDzJMiVaSZi0NkwCsiJjnG4u6eLRRQ/viewform";
      const entries = cfg.FORMS_ENTRIES || {
        name: "entry.33593307", gender: "entry.891465232",
        school: "entry.540045223", grade: "entry.1657832647",
        major: "entry.1270070855", hollandCode: "entry.1655285712",
        careerPattern: "entry.957526605", maturityLevel: "entry.837439434",
        maturityPercent: "entry.789864144", sector: "entry.1712174354",
        ambition: "entry.1870465729", driver: "entry.941677160"
      };
      const profile = HOLLAND_PROFILES[holland.topPattern] || HOLLAND_PROFILES["S"];
      const matLevel = MATURITY_LEVELS[readiness.level];

      const p = new URLSearchParams({
        [entries.name]:           state.user.name,
        [entries.gender]:         state.user.gender,
        [entries.school]:         state.user.school,
        [entries.grade]:          state.user.grade,
        [entries.major]:          state.user.major,
        [entries.hollandCode]:    holland.code,
        [entries.careerPattern]:  profile.name,
        [entries.maturityLevel]:  matLevel.label,
        [entries.maturityPercent]:readiness.overall + "%",
        [entries.sector]:         state.vision.sector,
        [entries.ambition]:       state.vision.ambition,
        [entries.driver]:         state.vision.driver,
        "usp": "pp_url"
      });
      window.open(formsUrl + "?" + p.toString(), "_blank");
    }
  }

  return {
    startJourney,
    goToSection,
    updateGreeting,
    getState: () => state
  };

  // Export API-ready functions for external access
  Object.assign(APP_API = {}, { collectAnswers, calculateHollandCode, calculateCareerReadiness, generateReport, submitResults });
})();

// Expose API functions globally
const APP_API = {};
(function bindAPI() {
  const s = APP.getState();

  APP_API.collectAnswers = function () {
    return {
      user: s.user,
      holland_answers: s.holland.answers,
      maturity_answers: s.maturity.answers,
      vision_answers: s.vision.answers,
      timestamp: new Date().toISOString()
    };
  };

  APP_API.calculateHollandCode = function () {
    const sorted = Object.entries(s.holland.scores).sort((a, b) => b[1] - a[1]);
    return {
      top3: sorted.slice(0, 3).map(x => x[0]),
      code: sorted.slice(0, 3).map(x => x[0]).join(""),
      allScores: Object.fromEntries(sorted),
      topPattern: sorted[0][0],
      sorted
    };
  };

  APP_API.calculateCareerReadiness = function () {
    const dimScores = s.maturity.dimensionScores;
    const vals = Object.values(dimScores);
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 50;
    return { overall: avg, level: avg >= 70 ? "high" : avg >= 45 ? "medium" : "low", dimensions: dimScores };
  };

  APP_API.generateReport = function () {
    return {
      user: s.user,
      hollandCode: APP_API.calculateHollandCode().code,
      hollandScores: APP_API.calculateHollandCode().allScores,
      careerReadiness: APP_API.calculateCareerReadiness(),
      vision: s.vision,
      generatedAt: new Date().toISOString()
    };
  };

  APP_API.submitResults = function () {
    const holland = APP_API.calculateHollandCode();
    const readiness = APP_API.calculateCareerReadiness();
    const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
    const formsUrl = cfg.FORMS_URL || "https://docs.google.com/forms/d/e/1FAIpQLSeKWPmTI_mmf3T-hCxtEDzJMiVaSZi0NkwCsiJjnG4u6eLRRQ/viewform";
    const entries = cfg.FORMS_ENTRIES || {
      name: "entry.33593307", gender: "entry.891465232",
      school: "entry.540045223", grade: "entry.1657832647",
      major: "entry.1270070855", hollandCode: "entry.1655285712",
      careerPattern: "entry.957526605", maturityLevel: "entry.837439434",
      maturityPercent: "entry.789864144", sector: "entry.1712174354",
      ambition: "entry.1870465729", driver: "entry.941677160"
    };
    const profile = HOLLAND_PROFILES[holland.topPattern] || HOLLAND_PROFILES["S"];
    const matLevel = MATURITY_LEVELS[readiness.level];
    const p = new URLSearchParams({
      [entries.name]: s.user.name, [entries.gender]: s.user.gender,
      [entries.school]: s.user.school, [entries.grade]: s.user.grade,
      [entries.major]: s.user.major, [entries.hollandCode]: holland.code,
      [entries.careerPattern]: profile.name, [entries.maturityLevel]: matLevel.label,
      [entries.maturityPercent]: readiness.overall + "%",
      [entries.sector]: s.vision.sector, [entries.ambition]: s.vision.ambition,
      [entries.driver]: s.vision.driver, "usp": "pp_url"
    });
    window.open(formsUrl + "?" + p.toString(), "_blank");
  };
})();

// ─────────────────────────────────────────────────────────
//  QUIZ — question rendering engine
// ─────────────────────────────────────────────────────────
const QUIZ = (() => {
  const agentState = {};

  function init(sectionNum, questions, type) {
    const st = APP.getState();
    agentState[sectionNum] = { qIndex: 0, questions, type, done: false };

    const shell = document.getElementById("quiz-shell-" + sectionNum);
    shell.innerHTML = "";

    // Phase dots track
    const phaseDiv = document.createElement("div");
    phaseDiv.className = "phase-track";
    phaseDiv.innerHTML = `
      <span class="phase-label">التقدم:</span>
      <div class="phase-dots" id="phase-dots-${sectionNum}">
        ${questions.map((_, i) => `<div class="phase-dot ${i === 0 ? "active" : ""}" id="pd-${sectionNum}-${i}"></div>`).join("")}
      </div>
      <span class="phase-counter" id="pc-${sectionNum}">1 / ${questions.length}</span>`;
    shell.appendChild(phaseDiv);

    // Chat container
    const chatDiv = document.createElement("div");
    chatDiv.id = "chat-" + sectionNum;
    shell.appendChild(chatDiv);

    const greetings = {
      2: `مرحباً ${st.user.name}! 🌟\nسأطرح عليك ${questions.length} سؤالاً لاكتشاف ميولك المهنية.\nلا توجد إجابة صحيحة أو خاطئة — اختر ما يعبّر عنك فعلاً.`,
      3: `أحسنت ${st.user.name}! 📊\nالآن سنقيس مستوى جاهزيتك لاتخاذ قراراتك المهنية.\n${questions.length} أسئلة — أجب بصدق لتحصل على نتيجة دقيقة.`,
      4: `اقتربنا من النهاية! 🔮\n${questions.length} أسئلة أخيرة لربط ميولك بسوق العمل السعودي ورؤية 2030.\nاختر ما يعبّر عن طموحك الحقيقي.`
    };
    addSysMsg(sectionNum, greetings[sectionNum]);
    setTimeout(() => askQuestion(sectionNum), 500);
  }

  function askQuestion(sectionNum) {
    const st = agentState[sectionNum];
    if (st.qIndex >= st.questions.length) { finishAgent(sectionNum); return; }

    const q = st.questions[st.qIndex];
    showThinking(sectionNum, () => {
      const chatEl = document.getElementById("chat-" + sectionNum);

      const qDiv = document.createElement("div");
      qDiv.className = "q-wrap";
      qDiv.innerHTML = `<div class="q-meta">🧭 ${q.meta}</div><div class="q-text">${q.text}</div>`;
      chatEl.appendChild(qDiv);

      const optsDiv = document.createElement("div");
      optsDiv.className = "opts-grid";
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "opt";
        btn.textContent = opt.label;
        btn.onclick = () => choose(sectionNum, opt, optsDiv, q);
        optsDiv.appendChild(btn);
      });
      chatEl.appendChild(optsDiv);
      chatEl.scrollTop = chatEl.scrollHeight;
    });
  }

  function choose(sectionNum, opt, optsEl, q) {
    const appState = APP.getState();
    const chatEl = document.getElementById("chat-" + sectionNum);

    optsEl.querySelectorAll(".opt").forEach(b => {
      b.disabled = true;
      if (b.textContent === opt.label) b.classList.add("selected");
      else b.style.opacity = ".3";
    });

    if (agentState[sectionNum].type === "holland" && opt.scores) {
      Object.keys(opt.scores).forEach(k => appState.holland.scores[k] += opt.scores[k]);
      appState.holland.answers.push({ q: agentState[sectionNum].qIndex, label: opt.label, scores: opt.scores });
    }
    if (agentState[sectionNum].type === "maturity" && opt.matScore !== undefined) {
      const dim = q.dimension;
      appState.maturity.dimensionScores[dim] = opt.matScore;
      appState.maturity.answers.push({ q: agentState[sectionNum].qIndex, label: opt.label, dimension: dim, score: opt.matScore });
    }
    if (agentState[sectionNum].type === "vision" && q.key) {
      appState.vision[q.key] = opt.value;
      appState.vision.answers.push({ q: agentState[sectionNum].qIndex, label: opt.label, key: q.key, value: opt.value });
    }

    const aWrap = document.createElement("div");
    aWrap.className = "a-wrap";
    aWrap.innerHTML = `<div class="a-bubble">${opt.label}</div>`;
    chatEl.appendChild(aWrap);
    chatEl.scrollTop = chatEl.scrollHeight;

    setTimeout(() => {
      const rDiv = document.createElement("div");
      rDiv.className = "r-wrap";
      rDiv.innerHTML = `<div class="r-bubble">💡 ${opt.reflection}</div>`;
      chatEl.appendChild(rDiv);
      chatEl.scrollTop = chatEl.scrollHeight;

      agentState[sectionNum].qIndex++;
      updatePhaseDots(sectionNum, agentState[sectionNum].qIndex, agentState[sectionNum].questions.length);
      setTimeout(() => askQuestion(sectionNum), 800);
    }, 350);
  }

  function showThinking(sectionNum, cb) {
    const chatEl = document.getElementById("chat-" + sectionNum);
    const div = document.createElement("div");
    div.className = "thinking";
    div.innerHTML = "<span></span><span></span><span></span>";
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
    setTimeout(() => { div.remove(); cb(); }, 550);
  }

  function addSysMsg(sectionNum, text) {
    const chatEl = document.getElementById("chat-" + sectionNum);
    const div = document.createElement("div");
    div.className = "sys-msg";
    div.innerHTML = text.replace(/\n/g, "<br>");
    chatEl.appendChild(div);
  }

  function updatePhaseDots(sectionNum, newIndex, total) {
    for (let i = 0; i < total; i++) {
      const dot = document.getElementById(`pd-${sectionNum}-${i}`);
      if (!dot) continue;
      dot.className = "phase-dot";
      if (i < newIndex) dot.classList.add("done");
      else if (i === newIndex) dot.classList.add("active");
    }
    const counter = document.getElementById("pc-" + sectionNum);
    if (counter) counter.textContent = Math.min(newIndex + 1, total) + " / " + total;
  }

  function finishAgent(sectionNum) {
    const chatEl = document.getElementById("chat-" + sectionNum);
    const completions = {
      2: "✨ اكتمل تحليل الميول! الصورة تتشكّل بوضوح.",
      3: "📊 اكتمل قياس الجاهزية. نتائجك جاهزة.",
      4: "🔮 اكتملت الرحلة الاستكشافية. تقريرك في الطريق!"
    };
    const nextLabels = {
      2: "انتقل لقياس جاهزيتك المهنية 📊",
      3: "انتقل لمرحلة رؤية 2030 🔮",
      4: "🏆 اعرض تقريرك المهني الكامل"
    };
    addSysMsg(sectionNum, completions[sectionNum]);
    setTimeout(() => {
      const btn = document.createElement("button");
      btn.className = "btn btn-gold";
      btn.style.marginTop = "1rem";
      btn.textContent = nextLabels[sectionNum];
      btn.onclick = () => APP.goToSection(sectionNum === 4 ? 5 : sectionNum + 1);
      chatEl.appendChild(btn);
      chatEl.scrollTop = 99999;
      agentState[sectionNum].done = true;
    }, 500);
  }

  return { init };
})();

// ─────────────────────────────────────────────────────────
//  REPORT — final report builder
// ─────────────────────────────────────────────────────────
const REPORT = (() => {

  function build() {
    const holland = APP_API.calculateHollandCode();
    const readiness = APP_API.calculateCareerReadiness();
    const state = APP.getState();
    const user = state.user;
    const vision = state.vision;

    const profile = HOLLAND_PROFILES[holland.topPattern] || HOLLAND_PROFILES["S"];
    const matLevel = MATURITY_LEVELS[readiness.level];
    const g = user.gender === "طالب";
    const matchPct = Math.min(95, profile.match || 78);

    // Hero section
    _set("rh-label", (g ? "عزيزي الطالب " : "عزيزتي الطالبة ") + user.name + " — تقريرك المهني:");
    _set("rh-code", holland.code);
    _set("rh-name", profile.name);
    _html("rh-badge", "✅ نسبة التوافق: " + matchPct + "%");
    _set("rh-desc", profile.desc);

    // Top 3 patterns
    _html("top3-grid", holland.sorted.slice(0, 3).map((x, i) => `
      <div class="top3-chip rank-${i + 1}">
        <div class="t3-rank">${["الأول", "الثاني", "الثالث"][i]}</div>
        <div class="t3-letter">${x[0]}</div>
        <div class="t3-name">${PATTERN_NAMES[x[0]]}</div>
        <div class="t3-score">${PATTERN_DESC_SHORT[x[0]]}</div>
      </div>`).join(""));

    // Clarity indicator
    const gap = holland.sorted[0][1] - (holland.sorted[1] ? holland.sorted[1][1] : 0);
    _html("clarity-box", gap >= 3
      ? `<div class="clarity-box clear">✅ <strong>النتيجة واضحة:</strong> ميلك نحو النمط "${PATTERN_NAMES[holland.sorted[0][0]]}" يتميّز بوضوح. هذا يُعزّز موثوقية التوصيات.</div>`
      : `<div class="clarity-box mixed">⚠️ <strong>ميول متعددة:</strong> درجاتك متقاربة بين عدة أنماط — مما يعني اهتمامات متنوعة. قد يستفيد استكشافك من جلسات إرشادية متخصصة.</div>`);

    // RIASEC chart
    const maxVal = Math.max(...Object.values(state.holland.scores), 1);
    const colors = { R: "#f5a623", I: "#00c9aa", A: "#8b5cf6", S: "#22c55e", E: "#f43f5e", C: "#ffc85c" };
    _html("riasec-chart", holland.sorted.map(([code, score]) => `
      <div class="riasec-row">
        <div class="riasec-code" style="color:${colors[code]}">${code}</div>
        <div class="riasec-bar-bg">
          <div class="riasec-bar-fill" style="width:0%;background:${colors[code]}" data-w="${Math.round(score / maxVal * 100)}%"></div>
        </div>
        <div class="riasec-val">${score}</div>
      </div>`).join(""));
    setTimeout(() => document.querySelectorAll(".riasec-bar-fill").forEach(el => { el.style.width = el.dataset.w; }), 200);

    // Match bars
    _html("maturity-bars", [
      { l: "التوافق مع ميولك المهنية", v: matchPct, c: "mf-gold" },
      { l: "مستوى الجاهزية المهنية", v: readiness.overall, c: "mf-teal" },
      { l: "التوافق مع سوق العمل 2030", v: Math.min(95, matchPct - 2), c: "mf-purple" },
      { l: "وضوح القرار المهني", v: gap >= 3 ? Math.min(90, matchPct + 5) : 55, c: "mf-green" }
    ].map(b => `
      <div class="match-row">
        <div class="match-lbl"><span>${b.l}</span><span>${b.v}%</span></div>
        <div class="match-bg"><div class="match-fill ${b.c}" style="width:0%" data-w="${b.v}%"></div></div>
      </div>`).join(""));
    setTimeout(() => document.querySelectorAll(".match-fill").forEach(el => { el.style.width = el.dataset.w; }), 300);

    // Maturity breakdown
    const dimEntries = Object.entries(readiness.dimensions);
    const strengths = dimEntries.filter(([, v]) => v >= 70).map(([k]) => k);
    const needs = dimEntries.filter(([, v]) => v < 50).map(([k]) => k);
    const strengthHTML = strengths.slice(0, 3).map(k =>
      `<div class="mb-item strength"><div class="mb-label">نقطة قوة</div><div class="mb-val good">✅ ${MATURITY_DIMENSIONS[k]}</div></div>`).join("");
    const needHTML = needs.slice(0, 3).map(k =>
      `<div class="mb-item needs"><div class="mb-label">تحتاج دعماً</div><div class="mb-val warn">📌 ${MATURITY_DIMENSIONS[k]}</div></div>`).join("");
    _html("maturity-breakdown", strengthHTML + needHTML || `<div class="mb-item"><div class="mb-val">—</div></div>`);

    _html("maturity-message",
      `<strong style="color:${matLevel.label === "مرتفعة" ? "var(--green)" : matLevel.label === "متوسطة" ? "var(--gold)" : "var(--rose)"}">${matLevel.badge}</strong><br><br>
       <strong>ما تعنيه هذه النتيجة:</strong> ${matLevel.meaning}<br><br>
       <strong>الخطوة التالية:</strong> ${matLevel.nextStep}`);

    // Analysis
    _html("analysis-text",
      `<strong style="color:var(--teal2)">ما كشفته رحلتك عنك:</strong><br><br>${profile.analysis}`);

    // Sectors
    const allSectors = [...(profile.sectors || [])];
    if (vision.sector && !allSectors.includes(vision.sector)) allSectors.unshift(vision.sector);
    _html("sectors-grid", allSectors.slice(0, 6).map(s => `<div class="sector-chip">${s}</div>`).join(""));

    // Jobs
    _html("jobs-grid", (profile.jobs || []).map(j => `
      <div class="job-card">
        <div class="job-title">${j.t}</div>
        <div class="job-demand">📈 ${j.d}</div>
        <div class="job-sector">${j.s}</div>
      </div>`).join(""));

    // Specs
    _html("specs-list", (profile.specs || []).map(s => `
      <div class="spec-item">
        <span class="spec-icon">${s.icon}</span>
        <span class="spec-text">${s.text}</span>
      </div>`).join(""));

    // Action
    _set("action-text", profile.action);

    // Summary grid
    const items = [
      { l: "الاسم", v: user.name },
      { l: "الجنس", v: user.gender },
      { l: "المدرسة", v: user.school || "—" },
      { l: "الصف", v: user.grade },
      { l: "المسار", v: user.major },
      { l: "الكود الثلاثي", v: holland.code },
      { l: "النمط المهني", v: profile.name },
      { l: "نسبة التوافق", v: matchPct + "%" },
      { l: "مستوى الجاهزية", v: matLevel.label },
      { l: "درجة الجاهزية", v: readiness.overall + "%" },
      { l: "القطاع المناسب", v: vision.sector || (profile.sectors && profile.sectors[0]) || "—" },
      { l: "المحرك الأساسي", v: vision.driver || "—" }
    ];
    _html("summary-grid", items.map(i =>
      `<div class="si"><div class="sl">${i.l}</div><div class="sv">${i.v}</div></div>`).join(""));
  }

  function _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _html(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  return { build };
})();
