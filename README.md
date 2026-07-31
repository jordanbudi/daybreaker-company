# Daybreaker Company — Commander's Coin

Interactive, mobile-first site explaining the history and design of the Daybreaker Company (D/425 CA BN) Commander's Coin. Built for QR-code scans: visitors land on their phone, pick a side of the coin, and tap gold markers to explore each detail — with read-aloud audio.

**Live site (once deployed):** https://jordanbudi.github.io/daybreaker-company/

## Deploy to GitHub Pages

```bash
git clone https://github.com/jordanbudi/daybreaker-company.git
cd daybreaker-company
# copy index.html, README.md, and the assets/ folder into this directory
git add .
git commit -m "Launch Daybreaker Company coin site"
git push origin main
```

Then on github.com: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.** The site goes live at the URL above within a couple of minutes.

## QR codes

Point QR codes at:
- `https://jordanbudi.github.io/daybreaker-company/` — landing page
- `https://jordanbudi.github.io/daybreaker-company/#front` — straight to the front
- `https://jordanbudi.github.io/daybreaker-company/#back` — straight to the back

## v2: ElevenLabs audio

Audio currently uses the browser's built-in text-to-speech. To upgrade:

1. Generate one MP3 per detail and place them in `assets/audio/` (e.g. `front-01.mp3` … `front-15.mp3`, `back-01.mp3` … `back-10.mp3`).
2. In `index.html`, set each spot's `audio` field, e.g. `audio:"assets/audio/front-01.mp3"`.

The player automatically prefers the file over TTS — no other changes needed.

## Editing content

All text, hotspot positions (`x`/`y` are percentages of the coin image), and titles live in the `COIN_DATA` object near the top of the `<script>` in `index.html`.
