# Lazy Tabs

<img width="347" height="493" alt="Screenshot 2026-10-29 053649" src="https://github.com/user-attachments/assets/6e233cf5-7a68-4388-a1c1-77cb7be2c1a8" />

**Lazy Tabs** is a lightweight Chrome extension that reclaims your system memory by automatically discarding tabs you aren't currently using. It unloads the page content of inactive tabs - freeing up RAM and CPU - while keeping the tab visible in your tab strip so you can click to reload it instantly. Chrome renders tabs fast, so the delay is barely noticeable, but the memory savings are very real. Crucially, it includes a **persistent per-tab disable list** so pages with unsaved work (forms, drafts, dashboards) are never touched - even across browser restarts and session restores.

For the sake of clarity: When the description says it "discards" or "saves memory," it means that the extension:
- Calls `chrome.tabs.discard()` on inactive tabs, which unloads their renderer processes from RAM while keeping the tab entry and its title/favicon in the tab bar.
- Skips tabs you have explicitly protected via the popup, so forms, drafts, and long-running tools never get reloaded out from under you.
- Skips pinned tabs (optionally), audible tabs, and chrome:// pages automatically.
- Runs on a configurable alarm (default every 15 minutes) in the background, plus a manual "Discard Now" button in the popup.

This protects your system's memory without you having to think about it - Chrome's own tab management is conservative, and this extension is not.

So to clarify: the extension doesn't replace Chrome's Memory Saver or close tabs for you. It safely unloads background tabs so the pages you *are* using get the RAM they deserve. That's the key to a responsive browser.

## 💡 Why This Exists
Modern browsers are memory-hungry. Twenty open tabs across a few sites can easily consume several gigabytes of RAM, which slows down the whole system - especially on laptops or machines with limited memory. Chrome has a built-in Memory Saver, but it's often conservative, and it has no concept of "this specific tab has unsaved form data, never touch it."

Lazy Tabs was built to fill that gap: an aggressive, user-controlled memory saver with a hard guarantee that **tabs you mark as protected are never discarded**, no matter what.

Just as individuals can choose which apps run in the foreground and which stay backgrounded on their phones, users should be able to tell their browser: "I'm done with this tab for now - free the RAM, but keep it around."

This tool isn't about closing your work; it's about keeping the tabs you aren't using dormant so the ones you *are* using stay snappy.

---

## 🚀 Features

- **Automatic Tab Discarding**
  Unloads inactive tabs on a timer (default 15 minutes) via `chrome.tabs.discard()`, freeing renderer memory while keeping tabs visible and instantly reloadable.

- **Persistent Per-Tab Protection**
  Click "Disable on this tab" in the popup and that page is protected **forever** - across browser restarts, crashes, and history restores. Protection is keyed on `origin + pathname`, so it survives title changes and tab reordering.

- **Smart Safety Skips**
  Never touches pinned tabs (unless you enable it in options), audible tabs (playing music/video), or internal `chrome://` / `edge://` pages.

- **Manual Discard Button**
  Need RAM *right now*? Hit "Discard Inactive Tabs Now" in the popup to instantly unload everything unprotected.

- **Memory Saved Estimate**
  The popup shows how many tabs have been discarded and a rough estimate of memory reclaimed (~50MB per tab).

- **Light / Dark Mode**
  A theme toggle in the popup, persisted across sessions.

- **Clean Options Page**
  Toggle auto-discard and choose whether pinned tabs should also be discarded.

  <img width="767" height="343" alt="Screenshot 2026-10-29 053719" src="https://github.com/user-attachments/assets/837ecd3d-cfea-4efb-b16d-6caf165a44c6" />

---

## 🧱 Works Best For
Lazy Tabs is designed to complement your existing browser setup, not replace it. It pairs well with:

- **Chrome's Built-in Memory Saver**
  Let Chrome handle its own heuristic discarding; use Lazy Tabs for aggressive, predictable, user-controlled unloading.

- **Tab Session Managers**
  If you hoard 100+ tabs across sessions, Lazy Tabs keeps the inactive ones from dragging your system down.

- **Power Users on Low-RAM Machines**
  Laptops with 8GB or less see the biggest benefit - background tabs stop competing with the apps you're actually using.

These tools handle organization. Lazy Tabs handles memory pressure.

---

## 🛠️ Installation  -  Manual Load Required

**Lazy Tabs is not available on the Chrome Web Store, and it must be installed manually as an unpacked extension.** There is no `.crx`, no store listing, and no installer. You load it directly from the source folder.

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the extension folder.
5. The Lazy Tabs icon will now appear in your toolbar.

Because it's unpacked, Chrome will show a "Developer mode extensions" warning on startup. This is expected and cannot be suppressed without store publication - see the section below for why that tradeoff is intentional.

---

## ❓ Why Manual / Unpacked (Required, Not Optional)

Running unpacked isn't a convenience here - it's a **design requirement**. Publishing to the Chrome Web Store would break core functionality or get the extension removed outright. This section explains exactly why.

### 🚫 1. Avoid Extension Fingerprinting

Chrome Web Store extensions have **permanent, globally known IDs**. Websites can detect these using:

- Requests to `chrome-extension://<ID>/`
- JS fingerprinting and DOM probes
- Known file or behavior signatures

**Unpacked extensions use randomized IDs**, making detection virtually impossible. For a tool whose whole purpose is quietly managing tabs without tipping off websites, a known ID is a liability.

