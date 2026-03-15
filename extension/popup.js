const API_BASE = "https://talentagent.com"; // Change to localhost:3000 for dev

document.addEventListener("DOMContentLoaded", async () => {
  const checkBtn = document.getElementById("check-btn");
  const loadingEl = document.getElementById("loading");
  const noJobEl = document.getElementById("no-job");
  const resultEl = document.getElementById("result");
  const openAppBtn = document.getElementById("open-app");

  // Open Full App button
  openAppBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: `${API_BASE}/check-fit` });
  });

  // Check if we're on a supported job page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || "";

  const isJobPage =
    url.includes("linkedin.com/jobs") ||
    url.includes("indeed.com") ||
    url.includes("glassdoor.com/job") ||
    url.includes("glassdoor.com/Job");

  if (isJobPage) {
    checkBtn.disabled = false;
    noJobEl.textContent = "Job posting detected. Click below to check your fit.";
  }

  checkBtn.addEventListener("click", async () => {
    checkBtn.disabled = true;
    loadingEl.style.display = "block";
    noJobEl.style.display = "none";
    resultEl.style.display = "none";

    try {
      // Extract job description from the page
      const [{ result: jobText }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Try common selectors for job descriptions
          const selectors = [
            ".jobs-description__content",
            ".job-description",
            '[data-testid="job-description"]',
            ".jobsearch-jobDescriptionText",
            "#jobDescriptionText",
            ".desc",
            "article",
          ];
          for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent.trim().length > 100) {
              return el.textContent.trim();
            }
          }
          // Fallback: get all text from the page body
          return document.body.innerText.slice(0, 5000);
        },
      });

      if (!jobText || jobText.length < 50) {
        noJobEl.textContent = "Could not extract job description. Try the full app.";
        noJobEl.style.display = "block";
        loadingEl.style.display = "none";
        checkBtn.disabled = false;
        return;
      }

      // Send to scrape API to get a clean description
      const scrapeRes = await fetch(`${API_BASE}/api/scrapeJob`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const scrapeData = await scrapeRes.json();
      const description = scrapeData.jobDescription || jobText;

      // Get stored portfolio data (user needs to have logged in via the app)
      const stored = await chrome.storage.local.get(["portfolio", "userId"]);

      if (!stored.portfolio) {
        loadingEl.style.display = "none";
        resultEl.innerHTML = `
          <div class="status error">
            Sign in to TalentAgent first to use the fit checker.
          </div>
        `;
        resultEl.style.display = "block";
        checkBtn.disabled = false;
        return;
      }

      // Run fit assessment
      const fitRes = await fetch(`${API_BASE}/api/fitAssessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: description,
          portfolio: stored.portfolio,
          portfolioId: stored.portfolio.id,
        }),
      });
      const fitData = await fitRes.json();

      if (fitData.assessment) {
        const a = fitData.assessment;
        const scoreColor = a.score >= 75 ? "#10b981" : a.score >= 50 ? "#f59e0b" : "#ef4444";
        const verdictClass = a.score >= 75 ? "good" : a.score >= 50 ? "ok" : "bad";

        resultEl.innerHTML = `
          <div class="result">
            <svg class="score-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor}" stroke-width="8" stroke-linecap="round"
                stroke-dasharray="${(a.score / 100) * 327} 327" transform="rotate(-90 60 60)"/>
              <text x="60" y="68" text-anchor="middle" fill="${scoreColor}" font-size="28" font-weight="700">${a.score}</text>
            </svg>
            <h2>${a.verdict}</h2>
            <p>${a.summary}</p>
            <div class="verdict ${verdictClass}">
              ${a.shouldApply ? "✅ You should apply" : "⚠️ Consider skipping"}
            </div>
            ${a.strengths?.length ? `
              <div class="tags">
                ${a.strengths.map((s) => `<span class="tag strength">+ ${s}</span>`).join("")}
              </div>
            ` : ""}
            ${a.gaps?.length ? `
              <div class="tags">
                ${a.gaps.map((g) => `<span class="tag gap">- ${g}</span>`).join("")}
              </div>
            ` : ""}
          </div>
        `;
        resultEl.style.display = "block";
      } else {
        resultEl.innerHTML = `<div class="status error">Could not analyze this job. Try the full app.</div>`;
        resultEl.style.display = "block";
      }
    } catch (err) {
      resultEl.innerHTML = `<div class="status error">Error: ${err.message}. Try the full app.</div>`;
      resultEl.style.display = "block";
    } finally {
      loadingEl.style.display = "none";
      checkBtn.disabled = false;
    }
  });
});
