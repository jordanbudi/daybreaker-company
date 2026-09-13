/**
 * Daybreaker Company — Coin Log Form → GitHub Sync
 *
 * Bound to the "Coin Log Submission (Responses)" Google Sheet.
 * On every new form submission, appends a row to coin/coin-log.csv on
 * GitHub (jordanbudi/daybreaker-company, branch main) via the GitHub
 * Contents API, so the live log at daybreakercompany.com/coin/log.html
 * updates without anyone touching Dropbox or the CSV by hand.
 *
 * Expected response columns, in order:
 *   A: Timestamp                          (auto, added by Google Forms)
 *   B: What is the coin serial number     (free text, e.g. "31" or "031")
 *   C: Name of Recipient                  (free text, e.g. "MAJ J.B.")
 *   D: Description / Justification        (free text)
 *   E: Date awarded                       (form date field)
 *
 * Setup: see SETUP.md in this same folder.
 */

// ---- Configuration --------------------------------------------------

var GITHUB_OWNER = 'jordanbudi';
var GITHUB_REPO = 'daybreaker-company';
var GITHUB_BRANCH = 'main';
var CSV_PATH = 'coin/coin-log.csv';
var GITHUB_API_BASE = 'https://api.github.com';

// ---- Trigger entry point --------------------------------------------

/**
 * Installable "On form submit" trigger target. Configure this in
 * Triggers (see SETUP.md) — do not run it directly with no event.
 */
function onFormSubmitSync(e) {
  try {
    if (!e || !e.range) {
      throw new Error('onFormSubmitSync was run without a form-submit event. ' +
        'Use testSyncLastRow() to test manually instead.');
    }

    var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    if (!token) {
      throw new Error('GITHUB_TOKEN script property is not set. See SETUP.md.');
    }

    var sheet = e.range.getSheet();
    var row = e.range.getRow();
    var rowValues = sheet.getRange(row, 1, 1, 5).getValues()[0];
    // rowValues: [Timestamp, Serial, Recipient, Justification, Date]

    var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    var serial = padSerial(rowValues[1]);
    var recipient = String(rowValues[2] || '').trim();
    var justification = String(rowValues[3] || '').trim();
    var dateStr = formatDateForCsv(rowValues[4], tz);

    var newLine = [
      csvField(serial),
      csvField(recipient),
      csvField(justification),
      csvField(dateStr)
    ].join(',') + '\r\n';

    syncLineToGitHub(token, newLine, 'Add coin log entry ' + serial + ' via form submission');
    Logger.log('Synced serial ' + serial + ' (' + recipient + ') to GitHub.');
  } catch (err) {
    notifyFailure(err, e);
    throw err; // still surface in Apps Script's own execution log / Triggers > Executions
  }
}

// ---- GitHub sync (with one retry on sha conflict) --------------------

function syncLineToGitHub(token, newLine, commitMessage) {
  var attempts = 0;
  var lastError;

  while (attempts < 2) {
    attempts++;
    try {
      var current = getCurrentFile(token);
      var body = current.text;
      if (body.length > 0 && body.slice(-2) !== '\r\n') {
        body += '\r\n'; // keep the file's existing CRLF line-ending convention
      }
      var newContent = body + newLine;

      var resp = putUpdatedFile(token, newContent, current.sha, commitMessage);
      var code = resp.getResponseCode();

      if (code === 200 || code === 201) {
        return; // success
      }
      if (code === 409 || code === 422) {
        // Someone else committed in between fetch and push — refetch sha and retry once.
        lastError = new Error('GitHub PUT conflict (' + code + '): ' + resp.getContentText());
        continue;
      }
      throw new Error('GitHub PUT failed (' + code + '): ' + resp.getContentText());
    } catch (innerErr) {
      lastError = innerErr;
    }
  }
  throw lastError || new Error('Unknown GitHub sync failure.');
}

function getCurrentFile(token) {
  var url = GITHUB_API_BASE + '/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO +
    '/contents/' + CSV_PATH + '?ref=' + GITHUB_BRANCH;
  var resp = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: githubHeaders(token),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 200) {
    throw new Error('GitHub GET failed (' + resp.getResponseCode() + '): ' + resp.getContentText());
  }
  var json = JSON.parse(resp.getContentText());
  var bytes = Utilities.base64Decode(String(json.content).replace(/\n/g, ''));
  var text = Utilities.newBlob(bytes).getDataAsString('UTF-8');
  return { text: text, sha: json.sha };
}

function putUpdatedFile(token, newText, sha, commitMessage) {
  var url = GITHUB_API_BASE + '/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + CSV_PATH;
  var payload = {
    message: commitMessage,
    content: Utilities.base64Encode(newText, Utilities.Charset.UTF_8),
    sha: sha,
    branch: GITHUB_BRANCH
  };
  return UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: 'application/json',
    headers: githubHeaders(token),
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

function githubHeaders(token) {
  return {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

// ---- Formatting helpers ------------------------------------------------

/** "31" -> "031"; "031" -> "031"; "1000" -> "1000"; non-numeric left as-is. */
function padSerial(value) {
  var s = String(value == null ? '' : value).trim();
  if (/^\d+$/.test(s)) {
    var padded = String(parseInt(s, 10));
    while (padded.length < 3) padded = '0' + padded;
    return padded;
  }
  return s;
}

/** Matches the existing CSV convention: M/D/YYYY, no leading zeros. */
function formatDateForCsv(value, timeZone) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, timeZone, 'M/d/yyyy');
  }
  var s = String(value == null ? '' : value).trim();
  if (!s) return 'TBD';
  var parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, timeZone, 'M/d/yyyy');
  }
  return s; // e.g. someone typed "TBD"
}

/** Quote a field if it contains a comma, quote, or newline; double up internal quotes. */
function csvField(value) {
  var s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ---- Failure notification -----------------------------------------------

function notifyFailure(err, e) {
  try {
    var email = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL') ||
      Session.getEffectiveUser().getEmail();
    if (!email) return;
    var where = (e && e.range) ? e.range.getA1Notation() : 'unknown row';
    MailApp.sendEmail(
      email,
      'Coin Log GitHub sync failed',
      'A new coin log form submission (' + where + ') was saved in the Sheet, ' +
      'but syncing it to coin-log.csv on GitHub failed:\n\n' + err + '\n\n' +
      'The submission is safe in the Sheet — nothing was lost. ' +
      'You may need to add it to coin-log.csv by hand, or fix the sync and re-run it.'
    );
  } catch (mailErr) {
    Logger.log('Also failed to send the failure notification email: ' + mailErr);
  }
}

// ---- Manual testing helpers (run these from the Apps Script editor) -----

/**
 * Run this (no arguments needed) from the editor's Run button to test the
 * sync against the most recent row already in the sheet, without having
 * to submit a real form response.
 */
function testSyncLastRow() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error('No response rows found below the header.');
  }
  runManualSyncForRow(lastRow);
}

/** Simulates a form-submit event for a specific row number and runs the sync. */
function runManualSyncForRow(rowNumber) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var fakeEvent = { range: sheet.getRange(rowNumber, 1, 1, 5) };
  onFormSubmitSync(fakeEvent);
}
