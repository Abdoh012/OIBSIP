# Login Authentication System

A simple authentication system built for the Oasis Infobyte Web Development and Designing internship.

**Internship:** Oasis Infobyte — Web Development and Designing  
**Level / Task:** Level 2 — Task 4  
**Author:** Abdelrahman Mohammed Mahmoud  
**Status:** Planned — implementation not started

## Objective

Build a simple client-side (or full-stack) authentication system featuring user registration, login validation, and access to a protected page.

## Tech Stack

Choose one approach:

- **A. Front-end only:** HTML, CSS, JavaScript, `localStorage`
- **B. Full-stack:** Node.js + Express + JSON or SQLite store
- **C. Python Flask** with session management

**Proposed approach:** A — front-end only with `localStorage` and a basic SHA-256 hash. The final choice will be confirmed before implementation.

## Feature Checklist

- [ ] Registration page: fields for username/email and password, with a "Register" button
- [ ] Password validation on registration: minimum 8 characters, at least 1 number
- [ ] Duplicate username/email check — display an error if the user already exists
- [ ] Login page: fields for username/email and password, with a "Login" button
- [ ] Incorrect credential handling: display a clear error message (do not reveal which field is wrong)
- [ ] Protected/Dashboard page: only accessible after successful login; redirect to login page if accessed directly without a session
- [ ] Logout button on the dashboard that clears the session/`localStorage` and redirects to login
- [ ] Passwords must not be stored in plain text — use a basic hashing approach (e.g., bcrypt for Node/Python, or SHA-256 for client-side)
- [ ] Basic form validation on both pages (no empty submissions)

## Planned Pages

- `register.html`
- `login.html`
- `dashboard.html`

## Security Note

This is a learning project. Client-side hashing with SHA-256 is used only because the task permits a front-end-only approach; it is not a substitute for production authentication with server-side password hashing, secure sessions, and HTTPS.

## Demo

- **Live demo:** To be added after deployment, if applicable.
- **Demo video:** To be added after recording.

## Screenshots

Screenshots will be added after implementation.

## How to Run

Open `register.html` in a browser once the system is implemented. If a local server is required for the chosen approach, instructions will be added here.

## Author

Abdelrahman Mohammed Mahmoud  
Oasis Infobyte Internship — Web Development and Designing
