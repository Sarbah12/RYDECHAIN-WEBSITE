/**
 * Driver registration against the RydeChain API.
 *
 * Endpoints used (see backend/app/api/v1/routes/{auth,drivers}.py):
 *   POST /auth/register                   role: "driver"
 *   POST /auth/login                      -> { access_token, refresh_token }
 *   GET  /drivers/me/documents            -> restore what's already uploaded
 *   POST /drivers/me/documents/{type}     multipart field name: "file"
 *   POST /drivers/me/documents/submit     only once all five are present
 *
 * Limits below deliberately mirror the server so a file is rejected before a
 * wasted upload. They are asserted against the real schemas by the contract
 * check in the repo — if the server changes, update both together.
 *
 * The access token is kept in memory only, never localStorage, so it dies with
 * the tab rather than sitting around for an injected script to read.
 */

const API_BASE =
  window.RYDECHAIN_API_URL || 'https://api.arcaccra.com/api/v1';

// Mirrors REQUIRED_TYPES in backend/app/services/driver_document_service.py
const REQUIRED_DOCS = ['profile', 'license', 'registration', 'insurance', 'background'];
// Mirrors ALLOWED_TYPES / MAX_BYTES in the same module
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
// Mirrors UserCreate/LoginRequest password constraints and _normalize_phone
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const PHONE_MIN_DIGITS = 9;

const session = { token: null, email: null };
const uploaded = new Set();

const $ = (id) => document.getElementById(id);

function showAlert(el, message, kind) {
  el.textContent = message;
  el.className = `alert ${kind || 'err'} show`;
}
function hideAlert(el) {
  el.className = el.className.replace(' show', '');
}

function showCard(id) {
  document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
  $(id).classList.add('active');
}

function goToStep(n) {
  showCard(`step${n}`);
  document.querySelectorAll('#stepper .st').forEach((st) => {
    const step = Number(st.dataset.step);
    st.classList.toggle('active', step === n);
    st.classList.toggle('done', step < n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * fetch that turns a network/CORS failure into something actionable.
 * The API only accepts a fixed origin allowlist (BACKEND_CORS_ORIGINS), so a
 * site served from an origin that isn't on it fails here rather than at status.
 */
async function apiFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error(
      "Couldn't reach the RydeChain API. If this site was just deployed, its " +
        "address still needs to be added to the API's allowed origins.",
    );
  }
}

/** Pull a readable message out of FastAPI's error shapes. */
async function errorFrom(response, fallback) {
  let detail;
  try {
    detail = (await response.json()).detail;
  } catch {
    return fallback;
  }
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    // Pydantic validation errors: [{loc: [...], msg: "..."}]
    return detail.map((d) => d.msg || '').filter(Boolean).join('. ') || fallback;
  }
  return fallback;
}

const authHeader = () => ({ Authorization: `Bearer ${session.token}` });

/* ---------------- Shared: enter the documents step ---------------- */

/**
 * The API already knows which documents exist, so ask rather than assume —
 * a driver returning after a part-finished application keeps their progress.
 */
async function enterDocumentsStep() {
  goToStep(2);
  hideAlert($('status2'));

  try {
    const res = await apiFetch(`${API_BASE}/drivers/me/documents`, { headers: authHeader() });
    if (!res.ok) return; // Non-fatal: fall back to a blank slate.

    const data = await res.json();

    (data.documents || []).forEach((doc) => {
      const card = document.querySelector(`.doc[data-doc="${doc.doc_type}"]`);
      if (!card) return;
      const rejected = doc.status === 'rejected';
      card.className = rejected ? 'doc failed' : 'doc filled';
      card.querySelector('.state').textContent = rejected
        ? `Rejected${doc.review_note ? ` — ${doc.review_note}` : ''} — upload a new one`
        : `Uploaded — ${doc.file_name || 'on file'}`;
      if (rejected) uploaded.delete(doc.doc_type);
      else uploaded.add(doc.doc_type);
    });
    refreshDocCount();

    if (data.verification_status === 'verified') {
      showAlert($('status2'), 'Your account is already verified — you can sign in to the app.', 'ok');
    } else if (data.verification_status === 'pending_review') {
      showAlert($('status2'), 'Your documents are already submitted and under review.', 'ok');
    } else if (data.verification_status === 'rejected') {
      showAlert($('status2'), 'Some documents were rejected. Replace them and submit again.', 'err');
    }
  } catch {
    /* Restoring progress is best-effort; uploading still works. */
  }
}

/* ---------------- Step 1: create the account ---------------- */

$('toSignIn').addEventListener('click', () => showCard('step1b'));
$('toCreate').addEventListener('click', () => showCard('step1'));

$('accountForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const err = $('err1');
  hideAlert(err);

  const firstName = $('firstName').value.trim();
  const lastName = $('lastName').value.trim();
  const email = $('email').value.trim();
  const phone = $('phone').value.trim();
  const password = $('password').value;

  if (!firstName || !email || !password) {
    showAlert(err, 'Please fill in your name, email and password.');
    return;
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    showAlert(err, `Your password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters.`);
    return;
  }
  // The server normalises the phone and rejects anything under 9 digits, so
  // catch it here rather than letting the whole registration 400.
  const digits = phone.replace(/\D/g, '');
  if (phone && digits.length < PHONE_MIN_DIGITS) {
    showAlert(err, `Enter a valid phone number with at least ${PHONE_MIN_DIGITS} digits.`);
    return;
  }

  const btn = $('createBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account…';

  try {
    const registerRes = await apiFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || null,
        role: 'driver',
      }),
    });

    if (registerRes.status === 409) {
      showAlert(
        err,
        'An account with this email already exists. Use "I already have an account" to sign in.',
      );
      return;
    }
    if (!registerRes.ok) {
      throw new Error(await errorFrom(registerRes, 'We could not create that account.'));
    }

    await signIn(email, password);
    $('doneEmail').textContent = email;
    await enterDocumentsStep();
  } catch (e) {
    showAlert(err, e.message || 'Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create account & continue';
  }
});

