/* =========================================================
   ROSTER SCHEDULER — LOGIN/STATUS GUARD V27.0
   Drop-in filename kept: login-fix-v26-1.js
   ========================================================= */
(function () {
  "use strict";

  function makeStatus() {
    var node = document.createElement("div");
    node.id = "status";
    node.className = "status no-print";
    node.setAttribute("aria-live", "polite");
    node.style.display = "none";
    node.textContent = "กำลังเริ่มระบบ...";
    return node;
  }

  function ensureStatusElement() {
    var current = document.getElementById("status");
    if (current) return current;

    var status = makeStatus();
    var home = document.getElementById("page-home");

    if (home) {
      home.insertBefore(status, home.firstChild);
    } else if (document.body) {
      document.body.appendChild(status);
    } else {
      document.documentElement.appendChild(status);
    }
    return status;
  }

  /* Create it immediately because the inline app can call setStatus()
     as soon as DOMContentLoaded fires. */
  ensureStatusElement();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStatusElement, { once: false });
  }

  /* Home is rebuilt dynamically. If any code removes #status,
     restore it immediately. */
  var observer = new MutationObserver(function () {
    ensureStatusElement();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  /* Defensive guard for global error display.
     Never throw another error while reporting an error. */
  window.addEventListener("error", function () {
    ensureStatusElement();
  });
})();
