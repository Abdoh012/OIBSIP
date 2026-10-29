const USERS_KEY = 'oibsip-private-terminal-users-v1';
const SESSION_KEY = 'oibsip-private-terminal-session-v1';
const FLASH_KEY = 'oibsip-private-terminal-flash-v1';
const encoder = new TextEncoder();
const buttonMarkup = new WeakMap();

function safeRead(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in restrictive browser settings.
  }
}

function getUsers() {
  try {
    const raw = safeRead(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(users)) return [];

    return users.filter((user) => (
      user
      && typeof user.id === 'string'
      && typeof user.username === 'string'
      && typeof user.normalizedUsername === 'string'
      && typeof user.email === 'string'
      && typeof user.normalizedEmail === 'string'
      && typeof user.passwordHash === 'string'
      && typeof user.passwordSalt === 'string'
    ));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  return safeWrite(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    const raw = safeRead(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (!session || typeof session.userId !== 'string') return null;
    return session;
  } catch {
    return null;
  }
}

function getActiveUser() {
  const session = getSession();
  if (!session) return null;

  const user = getUsers().find((candidate) => candidate.id === session.userId) || null;
  if (!user) safeRemove(SESSION_KEY);
  return user;
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt() {
  if (!window.crypto?.getRandomValues) throw new Error('Secure browser storage is unavailable.');
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) throw new Error('This browser needs a secure context for password hashing. Use localhost or HTTPS.');
  const data = encoder.encode(`${salt}:${password}`);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(digest));
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPassword(value) {
  return value.length >= 8 && /\d/.test(value);
}

function setFieldError(inputId, message = '') {
  const input = document.querySelector(`#${inputId}`);
  const error = document.querySelector(`[data-error-for="${inputId}"]`);
  if (!input || !error) return;

  input.setAttribute('aria-invalid', String(Boolean(message)));
  error.textContent = message;
}

function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach((element) => { element.textContent = ''; });
  form.querySelectorAll('input').forEach((input) => input.setAttribute('aria-invalid', 'false'));
}

function setFeedback(element, message = '', type = 'error') {
  if (!element) return;
  element.hidden = !message;
  element.textContent = message;
  element.dataset.state = type;
}

function setButtonBusy(button, isBusy, busyLabel) {
  if (!button) return;

  if (isBusy) {
    if (!buttonMarkup.has(button)) buttonMarkup.set(button, button.innerHTML);
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = busyLabel;
    return;
  }

  button.disabled = false;
  button.removeAttribute('aria-busy');
  const markup = buttonMarkup.get(button);
  if (markup) {
    button.innerHTML = markup;
    buttonMarkup.delete(button);
  }
}

function togglePasswordVisibility(button) {
  const inputId = button.dataset.passwordToggle;
  const input = document.querySelector(`#${inputId}`);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(!isPassword));
  button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');

  const label = button.querySelector('.password-toggle__label');
  if (label) label.textContent = isPassword ? 'Hide' : 'Show';

  input.focus();
}

function initializePasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach((button) => {
    button.addEventListener('click', () => togglePasswordVisibility(button));
  });
}

function redirect(path) {
  window.location.replace(path);
}

function setFlash(message) {
  safeWrite(FLASH_KEY, message);
}

function consumeFlash() {
  const message = safeRead(FLASH_KEY);
  safeRemove(FLASH_KEY);
  return message;
}

