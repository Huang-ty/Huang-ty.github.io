/* Minimal front-end filters for the Life & Notes list.
   Category and tag names must not contain spaces (tokens are
   space-separated in the data attributes). */
(function () {
  "use strict";

  var bar = document.getElementById("filter-bar");
  var list = document.getElementById("post-list");
  var empty = document.getElementById("empty-note");
  if (!bar || !list) return;

  // Current filter mode and its value.
  var mode = "all";   // values: "all" | "cat" | "tag"
  var value = "*";

  function matches(item) {
    if (mode === "all") return true;
    var raw = mode === "cat" ? item.getAttribute("data-cats")
                             : item.getAttribute("data-tags");
    if (!raw) return false;
    var tokens = raw.split(/\s+/).filter(Boolean);
    return tokens.indexOf(value) !== -1;
  }

  function apply() {
    var seen = 0;
    var items = list.querySelectorAll(".post-item");
    for (var i = 0; i < items.length; i++) {
      var show = matches(items[i]);
      items[i].hidden = !show;
      if (show) seen++;
    }
    if (empty) empty.hidden = seen !== 0;
  }

  // Filter buttons in the bar.
  var buttons = bar.querySelectorAll(".filter-btn");
  var activeBtn = null;
  function activate(btn) {
    if (activeBtn) activeBtn.classList.remove("is-active");
    activeBtn = btn;
    if (btn) btn.classList.add("is-active");
    apply();
  }
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      mode = "all";
      value = btn.getAttribute("data-filter");
      activate(btn);
    });
  });

  // Inline category / tag links in each item.
  var links = list.querySelectorAll(".meta-link");
  links.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      mode = a.hasAttribute("data-cat") ? "cat" : "tag";
      value = a.getAttribute("data-cat") || a.getAttribute("data-tag");
      // Activate a matching bar button if one exists.
      var target = Array.prototype.find.call(buttons, function (b) {
        return b.getAttribute("data-filter") === value;
      });
      activate(target || null);
    });
  });
})();
