/**
 * Driver registration against the RydeChain API.
 *
 * Flow mirrors what the mobile app does:
 *   1. POST /auth/register        (role: driver)
 *   2. POST /auth/login           -> access token
 *   3. POST /drivers/me/documents/{type}  (multipart, one call per document)
 *   4. POST /drivers/me/documents/submit  (only once all five are present)
 *
 * The access token is kept in memory only — never localStorage — so it dies
 * with the tab rather than sitting around for any injected script to read.
 */

const API_BASE =
  window.RYDECHAIN_API_URL || 'https://rydechain-production.up.railway.app/api/v1';

// Must match REQUIRED_TYPES in backend/app/services/driver_document_service.py
const REQUIRED_DOCS = ['profile', 'license', 'registration', 'insurance', 'background'];
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

function goToStep(n) {
  document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
  $(`step${n}`).classList.add('active');

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
  } catch (e) {
    throw new Error(
      "Couldn't reach the RydeChain API. If this site was just deployed, its " +
        'address still needs to be added to the API\'s allowed origins.',
    );
  }
}

/** Pull a readable message out of FastAPI's error shapes. */
async function errorFrom(response, fallback) {
  let detail;
  try {
    const body = await response.json();
    detail = body.detail;
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

/* ---------------- Step 1: create the account ---------------- */

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
  if (password.length < 8) {
    showAlert(err, 'Your password needs to be at least 8 characters.');
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

    if (!registerRes.ok) {
      throw new Error(
        await errorFrom(registerRes, 'We could not create that account. It may already exist.'),
      );
    }

    // Registration does not return a token, so sign in to get one.
    const loginRes = await apiFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      throw new Error(
        await errorFrom(loginRes, 'Account created, but signing in failed. Try the app instead.'),
      );
    }

    const tokens = await loginRes.json();
    session.token = tokens.access_token;
    session.email = email;
    $('doneEmail').textContent = email;

    goToStep(2);
  } catch (e) {
    showAlert(err, e.message || 'Something went wrong. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create account & continue';
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

    // Mirror the server's limits so people get told before a wasted upload.
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
        headers: { Authorization: `Bearer ${session.token}` },
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
      headers: { Authorization: `Bearer ${session.token}` },
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
