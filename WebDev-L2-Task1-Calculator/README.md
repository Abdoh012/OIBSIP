# Calculator

A responsive browser-based calculator built with HTML5, CSS3, and vanilla JavaScript for the Oasis Infobyte Web Development and Designing internship.

**Internship:** Oasis Infobyte — Web Development and Designing  
**Level / Task:** Level 2 — Task 1  
**Author:** Abdelrahman Mohammed Mahmoud  
**Status:** Planned — implementation not started

## Objective

Build a fully functional browser-based calculator capable of performing basic arithmetic operations with a user-friendly button interface.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript

No frameworks, no build step, and no `eval()`.

## Feature Checklist

- [ ] Display screen that shows the current input and result
- [ ] Numeric buttons (0–9) and a decimal point button
- [ ] Operator buttons: addition (+), subtraction (−), multiplication (×), division (÷)
- [ ] Equals (=) button to evaluate the expression
- [ ] Clear (C) button to reset the display
- [ ] Backspace/Delete button to remove the last entered character
- [ ] Prevent division-by-zero: display an error message instead of crashing
- [ ] Operator chaining: allow sequential operations (e.g., 5 + 3 × 2) without requiring a full reset
- [ ] CSS Grid used for button layout alignment
- [ ] Event listeners on all buttons (no inline `onclick` attributes in HTML)

## Planned Structure

```
.
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── constants.js
│   ├── calculator-engine.js
│   └── app.js
├── tests/
│   └── calculator-engine.test.js
├── screenshots/
└── README.md
```

## Planned Behavior

- Two-line display: expression/input above, current value or result below.
- Standard operator precedence: `5 + 3 × 2 = 11`.
- Operators can be chained without a full reset.
- After `=`, an operator continues from the result; a digit starts a new expression.
- Division by zero shows a friendly error message instead of crashing.
- Backspace removes the last character; `C` resets the calculator.
- Duplicate decimals, leading zeros, and floating-point display artifacts are handled.
- No `eval()` or `Function()`; the expression is evaluated by a custom parser.
- Optional keyboard support.

## Planned Verification

- Unit tests for the calculation engine with Node's built-in test runner.
- Browser checks for button input, keyboard input, error handling, and responsive layout.
- Screenshots at desktop and mobile widths.
- Confirm there are no inline `onclick` attributes and no `eval()` calls.

## Demo

- **Live demo:** To be added after deployment.
- **Demo video:** To be added after recording.

## Screenshots

Screenshots will be added after implementation:

- `screenshots/desktop.png`
- `screenshots/mobile.png`
- `screenshots/division-by-zero.png`
- `screenshots/chained-operation.png`

## How to Run

Open `index.html` directly in a browser. No installation or build step is required.

## Author

Abdelrahman Mohammed Mahmoud  
Oasis Infobyte Internship — Web Development and Designing