### 🔒 2. Avoid Store Restrictions & Forced Changes

Google's Chrome Web Store policies prohibit or restrict functionality that Lazy Tabs depends on:

- Aggressive tab discarding below Chrome's own thresholds
- Injecting `beforeunload` listeners into tabs to lock them from being discarded
- Background scripts that act on all tabs without explicit per-site user consent

Submitting to the store would mean either stripping these features or waiting for a takedown. Remaining unpacked:

- ✅ Avoids extension takedowns or forced restrictions
- ✅ Retains complete control over behavior and permissions
- ✅ The developer decides when and how the extension is updated

### 📌 3. You Control Updates

There is no auto-update channel. When a new version is released, you pull the repo and click **Reload** on `chrome://extensions/`. This is deliberate - no silent behavior changes, no surprise permission creep. It also means **you must update manually** to receive new features and fixes.

### ⚠️ What This Means in Practice

- The extension will **not** auto-install or auto-update.
- Chrome will show a persistent "developer mode" warning bubble on some versions. This is cosmetic and unavoidable without store publication.
- You are responsible for pulling updates from this repository.
- Reinstalling the extension (removing and re-adding the unpacked folder) clears `chrome.storage.local` - including your protected-tab list.

If any of those tradeoffs are unacceptable, Lazy Tabs is not the right fit. The manual-load model is the cost of the feature set above.

---

## 📁 File Structure

- **icons/**
  - icon48.png
  - icon128.png
- **.js files**
  - background.js
  - popup.js
  - options.js
- **.html files**
  - popup.html
  - options.html
- **Config**
  - manifest.json
  - README.md

---

## ⚙️ Permissions Used

The extension requests the following permissions:
`tabs`, `alarms`, `storage`, `scripting`.

- `tabs`: Needed to query tabs, read their URLs, and call `chrome.tabs.discard()`.
- `alarms`: Needed to run the periodic auto-discard cycle.
- `storage`: For saving toggle states, the protected-tabs list, theme preference, and discard counter.
- `scripting`: Used to inject a lightweight `beforeunload` listener into protected tabs so Chrome won't discard them even if something else tries.

---

## 🔐 Safe and Secure Practices

### ✅ 1. No Remote Code Execution  
- All scripts (`background.js`, `popup.js`, `options.js`) are locally stored and listed in `manifest.json`.  
- No use of `eval()`, `new Function()`, or dynamic script loading from external sources.

### ✅ 2. Minimal and Appropriate Permissions
- `tabs`, `alarms`, and `storage` are used solely for discarding inactive tabs and saving settings.  
- `scripting` is used only to protect user-whitelisted tabs.

### ✅ 3. No Access to Sensitive APIs  
The extension does **not** use or request:  
- `cookies`  
- `webRequest`  
- `history`  
- `identity` or `sessions`

### ✅ 4. Local-Only Storage  
- Settings, protected-tab fingerprints, and stats are saved using `chrome.storage.local`.  
- No data is ever sent externally.  
- Everything is inspectable via DevTools or by clearing extension data.

### ✅ 5. Clean UI Input Handling  
- No user input is parsed or inserted into the DOM unsafely.  
- All UI elements (toggles, buttons) are strictly scoped and simple.

---

### ⚠️ Areas to Note (Safe but Worth Awareness)

- **`chrome.tabs.discard()`**  
  Unloads a tab's renderer. Protected tabs are excluded, and Chrome restores the page when the user clicks back to it.

- **`chrome.scripting.executeScript()` in `background.js`**  
  Used only to inject a harmless `beforeunload` listener into tabs the user has explicitly protected. It does not read page content or communicate with the page.

- **`tabs` permission**  
  The extension reads tab URLs to build fingerprints and skip `chrome://` pages. It does not read page content or inject scripts on unprotected tabs.

---

### ❌ No Known Insecure Patterns

Avoided:  
- `eval()` or `setTimeout('code', ...)`  
- Inline script execution  
- External tracking or analytics  
- Untrusted user input parsing

---

### ✅ Final Verdict

This extension is secure, responsible, and well-designed.  
It follows modern Chrome Extension best practices for:  
- Script isolation  
- Local-only storage  
- Controlled permissions  
- Passive enhancement without violating user trust

---

## 🧪 Use Cases

- Keep 100+ tabs open without your laptop fans spinning up.
- Protect an in-progress Google Docs draft, an online form, or a dashboard you're actively monitoring.
- Free RAM instantly before launching a game or a heavy app.
- Stop background tabs from quietly eating battery on a laptop.
- Test what your browser feels like when inactive tabs aren't holding on to memory.

---

## 💡 Future Enhancements

- Per-domain protection (not just per-tab-URL fingerprint)
- Configurable auto-discard interval in the options page
- Import / export protected-tab list
- ~~Smarter fingerprint matching~~ (Now Included)

---

## 📜 License

Proprietary / All Rights Reserved (No license declared)
- If a project has no license, you cannot legally reuse, copy, modify, or distribute the code. All rights are reserved by default under copyright law.

---

## 🙌 Contributing

Pull requests and issues are welcome! Whether it's improving the discard logic, UI polish, or session-restore resilience, feel free to contribute (Please Note: License will remain the same, Proprietary / All Rights Reserved regardless of your contribution).

---

## 🧊 Final Note

Lazy Tabs is for users who want their browser to be fast, quiet, and honest about resource usage - without losing their place. Install it, protect the tabs that matter, and browse light.
