# Bulk Email Sender

A powerful React + TypeScript web application / Chrome extension for sending personalized bulk emails.

## Tech Stack
- React 19
- TypeScript
- Tailwind CSS
- Vite
- PapaParse (CSV)
- XLSX (Excel)
- Zod (Validation)
- Lucide React (Icons)

## Features
- Upload CSV/Excel contact lists.
- Automatic column mapping (Name, Email, Company, Title).
- Personalize emails with `{{name}}`, `{{company}}`, etc.
- Attach Resume (Required) and Cover Letter (Optional).
- Controlled sending engine (Delay, Pause, Resume).
- Detailed delivery logs.

## Setup
1. `npm install`
2. `npm run dev`

## Chrome Extension
1. `npm run build`
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder.