/* ---------------- Step 1b: sign in ---------------- */

/** Registration returns the user, not a token, so always log in for one. */
async function signIn(email, password) {
  const res = await apiFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await errorFrom(res, 'That email and password did not match an account.'));
  }
  const tokens = await res.json();
  session.token = tokens.access_token;
  session.email = email;
  return tokens;
}

$('signInForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const err = $('errSignIn');
  hideAlert(err);

  const email = $('siEmail').value.trim();
  const password = $('siPassword').value;
  if (!email || !password) {
    showAlert(err, 'Enter your email and password.');
    return;
  }

  const btn = $('signInBtn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    await signIn(email, password);
    $('doneEmail').textContent = email;
    await enterDocumentsStep();
  } catch (e) {
    showAlert(err, e.message || 'Could not sign you in.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign in & continue';
  }
});

/* ---------------- Step 2: upload each document ---------------- */

function refreshDocCount() {
  $('docCount').textContent = `${uploaded.size} of ${REQUIRED_DOCS.length} uploaded`;
  $('submitDocsBtn').disabled = uploaded.size !== REQUIRED_DOCS.length;
}

document.querySelectorAll('.doc').forEach((card) => {
  const input = card.querySelector('input[type="file"]');
  const state = card.querySelector('.state');
  const docType = card.dataset.doc;

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;

    hideAlert($('err2'));

    if (!ALLOWED_MIME.includes(file.type)) {
      card.className = 'doc failed';
      state.textContent = 'Use a JPG, PNG or WebP image';
      uploaded.delete(docType);
      refreshDocCount();
      return;
    }
    if (file.size > MAX_BYTES) {
      card.className = 'doc failed';
      state.textContent = `Too large (${(file.size / 1024 / 1024).toFixed(1)} MB of 5 MB)`;
      uploaded.delete(docType);
      refreshDocCount();
      return;
    }

    card.className = 'doc uploading';
    state.textContent = 'Uploading…';

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await apiFetch(`${API_BASE}/drivers/me/documents/${docType}`, {
        method: 'POST',
        headers: authHeader(),
        body: form,
      });
      if (!res.ok) throw new Error(await errorFrom(res, 'Upload failed. Please try again.'));

      card.className = 'doc filled';
      state.textContent = `Uploaded — ${file.name}`;
      uploaded.add(docType);
    } catch (e) {
      card.className = 'doc failed';
      state.textContent = 'Upload failed — tap to retry';
      uploaded.delete(docType);
      showAlert($('err2'), e.message || 'Upload failed.');
    }
    refreshDocCount();
  });
});

/* ---------------- Step 3: submit for review ---------------- */

$('submitDocsBtn').addEventListener('click', async () => {
  const err = $('err2');
  hideAlert(err);

  const btn = $('submitDocsBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  try {
    const res = await apiFetch(`${API_BASE}/drivers/me/documents/submit`, {
      method: 'POST',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error(await errorFrom(res, 'Could not submit your application.'));

    goToStep(3);
  } catch (e) {
    showAlert(err, e.message || 'Could not submit your application.');
    btn.disabled = false;
    btn.textContent = 'Submit for review';
  }
});

refreshDocCount();
