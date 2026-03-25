// Content script injected into LinkedIn, Indeed, Glassdoor job pages
// Adds a floating "Check Fit" button next to the Apply button

(function () {
  // Wait for page to load
  const observer = new MutationObserver(() => {
    injectButton();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also try immediately
  setTimeout(injectButton, 2000);

  function injectButton() {
    // Don't inject twice
    if (document.getElementById("talentagent-fit-btn")) return;

    // Find the apply button area
    const selectors = [
      // LinkedIn
      ".jobs-apply-button",
      ".jobs-s-apply button",
      // Indeed
      "#applyButtonLinkContainer",
      ".jobsearch-IndeedApplyButton",
      // Glassdoor
      '[data-test="applyButton"]',
      ".css-t3xrds",
    ];

    let target = null;
    for (const sel of selectors) {
      target = document.querySelector(sel);
      if (target) break;
    }

    if (!target) return;

    // Create the button
    const btn = document.createElement("button");
    btn.id = "talentagent-fit-btn";
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Check Fit — TalentAgent';

    btn.addEventListener("click", function() {
      const baseUrl = "https://talentagent.com";
      window.open(
        baseUrl + "/check-fit?url=" + encodeURIComponent(window.location.href),
        "_blank"
      );
    });

    // Insert after the apply button
    target.parentElement?.insertBefore(btn, target.nextSibling);
    observer.disconnect();
  }
})();
