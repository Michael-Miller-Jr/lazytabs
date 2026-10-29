// Generate a consistent ID based on the URL, ignoring dynamic parts
function getFingerprint(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        // Remove query parameters and hashes for a cleaner match, but keep the core path
        return parsed.origin + parsed.pathname;
    } catch (e) {
        return url;
    }
}

// Keep tabs alive by preventing the discard
async function protectTab(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // This script runs inside the page. 
                // It prevents the browser from discarding the tab if the extension accidentally tries to.
                window.addEventListener('beforeunload', (e) => {
                    // Empty event listener keeps the tab "active" in Chrome's eyes
                });
            }
        });
    } catch (e) {
        // Ignore errors on chrome:// pages
    }
}

async function discardInactiveTabs(isManual = false) {
    const data = await chrome.storage.local.get(['isEnabled', 'disabledTabs', 'discardPinned', 'autoDiscard']);

    if (data.isEnabled === false) return 0;
    if (!isManual && data.autoDiscard === false) return 0;

    const disabledTabs = data.disabledTabs || [];
    const discardPinned = data.discardPinned === true;

    const tabs = await chrome.tabs.query({ active: false, discarded: false });
    let count = 0;

    for (const tab of tabs) {
        // Safety checks
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) continue;
        if (tab.audible) continue;
        if (tab.pinned && !discardPinned) continue;

        // Check if the URL fingerprint is in our disabled list
        const fingerprint = getFingerprint(tab.url);
        if (disabledTabs.includes(fingerprint)) {
            continue; // It's protected, skip it
        }

        try {
            await chrome.tabs.discard(tab.id);
            count++;
        } catch (err) {
            console.error(`Failed to discard tab ${tab.id}:`, err);
        }
    }
    return count;
}

// Listen for tabs loading or updating to protect them immediately
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const data = await chrome.storage.local.get(['disabledTabs']);
        const disabledTabs = data.disabledTabs || [];
        const fingerprint = getFingerprint(tab.url);

        if (disabledTabs.includes(fingerprint)) {
            protectTab(tabId);
        }
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ isEnabled: true, discardCount: 0, autoDiscard: true, disabledTabs: [] });
    chrome.alarms.create('autoDiscard', { periodInMinutes: 15 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'autoDiscard') {
        const count = await discardInactiveTabs(false);
        if (count > 0) {
            const data = await chrome.storage.local.get(['discardCount']);
            await chrome.storage.local.set({ discardCount: (data.discardCount || 0) + count });
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "discardNow") {
        discardInactiveTabs(true).then(count => sendResponse({ count }));
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