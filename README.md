# Dicționar DEX

A lightweight **Manifest V3** Chrome extension that looks up Romanian word definitions from [dexonline.ro](https://dexonline.ro) — without ever leaving the page you're reading.

## Features

- **In-page lookups.** Select a word on any webpage, right-click, and choose **`Caută în DEX: "…"`**. A compact popup opens **fixed in the bottom-right corner of the same page** showing the definitions inline — no new tab, no navigation away.
- **Toolbar search.** Click the extension icon for a standalone popup where you can type any word.
- **Smart source ordering.** Definitions are sorted by dictionary priority: **DEX '09 → MDA2 → DEX '98 →** everything else.
- **Top 3 definitions**, each tagged with a source badge.
- **Quick exit** — close the in-page popup with the **`Esc`** key or the **✕** button.
- Direct **`Vezi pe dexonline.ro →`** link to the full entry.

## Install (unpacked)

1. Clone or download this folder.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select this folder.
5. (Optional) Pin the toolbar icon via the 🧩 puzzle-piece menu.

## Usage

### In-page popup
1. Select a word on any page.
2. Right-click → **`Caută în DEX: "<word>"`**.
3. The definition popup appears in the **bottom-right corner of the current page**.
4. Press **`Esc`** or click **✕** to dismiss it.

### Toolbar popup
1. Click the extension icon.
2. Type a word and press **Caută** (or Enter).

## Data source

Definitions come from the public dexonline.ro JSON endpoint:

```
https://dexonline.ro/definitie/{cuvant}/json
```

No API key is required. An unknown word simply returns no definitions, and the popup shows a "no results" message.

## Project structure

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 manifest, permissions, and icons. |
| `background.js` | Service worker — registers the context menu and forwards the selected word. |
| `content.js` | Fetches the API and injects the in-page popup. |
| `content.css` | Styles for the injected popup. |
| `popup.html` / `popup.js` | Standalone toolbar search UI. |
| `icon*.png` | Extension icons (16/32/48/128). |

## Permissions

- `activeTab`, `contextMenus` — for the right-click lookup.
- Host access to `https://dexonline.ro/*` — to fetch definitions.

## Notes

`htmlRep` markup returned by dexonline.ro (`<b>`, `<i>`, `<abbr>`, …) is injected as-is, since it is trusted, pre-formatted content from the dictionary source.

---

Not affiliated with dexonline.ro. Definitions are © their respective dictionary sources.
