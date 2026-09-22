/**
 * One-page survey engine matching the provided Google Form's content/flow.
 */
const screen = document.getElementById("screen");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const progressPercent = document.getElementById("progress-percent");

// Changed to v2 to clear your browser cache and fix the missing images
const STORAGE_KEY = "survey_autosave_state_v2";

let state = {
  currentScreen: "consent",
  screenHistory: [],
  postIndex: 0,
  randomizedPosts: [],
  surveyData: {
    consent: null,
    screening: {},
    baselineAnger: null,
    flanker: { accuracy: "", reactionTime: "" },
    participantCode: "",
    demographics: {},
    politicalFollowing: "",
    postOrder: [],
    responses: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
    gcashNumber: ""
};

const SCREEN_ORDER = [
  "consent", "screening", "baseline", "flanker", "participant",
  "demographics", "politicalFollowing", "posts", "debrief", "raffle"
];

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Autosave failed:", e);
  }
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign(state, parsed);
    }
  } catch (e) {
    console.warn("Could not load saved progress:", e);
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear saved progress:", e);
  }
}

function syncAndAutosave() {
  if (state.currentScreen === "consent") {
    const val = document.querySelector('input[name="consent"]:checked')?.value;
    if (val) state.surveyData.consent = (val === "yes");
  } else if (state.currentScreen === "screening") {
    const names = ["youngAdult", "taglish", "activeSocialMedia", "usesX", "politicalAwareness"];
    names.forEach(n => {
      const val = document.querySelector(`input[name="${n}"]:checked`)?.value;
      if (val) state.surveyData.screening[n] = val;
    });
  } else if (state.currentScreen === "baseline") {
    const val = document.querySelector('input[name="baselineAnger"]:checked')?.value;
    if (val) state.surveyData.baselineAnger = Number(val);
  } else if (state.currentScreen === "flanker") {
    const acc = document.getElementById("flankerAccuracy")?.value.trim();
    const rt = document.getElementById("flankerReactionTime")?.value.trim();
    if (acc !== undefined) state.surveyData.flanker.accuracy = acc;
    if (rt !== undefined) state.surveyData.flanker.reactionTime = rt;
  } else if (state.currentScreen === "participant") {
    const code = document.getElementById("participantCode")?.value.trim();
    if (code !== undefined) state.surveyData.participantCode = code;
  } else if (state.currentScreen === "demographics") {
    const age = document.getElementById("age")?.value;
    const sex = document.querySelector('input[name="sexAtBirth"]:checked')?.value;
    const edu = document.querySelector('input[name="education"]:checked')?.value;
    const emp = document.querySelector('input[name="employment"]:checked')?.value;
    const inc = document.querySelector('input[name="income"]:checked')?.value;
    if (age) state.surveyData.demographics.age = age;
    if (sex) state.surveyData.demographics.sexAtBirth = sex;
    if (edu) state.surveyData.demographics.education = edu;
    if (emp) state.surveyData.demographics.employment = emp;
    if (inc) state.surveyData.demographics.income = inc;
  } else if (state.currentScreen === "politicalFollowing") {
    const label = document.querySelector('input[name="politicalFollowing"]:checked')?.value;
    if (label) {
      const option = POLITICAL_FOLLOWING_OPTIONS.find(o => o.label === label);
      if (option) state.surveyData.politicalFollowing = option.value;
    }
  } else if (state.currentScreen === "posts" && state.randomizedPosts[state.postIndex]) {
    const post = state.randomizedPosts[state.postIndex];
    const relevance = document.querySelector('input[name="relevance"]:checked')?.value;
    const threat = document.querySelector('input[name="threat"]:checked')?.value;
    const challenge = document.querySelector('input[name="challenge"]:checked')?.value;
    const coping = document.querySelector('input[name="coping"]:checked')?.value;
    const copingText = document.getElementById("copingText")?.value;
    const anger = document.querySelector('input[name="anger"]:checked')?.value;

    state.surveyData.responses[state.postIndex] = {
      postId: post.id,
      branch: state.surveyData.politicalFollowing,
      position: state.postIndex + 1,
      relevance: relevance ? Number(relevance) : (state.surveyData.responses[state.postIndex]?.relevance || null),
      threat: threat ? Number(threat) : (state.surveyData.responses[state.postIndex]?.threat || null),
      challenge: challenge ? Number(challenge) : (state.surveyData.responses[state.postIndex]?.challenge || null),
      coping: coping ? Number(coping) : (state.surveyData.responses[state.postIndex]?.coping || null),
      copingText: copingText !== undefined ? copingText : (state.surveyData.responses[state.postIndex]?.copingText || ""),
      anger: anger ? Number(anger) : (state.surveyData.responses[state.postIndex]?.anger || null)
    };
  }

  saveProgress();
}

