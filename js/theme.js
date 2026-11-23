const STORAGE_KEY = "ttt-theme";
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");

function apply(theme) {
  root.setAttribute("data-theme", theme);
  if (toggle) toggle.setAttribute("aria-checked", String(theme === "dark"));
}

function save(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    /* storage unavailable; choice lasts for this session only */
  }
}

apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

if (toggle) {
  toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next);
    save(next);
  });
}

// Follow OS changes only while the user has no saved choice.
const mq = window.matchMedia("(prefers-color-scheme: dark)");
mq.addEventListener("change", (e) => {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (err) {}
  if (!saved) apply(e.matches ? "dark" : "light");
});
