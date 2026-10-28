async function discardInactiveTabs() {
  const data = await chrome.storage.local.get(['isEnabled', 'whitelist', 'discardPinned', 'autoDiscard']);
  
  if (data.isEnabled === false) return 0;
  // If called by alarm, check if autoDiscard is disabled
  if (!data.autoDiscard && arguments.length === 0) return 0;

  const whitelist = data.whitelist || [];
  const discardPinned = data.discardPinned === true;

  const tabs = await chrome.tabs.query({ active: false, discarded: false });
  let count = 0;
  
  for (const tab of tabs) {
    // Safety checks
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) continue;
    if (tab.audible) continue;
    if (tab.pinned && !discardPinned) continue;

    // Whitelist check
    try {
      const url = new URL(tab.url);
      if (whitelist.includes(url.hostname)) continue;
    } catch (e) { continue; }

    try {
      await chrome.tabs.discard(tab.id);
      count++;
    } catch (err) {
      console.error(`Failed to discard tab ${tab.id}:`, err);
    }
  }
  return count;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isEnabled: true, discardCount: 0, autoDiscard: true, whitelist: [] });
  chrome.alarms.create('autoDiscard', { periodInMinutes: 15 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'autoDiscard') {
    const count = await discardInactiveTabs(true); // Pass arg to bypass autoDiscard check
    if (count > 0) {
      const data = await chrome.storage.local.get(['discardCount']);
      await chrome.storage.local.set({ discardCount: (data.discardCount || 0) + count });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "discardNow") {
    discardInactiveTabs().then(count => sendResponse({ count }));
    return true; 
  }
  
  if (request.action === "toggleState") {
    if (request.enabled) {
      chrome.alarms.create('autoDiscard', { periodInMinutes: 15 });
    } else {
      chrome.alarms.clear('autoDiscard');
    }
  }
});