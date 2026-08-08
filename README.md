# Daybreaker Company — Commander's Coin

Interactive, mobile-first site explaining the history and design of the Daybreaker Company (D/425 CA BN) Commander's Coin. Built for QR-code scans: visitors land on their phone, pick a side of the coin, and tap gold markers to explore each detail — with read-aloud audio.

**Live site (once deployed):** https://jordanbudi.github.io/daybreaker-company/
or via https://daybreakercompany.com/coin/

## Deploy to GitHub Pages

## Future updates
1. Make the 'The history and meaning behind the Commander's Coin' text more promintent
2. Add a button, 'Would you like to transfer into Daybreaker Company or join the Army as a Civil Affairs Soldier?'. A popup with two buttons: transfer to D/425 will generate an eamil or contact card to myself and 1SG; and join Army Civil Affairs to SFC Marques or local recruiting BN.
3. Update, "Learn more about Army Civil Affairs and the US Army Reserve" to "Learn more about Army Civil Affairs and the Civil Affairs Units in the US Army Reserve"
4. There should some link to: https://www.usar.army.mil/Commands/Functional/USACAPOC/USACAPOC-Resources/ and more specifically thhe info page https://www.usar.army.mil/Portals/98/Documents/Commands/USACAPOC/1Pager_CivilAffairs.pdf?ver=xagNb7SamIykuLovlRkWFg%3d%3d
5. There's a map of CA units...maybe there's something cool that can be done there. 

## Updating the coin award log

`log.html` shows a searchable table of every coin awarded, populated from **`coin-log.csv`**. To update it, edit `coin-log.csv` (directly on github.com or locally and push). Keep the header row:

```csv
Serial,Recipient,Award Justification,Date Awarded
001,SGT Jane Doe,"Led the battalion FTX planning cell, exceeding every standard",2026-05-16
```

Tips: wrap any field containing a comma in double quotes. You can maintain the log in Excel/Google Sheets and export as CSV (File → Save As / Download → CSV) — replace the file, keeping the name `coin-log.csv`. The table sorts newest serial first, and the search box filters across all columns.

## Editing content

All text, hotspot positions (`x`/`y` are percentages of the coin image), and titles live in the `COIN_DATA` object near the top of the `<script>` in `index.html`.
