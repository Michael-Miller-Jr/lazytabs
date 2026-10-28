document.addEventListener('DOMContentLoaded', async () => {
  // Load theme
  const themeData = await chrome.storage.local.get(['theme']);
  if (themeData.theme === 'light') document.body.classList.add('light-mode');

  // Load settings
  const settings = await chrome.storage.local.get(['autoDiscard', 'discardPinned']);
  
  const autoDiscardToggle = document.getElementById('auto-discard-toggle');
  const pinnedToggle = document.getElementById('pinned-toggle');

  autoDiscardToggle.checked = settings.autoDiscard !== false;
  pinnedToggle.checked = settings.discardPinned === true;

  autoDiscardToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoDiscard: e.target.checked });
  });

  pinnedToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ discardPinned: e.target.checked });
  });
});