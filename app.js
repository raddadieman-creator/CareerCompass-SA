/**
 * app.js — CareerCompass-SA
 *
 * FIX LOG:
 *  - window.APP (not const APP) so onclick="APP.startJourney()" works from HTML
 *  - window.APP_API defined before use, no reference errors
 *  - Dead code after return() removed
 *  - No dependency on CONFIG or API to start the journey
 *  - config.example.js loads as CONFIG safely with fallback
 */

// ─────────────────────────────────────────────────────────
//  STATE — single source of truth
// ─────────────────────────────────────────────────────────
var _state = {
  user:    { name: "", gender: "", school: "", grade: "", major: "" },
  holland: { scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, answers: [] },
  maturity:{ dimensionScores: {}, answers: [] },
  vision:  { ambition: "", driver: "", sector: "", worktype: "", skill: "", challenge: "", answers: [] },
  currentSection: 0
};

// ─────────────────────────────────────────────────────────
//  APP — exposed to window so HTML onclick attributes work
// ─────────────────────────────────────────────────────────
window.APP = {

  startJourney: function () {
    var wc = document.getElementById("welcome-card");
    var pw = document.getElementById("progress-wrap");
    if (wc) wc.style.display = "none";
    if (pw) pw.style.display = "block";
    this.goToSection(1);
  },

  goToSection: function (n) {
    // Validate section 1 before advancing to section 2
    if (n === 2) {
      _state.user.name   = document.getElementById("fn").value.trim();
      _state.user.gender = document.getElementById("fg2").value;
      _state.user.school = document.getElementById("fsc").value.trim();
      _state.user.grade  = document.getElementById("fgr").value;
      _state.user.major  = document.getElementById("fmj").value;

      if (!_state.user.name || !_state.user.gender || !_state.user.grade || !_state.user.major) {
        alert("يرجى تعبئة جميع الحقول أولاً 😊");
        return;
      }
    }

    // Switch active section
    document.querySelectorAll(".section").forEach(function (s) {
      s.classList.remove("active");
    });
    var target = document.getElementById("section-" + n);
    if (target) target.classList.add("active");

    this._updateProgress(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
    _state.currentSection = n;

    // Init quiz agents on first visit
    var s2 = document.getElementById("quiz-shell-2");
    var s3 = document.getElementById("quiz-shell-3");
    var s4 = document.getElementById("quiz-shell-4");

    if (n === 2 && s2 && s2.children.length === 0) QUIZ.init(2, HOLLAND_QUESTIONS,  "holland");
    if (n === 3 && s3 && s3.children.length === 0) QUIZ.init(3, MATURITY_QUESTIONS, "maturity");
    if (n === 4 && s4 && s4.children.length === 0) QUIZ.init(4, VISION_QUESTIONS,   "vision");
    if (n === 5) REPORT.build();
  },

  updateGreeting: function () {
    var n   = document.getElementById("fn").value.trim();
    var g   = document.getElementById("fg2").value;
    var bar = document.getElementById("gbar");
    var txt = document.getElementById("gtxt");
    if (!bar || !txt) return;

    if (n && g) {
      txt.textContent = (g === "طالب" ? "عزيزي الطالب " : "عزيزتي الطالبة ") + n + "، يسعدنا مشاركتك في هذه الرحلة 💛";
      bar.style.display = "flex";
    } else if (n) {
      txt.textContent = "مرحباً " + n + "، يسعدنا مشاركتك 💛";
      bar.style.display = "flex";
    } else {
      bar.style.display = "none";
    }
  },

  getState: function () { return _state; },

  // ── Progress bar ───────────────────────────────────────
  _updateProgress: function (n) {
    var pf = document.getElementById("pf");
    if (pf) pf.style.width = (n / 5 * 100) + "%";
    ["s1l","s2l","s3l","s4l","s5l"].forEach(function (id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      el.className = "pstep";
      if (i + 1 < n)  el.classList.add("done");
      if (i + 1 === n) el.classList.add("active");
    });
  }
};

// ─────────────────────────────────────────────────────────
//  APP_API — calculation & submission functions
//  Exposed globally for the submit button in HTML
// ─────────────────────────────────────────────────────────
window.APP_API = {

  calculateHollandCode: function () {
    var sorted = Object.entries(_state.holland.scores).sort(function (a, b) { return b[1] - a[1]; });
    return {
      top3:       sorted.slice(0, 3).map(function (x) { return x[0]; }),
      code:       sorted.slice(0, 3).map(function (x) { return x[0]; }).join(""),
      allScores:  Object.fromEntries(sorted),
      topPattern: sorted[0][0],
      sorted:     sorted
    };
  },

  calculateCareerReadiness: function () {
    var dims = _state.maturity.dimensionScores;
    var vals = Object.values(dims);
    var avg  = vals.length ? Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) : 50;
    return {
      overall:    avg,
      level:      avg >= 70 ? "high" : avg >= 45 ? "medium" : "low",
      dimensions: dims
    };
  },

  collectAnswers: function () {
    return {
      user:             _state.user,
      holland_answers:  _state.holland.answers,
      maturity_answers: _state.maturity.answers,
      vision_answers:   _state.vision.answers,
      timestamp:        new Date().toISOString()
    };
  },

  generateReport: function () {
    var h = this.calculateHollandCode();
    var r = this.calculateCareerReadiness();
    return {
      user:           _state.user,
      hollandCode:    h.code,
      hollandScores:  h.allScores,
      careerReadiness:r,
      vision:         _state.vision,
      generatedAt:    new Date().toISOString()
    };
  },

  /**
   * submitResults()
   * Prototype: opens Google Forms pre-filled.
   * Future API: set CONFIG.PROTOTYPE_MODE = false and CONFIG.API_ENDPOINT.
   */
  submitResults: function () {
    var h       = this.calculateHollandCode();
    var r       = this.calculateCareerReadiness();
    var profile = (typeof HOLLAND_PROFILES !== "undefined") ? (HOLLAND_PROFILES[h.topPattern] || HOLLAND_PROFILES["S"]) : {};
    var matLvl  = (typeof MATURITY_LEVELS  !== "undefined") ? (MATURITY_LEVELS[r.level]  || {}) : {};

    // Safe CONFIG access — works even if config.js is missing
    var cfg      = (typeof CONFIG !== "undefined") ? CONFIG : {};
    var useApi   = cfg.PROTOTYPE_MODE === false && cfg.API_ENDPOINT;

    if (useApi) {
      // ── Future: replace this block with your backend call ──
      // fetch(cfg.API_ENDPOINT, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(this.generateReport())
      // });
      console.log("API mode not yet configured.");
      return;
    }

    // ── Prototype: Google Forms pre-fill ──
    var formsUrl = cfg.FORMS_URL || "https://docs.google.com/forms/d/e/1FAIpQLSeKWPmTI_mmf3T-hCxtEDzJMiVaSZi0NkwCsiJjnG4u6eLRRQ/viewform";
    var en = cfg.FORMS_ENTRIES || {
      name:"entry.33593307", gender:"entry.891465232",
      school:"entry.540045223", grade:"entry.1657832647",
      major:"entry.1270070855", hollandCode:"entry.1655285712",
      careerPattern:"entry.957526605", maturityLevel:"entry.837439434",
      maturityPercent:"entry.789864144", sector:"entry.1712174354",
      ambition:"entry.1870465729", driver:"entry.941677160"
    };

    var p = new URLSearchParams();
    p.set(en.name,           _state.user.name);
    p.set(en.gender,         _state.user.gender);
    p.set(en.school,         _state.user.school);
    p.set(en.grade,          _state.user.grade);
    p.set(en.major,          _state.user.major);
    p.set(en.hollandCode,    h.code);
    p.set(en.careerPattern,  profile.name || "");
    p.set(en.maturityLevel,  matLvl.label || "");
    p.set(en.maturityPercent,r.overall + "%");
    p.set(en.sector,         _state.vision.sector);
    p.set(en.ambition,       _state.vision.ambition);
    p.set(en.driver,         _state.vision.driver);
    p.set("usp",             "pp_url");

    window.open(formsUrl + "?" + p.toString(), "_blank");
  }
};

