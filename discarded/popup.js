document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const masterToggle = document.getElementById('master-toggle');
  const headerStatus = document.getElementById('header-status');
  const statusBadge = document.getElementById('status-badge');
  const discardCountEl = document.getElementById('discard-count');
  const memorySavedEl = document.getElementById('memory-saved');
  const bottomText = document.getElementById('bottom-text');
  const bottomDot = document.getElementById('bottom-dot');
  const discardNowBtn = document.getElementById('discard-now-btn');
  const whitelistBtn = document.getElementById('whitelist-btn');
  const optionsLink = document.getElementById('options-link');
  const themeBtn = document.getElementById('theme-btn');

  // --- Theme Logic ---
  const themeData = await chrome.storage.local.get(['theme']);
  if (themeData.theme === 'light') {
    document.body.classList.add('light-mode');
    themeBtn.textContent = '☀️';
  }

  themeBtn.addEventListener('click', async () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeBtn.textContent = isLight ? '☀️' : '🌙';
    await chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
  });

  // --- Options Link Logic ---
  optionsLink.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // --- Main Extension Logic ---
  const data = await chrome.storage.local.get(['isEnabled', 'discardCount', 'whitelist']);
  const isEnabled = data.isEnabled !== false;
  const discardCount = data.discardCount || 0;
  const whitelist = data.whitelist || [];

  masterToggle.checked = isEnabled;
  updateUI(isEnabled);
  updateStats(discardCount);

  // Check if current tab is whitelisted
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    try {
      const url = new URL(activeTab.url);
      const isWhitelisted = whitelist.includes(url.hostname);

      if (isWhitelisted) {
        whitelistBtn.textContent = "Enable on this tab";
        whitelistBtn.style.color = "var(--accent-green)";
      } else {
        whitelistBtn.textContent = "Disable on this tab";
        whitelistBtn.style.color = "var(--accent-red)";
      }

      whitelistBtn.addEventListener('click', async () => {
        let newWhitelist;
        if (isWhitelisted) {
          newWhitelist = whitelist.filter(item => item !== url.hostname);
        } else {
          newWhitelist = [...whitelist, url.hostname];
        }
        await chrome.storage.local.set({ whitelist: newWhitelist });
        window.close(); // Close popup to refresh state
      });
    } catch (e) {
      // Handle chrome:// or edge:// URLs
      whitelistBtn.textContent = "Cannot modify this tab";
      whitelistBtn.disabled = true;
      whitelistBtn.style.opacity = "0.5";
    }
  }

  masterToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.local.set({ isEnabled: enabled });
    updateUI(enabled);
    chrome.runtime.sendMessage({ action: "toggleState", enabled: enabled });
  });

  discardNowBtn.addEventListener('click', async () => {
    discardNowBtn.textContent = "Discarding...";
    const response = await chrome.runtime.sendMessage({ action: "discardNow" });

    if (response && response.count > 0) {
      const newCount = discardCount + response.count;
      await chrome.storage.local.set({ discardCount: newCount });
      updateStats(newCount);
      discardNowBtn.textContent = `Discarded ${response.count} tabs!`;
    } else {
      discardNowBtn.textContent = "No tabs to discard";
    }
    setTimeout(() => discardNowBtn.textContent = "Discard Inactive Tabs Now", 2000);
  });

    function updateUI(enabled) {
        if (enabled) {
            headerStatus.textContent = "Tabs are being managed";
            headerStatus.className = "status-text";
            statusBadge.textContent = "Active";
            statusBadge.style.color = "var(--accent-green)";
            statusBadge.style.backgroundColor = "rgba(46, 204, 113, 0.15)";
            bottomText.textContent = "Active on all sites";
            bottomDot.style.backgroundColor = "var(--accent-green)";
            discardNowBtn.style.opacity = "1";
            discardNowBtn.style.pointerEvents = "auto";
        } else {
            headerStatus.textContent = "Tabs are paused";
            headerStatus.className = "status-text disabled";
            statusBadge.textContent = "Disabled";
            statusBadge.style.color = "var(--text-muted)";
            statusBadge.style.backgroundColor = "rgba(139, 146, 165, 0.15)";
            bottomText.textContent = "Paused";
            bottomDot.style.backgroundColor = "var(--text-muted)";
            discardNowBtn.style.opacity = "0.5";
            discardNowBtn.style.pointerEvents = "none";
        }
    }

  function updateStats(count) {
    discardCountEl.textContent = count;
    memorySavedEl.textContent = `~${(count * 50)} MB`;
  }
});