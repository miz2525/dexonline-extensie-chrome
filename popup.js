// popup.js — standalone toolbar search UI.

const MAX_DEFINITIONS = 3;
const SOURCE_PRIORITY = ["DEX '09", "MDA2", "DEX '98"];

const form = document.getElementById("dex-form");
const input = document.getElementById("dex-input");
const body = document.getElementById("dex-body");
const footer = document.getElementById("dex-footer");

function sourceRank(sourceName) {
  const i = SOURCE_PRIORITY.indexOf(sourceName);
  return i === -1 ? SOURCE_PRIORITY.length : i;
}

function sortBySource(definitions) {
  return definitions
    .map((def, idx) => ({ def, idx }))
    .sort((a, b) => {
      const r = sourceRank(a.def.sourceName) - sourceRank(b.def.sourceName);
      return r !== 0 ? r : a.idx - b.idx;
    })
    .map((w) => w.def);
}

function setStatus(text, isError = false) {
  body.replaceChildren();
  footer.replaceChildren();
  const status = document.createElement("div");
  status.className = isError ? "dex-status dex-error" : "dex-status";
  status.textContent = text;
  body.appendChild(status);
}

function render(word, definitions) {
  body.replaceChildren();

  if (!definitions.length) {
    setStatus(`Niciun rezultat pentru „${word}”.`);
  } else {
    for (const def of sortBySource(definitions).slice(0, MAX_DEFINITIONS)) {
      const entry = document.createElement("div");
      entry.className = "dex-entry";

      const badge = document.createElement("span");
      badge.className = "dex-source";
      badge.textContent = def.sourceName || "DEX";

      const rep = document.createElement("div");
      rep.className = "dex-rep";
      // htmlRep is trusted, pre-formatted markup from dexonline.ro.
      rep.innerHTML = def.htmlRep;

      entry.append(badge, rep);
      body.appendChild(entry);
    }
  }

  const link = document.createElement("a");
  link.className = "dex-link";
  link.href = `https://dexonline.ro/definitie/${encodeURIComponent(word)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Vezi pe dexonline.ro →";
  footer.replaceChildren(link);
}

async function lookup(word) {
  setStatus("Se caută…");
  try {
    const res = await fetch(
      `https://dexonline.ro/definitie/${encodeURIComponent(word)}/json`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    render(word, data.definitions || []);
  } catch (err) {
    console.error("[Dicționar DEX]", err);
    setStatus("Eroare la conectarea cu dexonline.ro.", true);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const word = input.value.trim();
  if (word) lookup(word);
});

input.focus();
