# Login Authentication System — Research Notes

## Implementation facts used

- `crypto.subtle.digest('SHA-256', data)` produces an `ArrayBuffer` digest. The app encodes the password with `TextEncoder`, hashes it with SHA-256, and serializes the result as hex before saving the credential record.
- `localStorage` persists key/value data for the same origin, so it can hold demo user records and a separate demo session record across refreshes.
- Production session management should be server-backed and use a session identifier/cookie; this project uses client-side localStorage only because Task 4 explicitly allows a front-end-only approach.

## Security scope

This is an internship demonstration, not production authentication. It intentionally stores only `passwordHash`, never a plain-text password. A production system should use HTTPS, a server-side identity store, password hashing designed for password storage such as bcrypt/Argon2 with per-password salts, rate limiting, secure HttpOnly cookies, CSRF protections where applicable, and server-side session validation.

## Sources

[1]: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest "SubtleCrypto digest method - MDN Web Docs"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage "Window localStorage property - MDN Web Docs"
[3]: https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Session_management "Session management - MDN Web Docs"
