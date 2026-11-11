// Set the copyright year dynamically
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// Global Theme Logic
(async () => {
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;

    // Load saved theme
    const data = await chrome.storage.local.get(['theme']);
    if (data.theme === 'light') {
        document.body.classList.add('light-mode');
        themeBtn.textContent = '☀️';
    }

    // Single click listener
    themeBtn.addEventListener('click', async () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeBtn.textContent = isLight ? '☀️' : '🌙';
        await chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
    });
})();