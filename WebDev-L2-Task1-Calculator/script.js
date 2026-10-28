const expressionElement = document.querySelector("#expression");
const resultElement = document.querySelector("#result");
const displayElement = document.querySelector(".display");
const keys = document.querySelectorAll(".key");

let expression = "";
let lastResult = null;
let hasCalculated = false;
let errorMessage = "";

const operatorPattern = /[+\-*/]/;
const isOperator = (character) => operatorPattern.test(character);

function prettyExpression(value) {
  return value.replaceAll("*", "×").replaceAll("/", "÷").replaceAll("-", "−");
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function currentNumberSegment() {
  const parts = expression.split(operatorPattern);
  return parts.at(-1) || "";
}

function updateDisplay() {
  displayElement.classList.toggle("is-error", Boolean(errorMessage));
  expressionElement.textContent = errorMessage
    ? "Calculation stopped"
    : prettyExpression(expression) || "Ready for your next calculation";

  if (errorMessage) {
    resultElement.textContent = errorMessage;
    return;
  }

  if (hasCalculated && lastResult !== null) {
    resultElement.textContent = formatNumber(lastResult);
    return;
  }

  const current = currentNumberSegment();
  const displayValue =
    current && current !== "-"
      ? current
      : lastResult === null
        ? "0"
        : formatNumber(lastResult);
  resultElement.textContent = displayValue.replace("-", "−");
}

function clearError() {
  errorMessage = "";
}

function resetForNewInput() {
  if (errorMessage) {
    expression = "";
    lastResult = null;
    hasCalculated = false;
    clearError();
    return;
  }
  if (hasCalculated) {
    expression = "";
    lastResult = null;
    hasCalculated = false;
  }
  clearError();
}

function appendNumber(value) {
  resetForNewInput();
  const current = currentNumberSegment();
  if (value === "0" && current === "0") return;
  if (current === "0" && value !== ".") {
    expression = expression.slice(0, -1) + value;
  } else {
    expression += value;
  }
  updateDisplay();
}

function appendDecimal() {
  resetForNewInput();
  const current = currentNumberSegment();
  if (current.includes(".")) return;
  expression += current ? "." : "0.";
  updateDisplay();
}

function appendOperator(value) {
  if (errorMessage) clearAll();
  if (!expression && lastResult === null && value !== "-") return;
  if (hasCalculated && lastResult !== null) {
    expression = formatNumber(lastResult);
    hasCalculated = false;
  }
  if (expression === "-" && value !== "-") return;
  if (isOperator(expression.at(-1))) {
    expression = expression.slice(0, -1) + value;
  } else {
    expression += value;
  }
  updateDisplay();
}

function deleteLastCharacter() {
  if (errorMessage) {
    clearAll();
    return;
  }
  hasCalculated = false;
  lastResult = null;
  expression = expression.slice(0, -1);
  updateDisplay();
}

function clearAll() {
  expression = "";
  lastResult = null;
  hasCalculated = false;
  errorMessage = "";
  updateDisplay();
}

function tokenize(value) {
  const tokens = [];
  let index = 0;
  let expectsNumber = true;

  while (index < value.length) {
    if (expectsNumber) {
      let sign = 1;
      if (value[index] === "-" || value[index] === "+") {
        sign = value[index] === "-" ? -1 : 1;
        index += 1;
      }
      const start = index;
      let decimalCount = 0;
      while (index < value.length && /[\d.]/.test(value[index])) {
        if (value[index] === ".") decimalCount += 1;
        index += 1;
      }
      const rawNumber = value.slice(start, index);
      if (!rawNumber || decimalCount > 1 || !/[\d]/.test(rawNumber)) {
        throw new Error("Enter a valid number");
      }
      tokens.push(sign * Number(rawNumber));
      expectsNumber = false;
    } else if (isOperator(value[index])) {
      tokens.push(value[index]);
      index += 1;
      expectsNumber = true;
    } else {
      throw new Error("Enter a valid expression");
    }
  }

  if (expectsNumber) throw new Error("Finish the expression first");
  return tokens;
}

function evaluateTokens(tokens) {
  const values = [tokens[0]];
  const operators = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

  function applyTopOperator() {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (operator === "/" && right === 0)
      throw new Error("Cannot divide by zero");
    const result =
      operator === "+"
        ? left + right
        : operator === "-"
          ? left - right
          : operator === "*"
            ? left * right
            : left / right;
    values.push(result);
  }

  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const number = tokens[index + 1];
    while (
      operators.length &&
      precedence[operators.at(-1)] >= precedence[operator]
    ) {
      applyTopOperator();
    }
    operators.push(operator);
    values.push(number);
  }

  while (operators.length) applyTopOperator();
  return values[0];
}

function calculate() {
  if (!expression || isOperator(expression.at(-1))) return;
  try {
    const result = evaluateTokens(tokenize(expression));
    if (!Number.isFinite(result)) throw new Error("Result is too large");
    lastResult = result;
    hasCalculated = true;
    clearError();
    resultElement.textContent = formatNumber(result);
    updateDisplay();
  } catch (error) {
    errorMessage = error.message;
    hasCalculated = false;
    updateDisplay();
  }
}

function handleAction(action) {
  if (action === "clear") clearAll();
  if (action === "backspace") deleteLastCharacter();
  if (action === "equals") calculate();
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    const { action, value } = key.dataset;

    if (action) handleAction(action);
    else if (value === ".") appendDecimal();
    else if (isOperator(value)) appendOperator(value);
    else appendNumber(value);
  });
});

document.addEventListener("keydown", (event) => {
  const { key } = event;
  if (/\d/.test(key)) appendNumber(key);
  else if (key === ".") appendDecimal();
  else if (["+", "-", "*", "/"].includes(key)) appendOperator(key);
  else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    event.preventDefault();
    deleteLastCharacter();
  } else if (key === "Escape") clearAll();
});

updateDisplay();
