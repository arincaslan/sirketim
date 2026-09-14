/*
  Theme selection, and the only JavaScript on this origin.

  LOADED BLOCKING FROM <head>, NOT DEFERRED. The first statements run before
  <body> is parsed, which is what stops the page painting in the wrong theme
  for a frame. The catalogue does the same thing with an inline script; this
  file is external because the Content-Security-Policy here has no
  'unsafe-inline' (see src/lib/http.ts) and a script hash would rot the first
  time somebody edited it.

  THE PREFERENCE DOES NOT FOLLOW A VISITOR FROM counterscent.com, and cannot.
  localStorage is scoped per origin, so a producer who chose light on the
  catalogue arrives here on their system preference instead. The key name is
  deliberately identical so the relationship is obvious to whoever reads both.
  Syncing them for real needs a cookie on .counterscent.com, which means
  setting a cookie on the cookieless public catalogue. That is a much larger
  decision than a colour scheme is worth.
*/
(function () {
  var KEY = "counterscent-theme";
  var root = document.documentElement;

  function stored() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch (e) {
      // Private mode, or storage blocked. Fall through to the system setting.
      return null;
    }
  }

  function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  root.setAttribute("data-theme", stored() || (systemPrefersDark() ? "dark" : "light"));

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("theme-toggle");
    if (!button) return;

    // The button ships hidden and is revealed here. A control that does
    // nothing without JavaScript should not be on the page at all.
    button.hidden = false;

    function sync() {
      var dark = root.getAttribute("data-theme") === "dark";
      button.textContent = dark ? "Light" : "Dark";
      button.setAttribute("aria-label", dark ? "Switch to the light theme" : "Switch to the dark theme");
    }

    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

      // A theme swap changes a colour on nearly every element, and anything
      // with a colour transition then animates: a 150ms smear rather than a
      // switch. Suppress transitions for the frame the swap happens in, then
      // give them back. Two frames, because the first only guarantees the
      // style has been applied, not painted.
      root.setAttribute("data-theme-switching", "");
      root.setAttribute("data-theme", next);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          root.removeAttribute("data-theme-switching");
        });
      });

      try {
        window.localStorage.setItem(KEY, next);
      } catch (e) {
        // Nothing to do. The choice applies for this page view only.
      }
      sync();
    });

    sync();
  });
})();
