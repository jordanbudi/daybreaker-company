# Coin Log Form → GitHub Sync — Setup

This connects the "Coin Log Submission (Responses)" Google Sheet (fed by your
Google Form) to `coin/coin-log.csv` on GitHub. Every new form submission gets
appended to the CSV automatically, and the live page at
daybreakercompany.com/coin/log.html picks it up — no manual editing, no
Dropbox.

This is set up as a **standalone Apps Script project** at script.google.com
rather than one pasted inside the Sheet itself — script.google.com has a much
simpler, less nested UI, which matters if you're doing this from a phone.
You never need to open the Sheet's Extensions menu or the separate Triggers
page at all.

Do these steps once. It should take about 10 minutes.

## 1. Create a GitHub access token

This is a password-like key that lets the script write to just this one
repository — nothing else on your GitHub account.

1. Go to **https://github.com/settings/personal-access-tokens/new**
2. **Token name:** `Coin Log Form Sync` (or anything you'll recognize later)
3. **Expiration:** pick whatever you're comfortable with (90 days is fine —
   you'll just need to repeat this step and update the token when it expires)
4. **Resource owner:** `jordanbudi`
5. **Repository access:** choose **"Only select repositories"** → pick
   **`daybreaker-company`**
6. Scroll to **Permissions → Repository permissions** → find **Contents** →
   set it to **Read and write**. Leave everything else as "No access".
7. Click **Generate token**.
8. **Copy the token now** — GitHub only shows it once. Paste it somewhere
   temporary (a note) until step 3 below.

## 2. Create the standalone script

1. Go to **script.google.com**.
2. Tap **New project**.
3. You'll land in a code editor with a placeholder `Code.gs` file. Select all
   the placeholder code and delete it.
4. Open `coin/scripts/coin-log-form-sync.gs` from this repo, copy its entire
   contents, and paste it into the empty editor.
5. Tap the **project name** at the top left (probably "Untitled project")
   and rename it to something like **"Coin Log GitHub Sync"**.
6. Save (the disk icon, or Ctrl+S / Cmd+S).

The script already knows which Sheet to talk to — it's hardcoded by ID at
the top of the file (`SHEET_ID`), so there's no need to open the Sheet at
all during setup.

## 3. Add your GitHub token as a Script Property

This keeps the token out of the code itself.

1. In the script.google.com editor, tap the **gear icon (Project Settings)**
   in the left sidebar.
2. Scroll to **Script Properties** → **Add script property**.
3. **Property:** `GITHUB_TOKEN`
   **Value:** paste the token you copied in step 1.
4. Tap **Save script properties**.

*(Optional)* If you'd like sync-failure emails sent somewhere other than
your own Google account, add a second property `NOTIFY_EMAIL` with that
address. Otherwise failure emails go to whichever Google account owns this
script.

## 4. Test it before relying on it

1. Back in the editor, find the **function dropdown** near the Run button
   at the top (it may just say "Select function"). Choose **`testSyncLastRow`**.
2. Tap **Run**.
3. The first time, Google will show an **"Authorization required"** prompt:
   - Tap **Continue**
   - Pick your Google account
   - You'll likely see a **"Google hasn't verified this app"** warning —
     that's expected for a private script you wrote yourself. Tap
     **Advanced** → **Go to Coin Log GitHub Sync (unsafe)** → **Allow**.
4. Run it again if the authorization prompt interrupted the first attempt.
5. Check the **Execution log** at the bottom — it should say something like
   `Synced serial 030 ... to GitHub`. If it errors, re-check the token and
   the `GITHUB_TOKEN` property spelling.
6. Confirm on GitHub that `coin/coin-log.csv` got a new commit with that row.

## 5. Turn on the real trigger — no Triggers page needed

Normally this step means visiting Apps Script's separate Triggers page and
filling out a form. Instead, this script can create that trigger for itself:

1. In the function dropdown, choose **`installTrigger`**.
2. Tap **Run**.
3. Approve the permissions prompt again if it appears (same as step 4).
4. Check the Execution log for **"Installed the 'On form submit' trigger..."**

That's it — the trigger now exists and will fire automatically every time
someone submits the form. `installTrigger` is safe to run again later (e.g.
if you're not sure it worked) — it always clears out any previous copy of
the trigger first, so re-running it never creates duplicates.

From now on, every new form submission appends a row to `coin-log.csv` on
GitHub within a few seconds, and the coin log page updates the next time
someone loads it.

## If something goes wrong

- A failed sync **never loses data** — the submission is always safely in the
  Google Sheet regardless of whether GitHub sync succeeds. Worst case, you
  (or I) add that row to the CSV by hand later.
- You (or whoever owns the script / is set as `NOTIFY_EMAIL`) will get an
  email if a sync fails.
- Common causes of failure: the GitHub token expired or was revoked, the
  `GITHUB_TOKEN` script property has a typo, or someone renamed/moved
  `coin/coin-log.csv` in the repo.
- To fix a token problem: generate a new token (step 1) and update the
  `GITHUB_TOKEN` script property (step 3) — no need to touch the trigger or
  the script code.
- If you ever need to confirm the trigger exists, run `installTrigger` again
  — it's idempotent and will just report that it (re)installed it.