screen.addEventListener("input", syncAndAutosave);
screen.addEventListener("change", syncAndAutosave);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  const index = SCREEN_ORDER.indexOf(state.currentScreen);
  const percent = Math.max(0, Math.round((index / (SCREEN_ORDER.length - 1)) * 100));
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
  progressLabel.textContent = getProgressLabel();

  const renderers = {
    consent: renderConsent,
    screening: renderScreening,
    baseline: renderBaseline,
    flanker: renderFlanker,
    participant: renderParticipant,
    demographics: renderDemographics,
    politicalFollowing: renderPoliticalFollowing,
    posts: renderPost,
    debrief: renderDebrief,
    raffle: renderRaffle
  };
  renderers[state.currentScreen]();
}

function getProgressLabel() {
  return {
    consent: "Study information",
    screening: "Screening",
    baseline: "Anger level",
    flanker: "Eriksen Flanker Test",
    participant: "Participant code",
    demographics: "Demographic Profile",
    politicalFollowing: "Political following",
    posts: "Social Media Posts",
    debrief: "Debriefing",
    raffle: "Token of Appreciation"
  }[state.currentScreen] || "Study";
}

function setScreen(nextScreen, saveHistory = true) {
  if (saveHistory && state.currentScreen !== nextScreen) state.screenHistory.push(state.currentScreen);
  state.currentScreen = nextScreen;
  saveProgress();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBack() {
  const previous = state.screenHistory.pop();
  if (previous) {
    state.currentScreen = previous;
    saveProgress();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function actions({ back = true, nextLabel = "Continue" }) {
  return `<div class="actions">
    ${back ? `<button type="button" class="btn-secondary" id="back-btn">Back</button>` : "<span></span>"}
    <button type="button" class="btn-primary" id="next-btn">${escapeHtml(nextLabel)}</button>
  </div>`;
}

function bindActions(nextHandler, allowBack = true) {
  document.getElementById("next-btn")?.addEventListener("click", nextHandler);
  if (allowBack) document.getElementById("back-btn")?.addEventListener("click", goBack);
}

function renderConsent() {
  const consentVal =
    state.surveyData.consent === true
      ? "yes"
      : state.surveyData.consent === false
      ? "no"
      : "";

  screen.innerHTML = `
    <div class="header-image">
      <img
        src="images/Header_1.png"
        alt="Header"
        style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;"
      >
    </div>

    <h1>${escapeHtml(STUDY_CONFIG.title)}</h1>

    <p>
      Greetings from St. La Salle! We are undergraduate Psychology students
      from De La Salle University — Manila conducting this experiment via
      online survey in partial fulfillment of the requirements for our
      Undergraduate Thesis in Psychology.
    </p>

    <div class="notice">
      <strong>PURPOSE OF THE STUDY</strong>

      <p class="small">
        Before participating, it’s important that you understand why the
        research is being done and what your participation will entail.
        Please read the following information carefully, and feel free to
        contact the researcher/s if there is anything that is not clear
        or if you need more information.
      </p>

      <p class="small">
        This study aims to collect data on how users engage with political
        posts on social media. This study and consent form are intended for
        <strong>Filipino young adults aged 18 to 29</strong>
        who are active social media users and have an interest in politics.
      </p>
    </div>

    <div class="notice">
      <strong>STUDY PROCEDURES</strong>

      <p class="small">
  In this study, you will be asked to complete an online questionnaire
  comprising informed consent, data privacy information, demographic
  information, a short cognitive task, and a series of posts.
  Each post will be followed by questions about how you might engage,
  including statements gauging your degree of agreement and open-ended
  questions for elaboration. This study concludes with a debriefing
  and a presentation of a token of appreciation. All questions will
  be in English.
</p>
    </div>

    <div class="notice">
      <strong>DURATION</strong>

      <p class="small">
        Approximately <strong>twenty (20) to thirty (30) minutes</strong>,
        with no follow-up or interview afterward.
      </p>
    </div>

    <div class="notice">
      <strong>VOLUNTARY PARTICIPATION</strong>

      <p class="small">
        Your participation is completely voluntary. If you choose to
        participate, you will be asked to sign this consent form.
        After signing, you may withdraw at any time without giving a reason.
        Withdrawal will not affect your relationship, if any, with the
        researcher/s. If you withdraw before data collection is completed, your data
        will be destroyed.
      </p>
    </div>

    <div class="notice">
      <strong>RISKS</strong>

      <p class="small">
        It is important to note that negative feelings may be induced as
        the study may include insensitive or offensive material.
        There is also the possibility of a data breach affecting
        confidentiality due to unforeseen circumstances and unpreventable
        events.
      </p>

      <p class="small">
        Preventative measures in effect include ensuring only the group
        and their mentors are able to access recorded and observed data,
        allowing <strong>NO</strong> access to any third party.
        Data will be deleted and destroyed upon the study’s completion
        and upon a participant’s request.
      </p>
    </div>

    <div class="notice">
      <strong>BENEFITS</strong>

      <p class="small">
        There are no direct benefits or guaranteed compensation for
        participating. However, participants will have the opportunity
        to enter a raffle, in which
        <strong>three (3) participants will each receive ₱300</strong>
        as a token of appreciation. The research group hopes that the contributions of this study
        may help advance progress within the field and inform future
        research.
      </p>
    </div>

    <div class="notice">
      <strong>CONFIDENTIALITY</strong>

      <p class="small">
        Your participation in this study will be strictly anonymous and
        confidential. Data will be anonymized, reported in aggregate,
        and stored securely.
      </p>

      <p class="small">
        Participants have the right to both access the data they provided
        and request for any recorded information regarding them to be
        disposed of and destroyed. All data in all published materials will be held in utmost
        confidentiality to the extent permitted by law.
      </p>

      <p class="small">
        For questions about participant rights, contact the DLSU Research
        Ethics Review Committee at chairrerc@dlsu.edu.ph or
        (632) 524-4611 local 513.
      </p>
    </div>

    <div class="notice">
      <strong>MENTAL HEALTH SUPPORT</strong>

      <p class="small">
        If you require support during or after your participation in the
        study, please reach out to the following resources:
      </p>

      <p class="small">
        <strong>National Center for Mental Health:</strong>
        1553 (toll-free), 0917-899-8727, or 0919-057-1553.
      </p>

      <p class="small">
        <strong>In Touch Community Services:</strong>
        02-8893-7603 or 0917-800-1123.
      </p>
    </div>

    <div class="notice">
      <strong>DATA PRIVACY ACT</strong>

      <p class="small">
        In compliance with the Data Privacy Act (DPA) of 2012, and its
        Implementing Rules and Regulations (IRR), I allow and consent
        Dennize Lachica, her thesis group, and De La Salle University –
        Manila to store and use my data for the purpose and execution
        of their research.
      </p>
    </div>

    <div class="question">
      <span class="question-label required">
        By clicking “Yes, I consent.” you acknowledge you have read,
        understood, and agree to all the information listed in this form.
      </span>

      <div class="option-list">
        <label class="option">
          <input
            type="radio"
            name="consent"
            value="yes"
            ${consentVal === "yes" ? "checked" : ""}
          >
          Yes, I consent.
        </label>

        <label class="option">
          <input
            type="radio"
            name="consent"
            value="no"
            ${consentVal === "no" ? "checked" : ""}
          >
          No, I do not consent.
        </label>
      </div>

      <div id="consent-error" class="error hidden">
  Please select one response.
</div>

<div style="height: 24px;"></div>

<p>
  Should any questions or concerns arise, feel free to contact any
  of the researchers listed below.
</p>

      <p>
        <strong>Dennize Lachica</strong> —
        <em>Lead Researcher</em><br>
        +63 966 143 5138<br>
        <a
          href="mailto:dennize_lachica@dlsu.edu.ph"
          style="color: #36383F; text-decoration: none;"
        >
          dennize_lachica@dlsu.edu.ph
        </a>
      </p>

      <p>
        <strong>Adrian Nolasco</strong><br>
        <a
          href="mailto:adrian_nolasco@dlsu.edu.ph"
          style="color: #36383F; text-decoration: none;"
        >
          adrian_nolasco@dlsu.edu.ph
        </a>
      </p>

      <p>
        <strong>Samantha Dela Cruz</strong><br>
        <a
          href="mailto:samantha_delacruz@dlsu.edu.ph"
          style="color: #36383F; text-decoration: none;"
        >
          samantha_delacruz@dlsu.edu.ph
        </a>
      </p>

      <p>
        <strong>Elle Chong</strong><br>
        <a
          href="mailto:elle_carly_chong@dlsu.edu.ph"
          style="color: #36383F; text-decoration: none;"
        >
          elle_carly_chong@dlsu.edu.ph
        </a>
      </p>

      <p>
        <strong>Shayne Polias</strong> —
        <em>Faculty-in-Charge</em><br>
        <a
          href="mailto:shayne.polias@dlsu.edu.ph"
          style="color: #36383F; text-decoration: none;"
        >
          shayne.polias@dlsu.edu.ph
        </a>
      </p>
    </div>

    ${actions({ back: false, nextLabel: "Continue" })}
  `;

  bindActions(() => {
    const value =
      document.querySelector('input[name="consent"]:checked')?.value;

    if (!value) {
      document
        .getElementById("consent-error")
        .classList.remove("hidden");
      return;
    }

    if (value === "no") {
      state.surveyData.consent = false;
      clearProgress();

      screen.innerHTML = `
        <div class="center">
          <h2>Thank you for your time.</h2>
          <p>
            You indicated that you do not consent to participate.
          </p>
        </div>
      `;

      return;
    }

    state.surveyData.consent = true;
    setScreen("screening");
  }, false);
}

function yesNo(name, label, current = "") {
  return `<div class="question"><span class="question-label required">${escapeHtml(label)}</span>
    <div class="option-list">
      <label class="option"><input type="radio" name="${name}" value="yes" ${current === "yes" ? "checked" : ""}> Yes</label>
      <label class="option"><input type="radio" name="${name}" value="no" ${current === "no" ? "checked" : ""}> No</label>
    </div></div>`;
}

function renderScreening() {
  const s = state.surveyData.screening || {};
  screen.innerHTML = `<h2>I. Screening Questions</h2>
    ${yesNo("youngAdult", "Are you part of the young adult age group (i.e., within the ages 18 to 29)?", s.youngAdult)}
    ${yesNo("taglish", "Do you understand Taglish (i.e., both English and Tagalog)?", s.taglish)}
    ${yesNo("activeSocialMedia", "Are you active on social media (i.e., daily usage or 5 times a week)?", s.activeSocialMedia)}
    ${yesNo("usesX", "Do you use X (formerly Twitter)?", s.usesX)}
    ${yesNo("politicalAwareness", "Are you aware of the political situation of/within the Philippines?", s.politicalAwareness)}
    <div id="screening-error" class="error hidden">Please answer all screening questions.</div>
    ${actions({ nextLabel: "Continue" })}`;

  bindActions(() => {
    const names = ["youngAdult", "taglish", "activeSocialMedia", "usesX", "politicalAwareness"];
    const values = Object.fromEntries(names.map(n => [n, document.querySelector(`input[name="${n}"]:checked`)?.value]));
    if (Object.values(values).some(v => !v)) { document.getElementById("screening-error").classList.remove("hidden"); return; }
    state.surveyData.screening = values;
    saveProgress();

    if (Object.values(values).some(v => v === "no")) {
      clearProgress();
      screen.innerHTML = `<div class="center"><h2>Thank you for your time.</h2><p>Based on your responses, you are not eligible to continue with this study.</p></div>`;
      progressBar.style.width = "100%";
      progressPercent.textContent = "100%";
      return;
    }
    setScreen("baseline");
  });
}

function scaleQuestion(name, label, value = null, low = SCALE.agreement.low, high = SCALE.agreement.high) {
  return `<div class="question">
    <span class="question-label required">${escapeHtml(label)}</span>
    <div class="scale">${[1,2,3,4,5].map(n => `
      <div class="scale-option">
        <input type="radio" id="${name}-${n}" name="${name}" value="${n}" ${String(value) === String(n) ? "checked" : ""}>
        <label for="${name}-${n}">${n}</label>
      </div>`).join("")}</div>
    <div class="scale-anchors"><span>${escapeHtml(low)}</span><span>${escapeHtml(high)}</span></div>
  </div>`;
}

function renderBaseline() {
  screen.innerHTML = `<h2>II. Anger Level</h2>
    ${scaleQuestion("baselineAnger", "On a scale of 1 to 5, how would you rate your current anger level?", state.surveyData.baselineAnger, SCALE.anger.low, SCALE.anger.high)}
    <div id="baseline-error" class="error hidden">Please select a response.</div>
    ${actions({ nextLabel: "Continue" })}`;
  bindActions(() => {
    const value = document.querySelector('input[name="baselineAnger"]:checked')?.value;
    if (!value) { document.getElementById("baseline-error").classList.remove("hidden"); return; }
    state.surveyData.baselineAnger = Number(value);
    setScreen("flanker");
  });
}

function renderFlanker() {
  const assessmentUrl = STUDY_CONFIG.assessmentUrl || "#";

  screen.innerHTML = `
    <h2>III. Eriksen Flanker Test</h2>
    <p>As an initial pre-test before the assessment and evaluation proper, please make sure to answer the online test provided below before continuing.</p>
    
    <div class="flanker-card">
      <div class="flanker-status-icon">➡️</div>
      <h3>Eriksen Flanker Test</h3>
      <p class="small muted" style="margin-bottom: 15px;">
        The Eriksen Flanker Test requires you to complete a task wherein a row of Five (5) arrows are projected and shown onto your screen. You are then asked to choose the same direction that the middle or center arrow was pointing towards by clicking or tapping the options on the bottom left and right corners of your screen.
      </p>
      
      <button type="button" id="launch-task-btn" class="btn-primary launch-btn">
        Open the Eriksen Flanker Test ↗
      </button>

      <div id="task-started-msg" class="notice small hidden" style="margin-top: 15px; text-align: left;">
        <strong>Task in progress:</strong> Complete the test in the opened window, then return here to enter your scores below.
      </div>
    </div>

    <div class="notice">
      <strong>Score Reporting</strong>
      <p class="small">Please indicate your score in the section below by typing in your accuracy and reaction time results (e.g., 85%, 0.536).</p>
    </div>

    <div class="question">
      <label class="question-label required" for="flankerAccuracy">Accuracy score</label>
      <input id="flankerAccuracy" type="text" value="${escapeHtml(state.surveyData.flanker.accuracy)}" placeholder="e.g., 85%">
    </div>
    <div class="question">
      <label class="question-label required" for="flankerReactionTime">Reaction time score</label>
      <input id="flankerReactionTime" type="text" value="${escapeHtml(state.surveyData.flanker.reactionTime)}" placeholder="e.g., 0.536">
    </div>

    <div id="flanker-error" class="error hidden">Please enter both your accuracy and reaction time results before continuing.</div>

    ${actions({nextLabel: "Continue"})}`;

  document.getElementById("launch-task-btn")?.addEventListener("click", () => {
    window.open(assessmentUrl, "CogniFitTask", "width=1024,height=768,scrollbars=yes,resizable=yes");
    document.getElementById("task-started-msg")?.classList.remove("hidden");
  });

  bindActions(() => {
    const accuracy = document.getElementById("flankerAccuracy").value.trim();
    const reactionTime = document.getElementById("flankerReactionTime").value.trim();
    const errorEl = document.getElementById("flanker-error");

    if (!accuracy || !reactionTime) {
      errorEl.classList.remove("hidden");
      return;
    }

    errorEl.classList.add("hidden");
    state.surveyData.flanker = { accuracy, reactionTime };
    setScreen("participant");
  });
}

function renderParticipant() {
  screen.innerHTML = `<h2>IV. Demographic Profile</h2>
    <div class="question"><label class="question-label required" for="participantCode">Participant Code (Please input the first three letters of street where you reside and the last 3 digits of your contact number)</label>
      <input id="participantCode" type="text" autocomplete="off" value="${escapeHtml(state.surveyData.participantCode)}"></div>
    <div id="participant-error" class="error hidden">Please enter your participant code.</div>
    ${actions({ nextLabel: "Continue" })}`;
  bindActions(() => {
    const code = document.getElementById("participantCode").value.trim();
    if (!code) { document.getElementById("participant-error").classList.remove("hidden"); return; }
    state.surveyData.participantCode = code;
    setScreen("demographics");
  });
}

function selectQuestion(name, label, options, current = "") {
  return `<div class="question"><span class="question-label required">${escapeHtml(label)}</span><div class="option-list">
    ${options.map(v => `<label class="option"><input type="radio" name="${name}" value="${escapeHtml(v)}" ${current === v ? "checked" : ""}> ${escapeHtml(v)}</label>`).join("")}
  </div></div>`;
}

function renderDemographics() {
  const d = state.surveyData.demographics;
  screen.innerHTML = `<h2>IV. Demographic Profile</h2>
    <div class="question"><label class="question-label required" for="age">Age</label>
      <select id="age"><option value="">Select</option>${Array.from({length:12}, (_,i) => 18+i).map(v => `<option value="${v}" ${String(d.age)===String(v)?"selected":""}>${v}</option>`).join("")}</select></div>
    ${selectQuestion("sexAtBirth", "Sex at Birth", ["Female", "Male", "Others"], d.sexAtBirth)}
    ${selectQuestion("education", "What is the highest level of education you have completed?", ["Elementary school / Primary school", "High school graduate", "Vocational / Trade school", "College undergraduate", "Bachelor's degree / College graduate", "Post-graduate degree (Master's, Doctorate)"], d.education)}
    ${selectQuestion("employment", "What is your current employment status?", ["Student", "Employed full-time", "Employed part-time", "Self-employed", "Unemployed", "Retired"], d.employment)}
    ${selectQuestion("income", "What is your estimated monthly household income?", ["Below ₱10,001", "₱10,001 – ₱20,000", "₱20,001 – ₱40,000", "₱40,001 – ₱75,000", "₱75,001 – ₱125,000", "₱125,001 – ₱250,000", "₱250,001 and above"], d.income)}
    <div id="demographics-error" class="error hidden">Please complete all demographic questions.</div>
    ${actions({ nextLabel: "Continue" })}`;
  bindActions(() => {
    const age = document.getElementById("age").value;
    const sexAtBirth = document.querySelector('input[name="sexAtBirth"]:checked')?.value;
    const education = document.querySelector('input[name="education"]:checked')?.value;
    const employment = document.querySelector('input[name="employment"]:checked')?.value;
    const income = document.querySelector('input[name="income"]:checked')?.value;
    if (!age || !sexAtBirth || !education || !employment || !income) { document.getElementById("demographics-error").classList.remove("hidden"); return; }
    state.surveyData.demographics = { age, sexAtBirth, education, employment, income };
    setScreen("politicalFollowing");
  });
}

function renderPoliticalFollowing() {
  screen.innerHTML = `<h2>V. Social Media Posts</h2>
    <p>Imagine you are scrolling through your social media feed online. As you look through the following posts, try to read them as if you just stumbled across them on your own timeline. Once you've read through them, answer the following questions based on how you felt and what you experienced while reading.</p>
    
    <div class="notice">
      <p class="small"><strong>Important Note:</strong> Once you proceed to each post, you will <strong>not be able to go back or change your answers</strong>. Please answer each question carefully before moving forward.</p>
    </div>

    ${selectQuestion("politicalFollowing", "Which political following do you identify with?", POLITICAL_FOLLOWING_OPTIONS.map(o => o.label), POLITICAL_FOLLOWING_OPTIONS.find(o => o.value === state.surveyData.politicalFollowing)?.label)}
    <div id="political-error" class="error hidden">Please select one response.</div>
    ${actions({ nextLabel: "Begin posts" })}`;
  bindActions(() => {
    const label = document.querySelector('input[name="politicalFollowing"]:checked')?.value;
    if (!label) { document.getElementById("political-error").classList.remove("hidden"); return; }
    const option = POLITICAL_FOLLOWING_OPTIONS.find(o => o.label === label);

    if (state.surveyData.politicalFollowing !== option.value || state.randomizedPosts.length === 0) {
      state.surveyData.politicalFollowing = option.value;
      const shuffled = randomizePosts(POST_BRANCHES[option.value]);

      // Define attention check post object
      const attentionPost = {
        id: "ATTENTION_1",
        image: "images/posts/Attention_1.png",
        alt: "Attention check post"
      };

      // Insert attention check post right after the 3rd randomized post (index 3)
      shuffled.splice(3, 0, attentionPost);

      state.randomizedPosts = shuffled;
      state.surveyData.postOrder = state.randomizedPosts.map(p => p.id);
      state.postIndex = 0;
    }

    setScreen("posts");
  });
}

function renderPost() {
  const post = state.randomizedPosts[state.postIndex];
  if (!post) { setScreen("debrief"); return; }
  const existing = state.surveyData.responses[state.postIndex] || {};
  screen.innerHTML = `<h2>POST ${state.postIndex + 1} of ${state.randomizedPosts.length}</h2>
    
    <div class="notice" style="border-left: 4px solid var(--danger);">
      <p class="small"><strong>⚠️ Attention:</strong> You cannot go back or modify your answers after submitting this post. Please carefully verify your selections before proceeding.</p>
    </div>

    <div class="post-frame"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.alt)}"></div>
    ${scaleQuestion("relevance", "Is this post relevant to you?", existing.relevance)}
    ${scaleQuestion("threat", "Does this post pose a threat to you?", existing.threat)}
    ${scaleQuestion("challenge", "Does this post challenge you?", existing.challenge)}
    ${scaleQuestion("coping", "Were you able to cope?", existing.coping)}
    <div class="question"><label class="question-label required" for="copingText">How can you cope?</label>
      <p class="small muted">${escapeHtml(COPING_DESCRIPTION)}</p>
      <textarea id="copingText">${escapeHtml(existing.copingText || "")}</textarea></div>
    ${scaleQuestion("anger", "On a scale of 1 to 5, how would you rate your current anger level?", existing.anger, SCALE.anger.low, SCALE.anger.high)}
    <div id="post-error" class="error hidden">Please answer all required questions.</div>
    ${actions({ back: false, nextLabel: state.postIndex === state.randomizedPosts.length - 1 ? "Finish" : "Next post" })}`;

  bindActions(() => {
    const values = {};
    ["relevance", "threat", "challenge", "coping", "anger"].forEach(name => {
      values[name] = document.querySelector(`input[name="${name}"]:checked`)?.value;
    });
    const copingText = document.getElementById("copingText").value.trim();
    if (Object.values(values).some(v => !v) || !copingText) {
      document.getElementById("post-error").classList.remove("hidden"); return;
    }
    state.surveyData.responses[state.postIndex] = {
      postId: post.id,
      branch: state.surveyData.politicalFollowing,
      position: state.postIndex + 1,
      relevance: Number(values.relevance),
      threat: Number(values.threat),
      challenge: Number(values.challenge),
      coping: Number(values.coping),
      copingText,
      anger: Number(values.anger)
    };
    saveProgress();

    if (state.postIndex < state.randomizedPosts.length - 1) {
      state.postIndex++;
      saveProgress();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      state.surveyData.completedAt = new Date().toISOString();
      setScreen("debrief");
    }
  }, false);
}

async function submitData() {
  const payload = JSON.parse(JSON.stringify(state.surveyData));

  console.log("FINAL STUDY DATA", payload);

  if (
    STUDY_CONFIG.developmentMode ||
    !STUDY_CONFIG.submissionEndpoint
  ) {
    return {
      ok: true,
      development: true
    };
  }

  const response = await fetch(
    STUDY_CONFIG.submissionEndpoint,
    {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Submission failed with status ${response.status}`
    );
  }

  return {
    ok: true
  };
}

function renderDebrief() {
  screen.innerHTML = `<h2>VI. Debriefing</h2>
    <div class="notice">
      <p class="small" style="white-space: pre-wrap;">${escapeHtml(DEBRIEF_TEXT).trim().replace("National Center for Mental Health", "<strong>National Center for Mental Health</strong>").replace("In Touch Community Services", "<strong>In Touch Community Services</strong>")}
</p>
    </div>

    <p id="submit-status" class="small muted">
      Preparing your responses for submission…
    </p>

    <div id="debrief-action" class="hidden"></div>`;

  submitData().then(result => {
    document.getElementById("submit-status").textContent = result.development
      ? "Development mode: study responses were logged to the browser console and were not uploaded."
      : "Your study responses have been submitted successfully.";

    document.getElementById("debrief-action").innerHTML = `
  <style>
    .raffle-btn {
      background-color: #1f2630;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 9px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .raffle-btn:hover {
      background-color: #6e84a3;
    }
    .raffle-btn:active {
      background-color: #6e84a3;
    }
  </style>
  
  <button type="button" id="continue-to-raffle" class="raffle-btn">
    Continue to Token of Appreciation
  </button>
`;

    document.getElementById("debrief-action").classList.remove("hidden");

    document.getElementById("continue-to-raffle").addEventListener("click", () => {
      setScreen("raffle");
    });

  }).catch(error => {
    console.error(error);

    document.getElementById("submit-status").innerHTML =
      `<span class="error">
        We could not submit your responses. Please contact the researcher at dennize_lachica@dlsu.edu.ph.
      </span>`;
  });
}

function renderRaffle() {
  screen.innerHTML = `<h2>Token of Appreciation</h2>
    <p>Thank you for your participation! As a token of our appreciation, we are holding a raffle where three (3) lucky participants will win ₱300 each via GCash.</p>
    <p>If you would like to join, please write your mobile number below. Your number will only be used to contact you if you win the raffle and will not be used for research purposes.</p>
    <div class="question">
      <label class="question-label" for="gcashNumber">
        If you wish to participate in the raffle, please write down your number.
      </label>
      <input id="gcashNumber" type="tel" autocomplete="tel" value="${escapeHtml(state.surveyData.gcashNumber || "")}">
    </div>
    <div id="raffle-status" class="small muted"></div>
    ${actions({ nextLabel: "Submit" })}`;

  bindActions(async () => {
    state.surveyData.gcashNumber =
      document.getElementById("gcashNumber").value.trim();

    try {
      await submitData();
    } catch (e) {
      console.error(e);
      document.getElementById("raffle-status").textContent =
        "There was a problem submitting your responses. Please contact the researchers.";
      return;
    }

    console.log("FINAL STUDY DATA SUBMITTED", state.surveyData);

    clearProgress();

    screen.innerHTML = `
      <div class="center">
        <h2>Thank you!</h2>
        <p>Your participation is complete.</p>
      </div>`;

    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";
  });
}

loadProgress();
render();