// ─────────────────────────────────────────────────────────
//  QUIZ — question rendering and answer collection engine
// ─────────────────────────────────────────────────────────
var QUIZ = (function () {
  var _agents = {};   // per-section state

  function init(sectionNum, questions, type) {
    _agents[sectionNum] = { qIndex: 0, questions: questions, type: type, done: false };

    var shell = document.getElementById("quiz-shell-" + sectionNum);
    if (!shell) return;
    shell.innerHTML = "";

    // Phase-dots track
    var phaseDiv = document.createElement("div");
    phaseDiv.className = "phase-track";
    phaseDiv.innerHTML =
      '<span class="phase-label">التقدم:</span>' +
      '<div class="phase-dots" id="phase-dots-' + sectionNum + '">' +
        questions.map(function (_, i) {
          return '<div class="phase-dot ' + (i === 0 ? "active" : "") + '" id="pd-' + sectionNum + '-' + i + '"></div>';
        }).join("") +
      '</div>' +
      '<span class="phase-counter" id="pc-' + sectionNum + '">1 / ' + questions.length + '</span>';
    shell.appendChild(phaseDiv);

    // Chat container
    var chatDiv = document.createElement("div");
    chatDiv.id = "chat-" + sectionNum;
    shell.appendChild(chatDiv);

    // Opening message
    var greetings = {
      2: "مرحباً " + _state.user.name + "! 🌟\nسأطرح عليك " + questions.length + " سؤالاً لاكتشاف ميولك المهنية.\nلا توجد إجابة صحيحة أو خاطئة — اختر ما يعبّر عنك فعلاً.",
      3: "أحسنت " + _state.user.name + "! 📊\nسنقيس الآن مستوى جاهزيتك المهنية.\n" + questions.length + " أسئلة — أجب بصدق.",
      4: "اقتربنا من النهاية! 🔮\n" + questions.length + " أسئلة أخيرة لربط ميولك برؤية 2030."
    };
    _addSysMsg(sectionNum, greetings[sectionNum] || "");
    setTimeout(function () { _askQuestion(sectionNum); }, 500);
  }

  function _askQuestion(sectionNum) {
    var ag = _agents[sectionNum];
    if (ag.qIndex >= ag.questions.length) { _finish(sectionNum); return; }
    var q = ag.questions[ag.qIndex];

    _showThinking(sectionNum, function () {
      var chatEl = document.getElementById("chat-" + sectionNum);

      // Question bubble
      var qDiv = document.createElement("div");
      qDiv.className = "q-wrap";
      qDiv.innerHTML = '<div class="q-meta">🧭 ' + q.meta + '</div><div class="q-text">' + q.text + '</div>';
      chatEl.appendChild(qDiv);

      // Options
      var optsDiv = document.createElement("div");
      optsDiv.className = "opts-grid";
      q.options.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.className = "opt";
        btn.textContent = opt.label;
        btn.addEventListener("click", function () { _choose(sectionNum, opt, optsDiv, q); });
        optsDiv.appendChild(btn);
      });
      chatEl.appendChild(optsDiv);
      chatEl.scrollTop = chatEl.scrollHeight;
    });
  }

  function _choose(sectionNum, opt, optsEl, q) {
    var chatEl = document.getElementById("chat-" + sectionNum);
    var ag     = _agents[sectionNum];

    // Lock options & highlight chosen
    optsEl.querySelectorAll(".opt").forEach(function (b) {
      b.disabled = true;
      if (b.textContent === opt.label) b.classList.add("selected");
      else b.style.opacity = ".3";
    });

    // Record answer & apply score
    if (ag.type === "holland" && opt.scores) {
      Object.keys(opt.scores).forEach(function (k) { _state.holland.scores[k] += opt.scores[k]; });
      _state.holland.answers.push({ q: ag.qIndex, label: opt.label, scores: opt.scores });
    }
    if (ag.type === "maturity" && opt.matScore !== undefined) {
      _state.maturity.dimensionScores[q.dimension] = opt.matScore;
      _state.maturity.answers.push({ q: ag.qIndex, label: opt.label, dimension: q.dimension, score: opt.matScore });
    }
    if (ag.type === "vision" && q.key) {
      _state.vision[q.key] = opt.value;
      _state.vision.answers.push({ q: ag.qIndex, label: opt.label, key: q.key, value: opt.value });
    }

    // User bubble
    var aWrap = document.createElement("div");
    aWrap.className = "a-wrap";
    aWrap.innerHTML = '<div class="a-bubble">' + opt.label + '</div>';
    chatEl.appendChild(aWrap);
    chatEl.scrollTop = chatEl.scrollHeight;

    // Reflection → next question
    setTimeout(function () {
      var rDiv = document.createElement("div");
      rDiv.className = "r-wrap";
      rDiv.innerHTML = '<div class="r-bubble">💡 ' + opt.reflection + '</div>';
      chatEl.appendChild(rDiv);
      chatEl.scrollTop = chatEl.scrollHeight;

      ag.qIndex++;
      _updateDots(sectionNum, ag.qIndex, ag.questions.length);
      setTimeout(function () { _askQuestion(sectionNum); }, 800);
    }, 350);
  }

  function _showThinking(sectionNum, cb) {
    var chatEl = document.getElementById("chat-" + sectionNum);
    var div = document.createElement("div");
    div.className = "thinking";
    div.innerHTML = "<span></span><span></span><span></span>";
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
    setTimeout(function () { div.remove(); cb(); }, 550);
  }

  function _addSysMsg(sectionNum, text) {
    var chatEl = document.getElementById("chat-" + sectionNum);
    if (!chatEl) return;
    var div = document.createElement("div");
    div.className = "sys-msg";
    div.innerHTML = text.replace(/\n/g, "<br>");
    chatEl.appendChild(div);
  }

  function _updateDots(sectionNum, newIndex, total) {
    for (var i = 0; i < total; i++) {
      var dot = document.getElementById("pd-" + sectionNum + "-" + i);
      if (!dot) continue;
      dot.className = "phase-dot";
      if (i < newIndex)  dot.classList.add("done");
      if (i === newIndex) dot.classList.add("active");
    }
    var counter = document.getElementById("pc-" + sectionNum);
    if (counter) counter.textContent = (Math.min(newIndex + 1, total)) + " / " + total;
  }

  function _finish(sectionNum) {
    var chatEl = document.getElementById("chat-" + sectionNum);
    var msgs   = { 2: "✨ اكتمل تحليل الميول!", 3: "📊 اكتمل قياس الجاهزية.", 4: "🔮 اكتملت الرحلة الاستكشافية!" };
    var labels = { 2: "انتقل لقياس جاهزيتك المهنية 📊", 3: "انتقل لمرحلة رؤية 2030 🔮", 4: "🏆 اعرض تقريرك الكامل" };

    _addSysMsg(sectionNum, msgs[sectionNum] || "");

    setTimeout(function () {
      var btn = document.createElement("button");
      btn.className = "btn btn-gold";
      btn.style.marginTop = "1rem";
      btn.textContent = labels[sectionNum] || "التالي";
      var nextSection = sectionNum === 4 ? 5 : sectionNum + 1;
      btn.addEventListener("click", function () { APP.goToSection(nextSection); });
      chatEl.appendChild(btn);
      chatEl.scrollTop = 99999;
      _agents[sectionNum].done = true;
    }, 500);
  }

  return { init: init };
})();

