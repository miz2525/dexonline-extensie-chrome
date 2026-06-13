// content.js — injects the in-page DEX popup and handles lookups.
// Listens for DEX_LOOKUP messages from the background service worker.

(() => {
  // Guard against double-injection if the script is evaluated more than once.
  if (window.__dexPopupInjected) return;
  window.__dexPopupInjected = true;

  const POPUP_ID = "dex-popup-root";
  const MAX_DEFINITIONS = 3;

  // Lower number = higher priority. Anything unlisted falls to the bottom,
  // keeping its original (relevance) order among the rest.
  const SOURCE_PRIORITY = ["DEX '09", "MDA2", "DEX '98"];

  function sourceRank(sourceName) {
    const i = SOURCE_PRIORITY.indexOf(sourceName);
    return i === -1 ? SOURCE_PRIORITY.length : i;
  }

  function sortBySource(definitions) {
    // Stable sort: definitions keep their relative order within the same source.
    return definitions
      .map((def, idx) => ({ def, idx }))
      .sort((a, b) => {
        const r = sourceRank(a.def.sourceName) - sourceRank(b.def.sourceName);
        return r !== 0 ? r : a.idx - b.idx;
      })
      .map((w) => w.def);
  }

  function removePopup() {
    document.getElementById(POPUP_ID)?.remove();
    document.removeEventListener("keydown", onKeydown, true);
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      removePopup();
    }
  }

  function buildShell(word) {
    removePopup();

    const root = document.createElement("div");
    root.id = POPUP_ID;
    root.innerHTML = `
      <div class="dex-header">
        <span class="dex-title"></span>
        <button class="dex-close" type="button" aria-label="Închide" title="Închide (Esc)">✕</button>
      </div>
      <div class="dex-body"><div class="dex-status">Se caută…</div></div>
      <div class="dex-footer"></div>
    `;
    root.querySelector(".dex-title").textContent = word;
    root.querySelector(".dex-close").addEventListener("click", removePopup);

    document.body.appendChild(root);
    document.addEventListener("keydown", onKeydown, true);
    return root;
  }

  function renderResults(root, word, definitions) {
    const body = root.querySelector(".dex-body");
    const footer = root.querySelector(".dex-footer");
    body.replaceChildren();

    if (!definitions.length) {
      const empty = document.createElement("div");
      empty.className = "dex-status";
      empty.textContent = `Niciun rezultat pentru „${word}”.`;
      body.appendChild(empty);
    } else {
      for (const def of sortBySource(definitions).slice(0, MAX_DEFINITIONS)) {
        const entry = document.createElement("div");
        entry.className = "dex-entry";

        const badge = document.createElement("span");
        badge.className = "dex-source";
        badge.textContent = def.sourceName || "DEX";

        const rep = document.createElement("div");
        rep.className = "dex-rep";
        // htmlRep is pre-formatted, trusted markup from dexonline.ro.
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

  function renderError(root) {
    const body = root.querySelector(".dex-body");
    const status = document.createElement("div");
    status.className = "dex-status dex-error";
    status.textContent = "Eroare la conectarea cu dexonline.ro.";
    body.replaceChildren(status);
  }

  async function lookup(word) {
    const root = buildShell(word);
    try {
      const res = await fetch(
        `https://dexonline.ro/definitie/${encodeURIComponent(word)}/json`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderResults(root, word, data.definitions || []);
    } catch (err) {
      console.error("[Dicționar DEX]", err);
      renderError(root);
    }
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "DEX_LOOKUP" && msg.word) {
      lookup(msg.word);
    }
  });
})();
