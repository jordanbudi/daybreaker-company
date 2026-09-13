# Coin Log Form → GitHub Sync — Setup

This connects the "Coin Log Submission (Responses)" Google Sheet (fed by your
Google Form) to `coin/coin-log.csv` on GitHub. Every new form submission gets
appended to the CSV automatically, and the live page at
daybreakercompany.com/coin/log.html picks it up — no manual editing, no
Dropbox.

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

## 2. Paste the script into the Sheet

1. Open the **"Coin Log Submission (Responses)"** Google Sheet.
2. Menu bar → **Extensions → Apps Script**. This opens a new tab with a code
   editor.
3. If there's placeholder code in the `Code.gs` file (like
   `function myFunction() {}`), select all of it and delete it.
4. Open `coin/scripts/coin-log-form-sync.gs` from this repo, copy its entire
   contents, and paste it into the empty `Code.gs` editor.
5. Click the **save icon** (or Ctrl+S / Cmd+S). If asked to name the project,
   call it something like **"Coin Log GitHub Sync"**.

## 3. Add your GitHub token as a Script Property

This keeps the token out of the code itself.

1. Still in the Apps Script editor, click the **gear icon (Project Settings)**
   in the left sidebar.
2. Scroll to **Script Properties** → **Add script property**.
3. **Property:** `GITHUB_TOKEN`
   **Value:** paste the token you copied in step 1.
4. Click **Save script properties**.

*(Optional)* If you'd like sync-failure emails sent somewhere other than
your own Google account, add a second property `NOTIFY_EMAIL` with that
address. Otherwise failure emails go to whichever Google account owns this
script.

## 4. Test it before relying on it

1. Back in the left sidebar, open the **file dropdown / function selector**
   at the top of the editor (next to the Run/Debug buttons) and choose
   **`testSyncLastRow`**.
2. Click **Run**.
3. The first time, Google will show an **"Authorization required"** prompt:
   - Click **Continue**
   - Pick your Google account
   - You'll likely see a **"Google hasn't verified this app"** warning —
     that's expected for a private script you wrote yourself. Click
     **Advanced** → **Go to Coin Log GitHub Sync (unsafe)** → **Allow**.
4. Run it again if the authorization prompt interrupted the first attempt.
5. Check the **Execution log** at the bottom — it should say something like
   `Synced serial 030 ... to GitHub`. If it errors, re-check the token and
   the `GITHUB_TOKEN` property spelling.
6. Confirm on GitHub that `coin/coin-log.csv` got a new commit with that row.

## 5. Turn on the real trigger

This makes the sync run automatically every time someone submits the form.

1. In the Apps Script editor's left sidebar, click the **clock icon
   (Triggers)**.
2. Click **+ Add Trigger** (bottom right).
3. Set:
   - **Choose which function to run:** `onFormSubmitSync`
   - **Choose which deployment should run:** `Head`
   - **Select event source:** `From spreadsheet`
   - **Select event type:** `On form submit`
4. Click **Save**. Approve the permissions prompt again if it appears.

That's it. From now on, every new form submission appends a row to
`coin-log.csv` on GitHub within a few seconds, and the coin log page updates
the next time someone loads it.

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
