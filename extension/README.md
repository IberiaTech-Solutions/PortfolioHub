# TalentAgent Chrome Extension

AI-powered job fit checker for LinkedIn, Indeed, and Glassdoor.

## Features

- **Popup**: Click the extension icon on any job page → get your AI fit score
- **Content Script**: Injects a "Check Fit — TalentAgent" button next to the Apply button on supported job boards
- **Supported Sites**: LinkedIn Jobs, Indeed, Glassdoor

## Installation (Development)

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `extension/` directory from this repo
5. Navigate to a LinkedIn/Indeed/Glassdoor job page
6. Click the TalentAgent icon or the injected "Check Fit" button

## Setup

1. Add icon files (16x16, 48x48, 128x128 PNG) to the `icons/` directory
2. Update `API_BASE` in `popup.js` to your TalentAgent deployment URL
3. Sign in to TalentAgent web app first — the extension uses your stored portfolio data

## Publishing

1. Create a developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Zip the `extension/` directory
3. Upload to Chrome Web Store
4. Submit for review (takes 1-3 business days)

## How It Works

1. Content script detects job pages and injects a "Check Fit" button
2. Popup extracts job description text from the page DOM
3. Sends to TalentAgent `/api/fitAssessment` API
4. Displays score, verdict, strengths, and gaps in the popup