// ─────────────────────────────────────────────────────────
//  REPORT — builds the final results page
// ─────────────────────────────────────────────────────────
var REPORT = (function () {

  function build() {
    var h       = APP_API.calculateHollandCode();
    var r       = APP_API.calculateCareerReadiness();
    var user    = _state.user;
    var vision  = _state.vision;
    var profile = HOLLAND_PROFILES[h.topPattern] || HOLLAND_PROFILES["S"];
    var matLvl  = MATURITY_LEVELS[r.level];
    var g       = user.gender === "طالب";
    var matchPct= Math.min(95, profile.match || 78);

    _set("rh-label", (g ? "عزيزي الطالب " : "عزيزتي الطالبة ") + user.name + " — تقريرك المهني:");
    _set("rh-code",  h.code);
    _set("rh-name",  profile.name);
    _html("rh-badge","✅ نسبة التوافق: " + matchPct + "%");
    _set("rh-desc",  profile.desc);

    // Top 3
    _html("top3-grid", h.sorted.slice(0, 3).map(function (x, i) {
      return '<div class="top3-chip rank-' + (i + 1) + '">' +
        '<div class="t3-rank">' + ["الأول","الثاني","الثالث"][i] + '</div>' +
        '<div class="t3-letter">' + x[0] + '</div>' +
        '<div class="t3-name">'   + PATTERN_NAMES[x[0]] + '</div>' +
        '<div class="t3-score">'  + PATTERN_DESC_SHORT[x[0]] + '</div>' +
      '</div>';
    }).join(""));

    // Clarity indicator
    var gap = h.sorted[0][1] - (h.sorted[1] ? h.sorted[1][1] : 0);
    _html("clarity-box", gap >= 3
      ? '<div class="clarity-box clear">✅ <strong>النتيجة واضحة:</strong> ميلك نحو النمط "' + PATTERN_NAMES[h.sorted[0][0]] + '" يتميّز بوضوح عن باقي الأنماط.</div>'
      : '<div class="clarity-box mixed">⚠️ <strong>ميول متعددة:</strong> درجاتك متقاربة بين أنماط عدة — قد يستفيد استكشافك من جلسة إرشادية متخصصة.</div>');

    // RIASEC chart
    var colors = { R:"#f5a623",I:"#00c9aa",A:"#8b5cf6",S:"#22c55e",E:"#f43f5e",C:"#ffc85c" };
    var maxVal = Math.max.apply(null, Object.values(_state.holland.scores).concat([1]));
    _html("riasec-chart", h.sorted.map(function (item) {
      var code = item[0], score = item[1];
      var w = Math.round(score / maxVal * 100);
      return '<div class="riasec-row">' +
        '<div class="riasec-code" style="color:' + colors[code] + '">' + code + '</div>' +
        '<div class="riasec-bar-bg"><div class="riasec-bar-fill" style="width:0%;background:' + colors[code] + '" data-w="' + w + '%"></div></div>' +
        '<div class="riasec-val">' + score + '</div>' +
      '</div>';
    }).join(""));
    setTimeout(function () {
      document.querySelectorAll(".riasec-bar-fill").forEach(function (el) { el.style.width = el.dataset.w; });
    }, 200);

    // Match bars
    var bars = [
      { l:"التوافق مع ميولك المهنية",   v:matchPct,                        c:"mf-gold"   },
      { l:"مستوى الجاهزية المهنية",      v:r.overall,                       c:"mf-teal"   },
      { l:"التوافق مع سوق العمل 2030",  v:Math.min(95, matchPct - 2),      c:"mf-purple" },
      { l:"وضوح القرار المهني",          v:gap >= 3 ? Math.min(90, matchPct + 5) : 55, c:"mf-green" }
    ];
    _html("maturity-bars", bars.map(function (b) {
      return '<div class="match-row">' +
        '<div class="match-lbl"><span>' + b.l + '</span><span>' + b.v + '%</span></div>' +
        '<div class="match-bg"><div class="match-fill ' + b.c + '" style="width:0%" data-w="' + b.v + '%"></div></div>' +
      '</div>';
    }).join(""));
    setTimeout(function () {
      document.querySelectorAll(".match-fill").forEach(function (el) { el.style.width = el.dataset.w; });
    }, 300);

    // Maturity breakdown
    var dimEntries = Object.entries(r.dimensions);
    var strHTML = dimEntries.filter(function (e) { return e[1] >= 70; }).slice(0, 3).map(function (e) {
      return '<div class="mb-item strength"><div class="mb-label">نقطة قوة</div><div class="mb-val good">✅ ' + MATURITY_DIMENSIONS[e[0]] + '</div></div>';
    }).join("");
    var needHTML = dimEntries.filter(function (e) { return e[1] < 50; }).slice(0, 3).map(function (e) {
      return '<div class="mb-item needs"><div class="mb-label">تحتاج دعماً</div><div class="mb-val warn">📌 ' + MATURITY_DIMENSIONS[e[0]] + '</div></div>';
    }).join("");
    _html("maturity-breakdown", strHTML + needHTML || '<div class="mb-item"><div class="mb-val">—</div></div>');

    var matColor = r.level === "high" ? "var(--green)" : r.level === "medium" ? "var(--gold)" : "var(--rose)";
    _html("maturity-message",
      '<strong style="color:' + matColor + '">' + matLvl.badge + '</strong><br><br>' +
      '<strong>ما تعنيه هذه النتيجة:</strong> ' + matLvl.meaning + '<br><br>' +
      '<strong>الخطوة التالية:</strong> ' + matLvl.nextStep);

    // Analysis
    _html("analysis-text", '<strong style="color:var(--teal2)">ما كشفته رحلتك عنك:</strong><br><br>' + profile.analysis);

    // Sectors
    var sectorList = (profile.sectors || []).slice();
    if (vision.sector && sectorList.indexOf(vision.sector) === -1) sectorList.unshift(vision.sector);
    _html("sectors-grid", sectorList.slice(0, 6).map(function (s) {
      return '<div class="sector-chip">' + s + '</div>';
    }).join(""));

    // Jobs
    _html("jobs-grid", (profile.jobs || []).map(function (j) {
      return '<div class="job-card">' +
        '<div class="job-title">' + j.t + '</div>' +
        '<div class="job-demand">📈 ' + j.d + '</div>' +
        '<div class="job-sector">' + j.s + '</div>' +
      '</div>';
    }).join(""));

    // Specs
    _html("specs-list", (profile.specs || []).map(function (s) {
      return '<div class="spec-item">' +
        '<span class="spec-icon">' + s.icon + '</span>' +
        '<span class="spec-text">' + s.text + '</span>' +
      '</div>';
    }).join(""));

    // Action
    _set("action-text", profile.action);

    // Summary
    var items = [
      {l:"الاسم",           v:user.name},
      {l:"الجنس",           v:user.gender},
      {l:"المدرسة",         v:user.school || "—"},
      {l:"الصف",            v:user.grade},
      {l:"المسار",          v:user.major},
      {l:"الكود الثلاثي",  v:h.code},
      {l:"النمط المهني",    v:profile.name},
      {l:"نسبة التوافق",   v:matchPct + "%"},
      {l:"مستوى الجاهزية", v:matLvl.label},
      {l:"درجة الجاهزية",  v:r.overall + "%"},
      {l:"القطاع المناسب", v:vision.sector || (profile.sectors && profile.sectors[0]) || "—"},
      {l:"المحرك الأساسي", v:vision.driver || "—"}
    ];
    _html("summary-grid", items.map(function (i) {
      return '<div class="si"><div class="sl">' + i.l + '</div><div class="sv">' + i.v + '</div></div>';
    }).join(""));
  }

  function _set(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
  function _html(id, html) { var el = document.getElementById(id); if (el) el.innerHTML  = html; }

  return { build: build };
})();
