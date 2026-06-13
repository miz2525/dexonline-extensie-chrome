// background.js — service worker (MV3)
// Registers the context menu and forwards the selected word to the content script.

const MENU_ID = "dex-lookup";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Caută în DEX: "%s"',
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;

  const word = (info.selectionText || "").trim();
  if (!word) return;

  chrome.tabs.sendMessage(tab.id, { type: "DEX_LOOKUP", word }, () => {
    // Swallow "Receiving end does not exist" on pages where the content
    // script can't run (chrome://, the Web Store, PDFs, etc.).
    void chrome.runtime.lastError;
  });
});
