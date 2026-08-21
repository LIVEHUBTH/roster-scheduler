/* =========================================================
   ROSTER SCHEDULER — LOGIN/STATUS GUARD V27.1 FAST
   Filename kept for drop-in replacement: login-fix-v26-1.js
   ========================================================= */
(function () {
  "use strict";

  function ensureStatusElement() {
    var current = document.getElementById("status");
    if (current) return current;

    var status = document.createElement("div");
    status.id = "status";
    status.className = "status no-print";
    status.setAttribute("aria-live", "polite");
    status.style.display = "none";
    status.textContent = "กำลังเริ่มระบบ...";

    /*
      Keep status outside #page-home so rebuilding Home cannot delete it.
      This removes the need for a MutationObserver watching the entire page.
    */
    var home = document.getElementById("page-home");
    if (home && home.parentNode) {
      home.parentNode.insertBefore(status, home);
    } else if (document.body) {
      document.body.insertBefore(status, document.body.firstChild);
    }
    return status;
  }

  ensureStatusElement();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStatusElement, { once: true });
  }

  window.__ensureRosterStatus = ensureStatusElement;
})();