function initializeRegisterPage() {
  if (getActiveUser()) {
    redirect('./dashboard.html');
    return;
  }

  const form = document.querySelector('#register-form');
  const feedback = document.querySelector('#register-feedback');
  const submit = form?.querySelector('button[type="submit"]');
  if (!form || !submit) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    setFeedback(feedback);

    const usernameInput = form.elements.username;
    const emailInput = form.elements.email;
    const passwordInput = form.elements.password;
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let hasError = false;

    if (username.length < 3) {
      setFieldError('register-username', 'Choose a username with at least 3 characters.');
      hasError = true;
    }
    if (!isValidEmail(email)) {
      setFieldError('register-email', 'Enter a valid email address.');
      hasError = true;
    }
    if (!isValidPassword(password)) {
      setFieldError('register-password', 'Use at least 8 characters and include at least 1 number.');
      hasError = true;
    }
    if (hasError) {
      setFeedback(feedback, 'Please review the highlighted fields.');
      return;
    }

    const normalizedUsername = normalize(username);
    const normalizedEmail = normalize(email);
    const users = getUsers();
    const duplicate = users.some((user) => (
      user.normalizedUsername === normalizedUsername || user.normalizedEmail === normalizedEmail
    ));

    if (duplicate) {
      setFeedback(feedback, 'An account with that username or email already exists.');
      return;
    }

    try {
      setButtonBusy(submit, true, 'Creating account…');
      const passwordSalt = createSalt();
      const passwordHash = await hashPassword(password, passwordSalt);
      const record = {
        id: createId(),
        username,
        normalizedUsername,
        email,
        normalizedEmail,
        passwordHash,
        passwordSalt,
        createdAt: new Date().toISOString(),
      };

      if (!saveUsers([...users, record])) throw new Error('Unable to save the account locally.');
      form.reset();
      setFlash('Account created. You can sign in now.');
      redirect('./login.html');
    } catch (error) {
      setFeedback(feedback, error.message || 'We could not create your account. Please try again.');
      setButtonBusy(submit, false);
    }
  });

  initializePasswordToggles();
}

function initializeLoginPage() {
  if (getActiveUser()) {
    redirect('./dashboard.html');
    return;
  }

  const form = document.querySelector('#login-form');
  const feedback = document.querySelector('#login-feedback');
  const submit = form?.querySelector('button[type="submit"]');
  if (!form || !submit) return;

  const flash = consumeFlash();
  if (flash) setFeedback(feedback, flash, 'success');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    setFeedback(feedback);

    const credentialInput = form.elements.credential;
    const passwordInput = form.elements.password;
    const credential = credentialInput.value.trim();
    const password = passwordInput.value;
    let hasError = false;

    if (!credential) {
      setFieldError('login-credential', 'Enter your username or email.');
      hasError = true;
    }
    if (!password) {
      setFieldError('login-password', 'Enter your password.');
      hasError = true;
    }
    if (hasError) return;

    try {
      setButtonBusy(submit, true, 'Checking details…');
      const normalizedCredential = normalize(credential);
      const user = getUsers().find((candidate) => (
        candidate.normalizedUsername === normalizedCredential || candidate.normalizedEmail === normalizedCredential
      ));
      const expectedHash = user ? await hashPassword(password, user.passwordSalt) : null;

      if (!user || expectedHash !== user.passwordHash) {
        setFeedback(feedback, "We couldn't sign you in with those details.");
        setButtonBusy(submit, false);
        return;
      }

      const session = { userId: user.id, createdAt: new Date().toISOString() };
      if (!safeWrite(SESSION_KEY, JSON.stringify(session))) throw new Error('Unable to start a local session.');
      form.reset();
      redirect('./dashboard.html');
    } catch (error) {
      setFeedback(feedback, error.message || "We couldn't sign you in with those details.");
      setButtonBusy(submit, false);
    }
  });

  initializePasswordToggles();
}

function initializeDashboardPage() {
  const user = getActiveUser();
  if (!user) {
    redirect('./login.html');
    return;
  }

  document.querySelectorAll('[data-dashboard-username]').forEach((element) => { element.textContent = user.username; });
  document.querySelectorAll('[data-dashboard-email]').forEach((element) => { element.textContent = user.email; });
  document.querySelectorAll('[data-dashboard-initial]').forEach((element) => { element.textContent = user.username.charAt(0).toUpperCase(); });

  const content = document.querySelector('#dashboard-content');
  const check = document.querySelector('#session-check');
  content?.removeAttribute('hidden');
  check?.setAttribute('hidden', '');

  document.querySelector('#logout-button')?.addEventListener('click', () => {
    safeRemove(SESSION_KEY);
    setFlash('You have been logged out.');
    redirect('./login.html');
  });
}

const page = document.body.dataset.page;
if (page === 'register') initializeRegisterPage();
if (page === 'login') initializeLoginPage();
if (page === 'dashboard') initializeDashboardPage();
