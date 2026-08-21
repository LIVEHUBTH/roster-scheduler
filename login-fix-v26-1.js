/* ROSTER SCHEDULER — LOGIN STATUS FIX V26.1
   Fixes: null is not an object (evaluating el('status').textContent=t)
*/
(function () {
  "use strict";

  function ensureStatusElement() {
    if (document.getElementById("status")) return;

    var status = document.createElement("div");
    status.id = "status";
    status.setAttribute("aria-live", "polite");
    status.style.display = "none";
    document.body.appendChild(status);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStatusElement, { once: true });
  } else {
    ensureStatusElement();
  }

  var observer = new MutationObserver(function () {
    ensureStatusElement();
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
