# To-Do Web App

An interactive to-do list application built with HTML5, CSS3, and vanilla JavaScript for the Oasis Infobyte Web Development and Designing internship.

**Internship:** Oasis Infobyte — Web Development and Designing  
**Level / Task:** Level 2 — Task 3  
**Author:** Abdelrahman Mohammed Mahmoud  
**Status:** Planned — implementation not started

## Objective

Develop an interactive to-do list application that allows users to manage daily tasks with add, complete, edit, and delete functionality, organised into pending and completed lists.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript

## Feature Checklist

- [ ] Input field + "Add Task" button to create new tasks
- [ ] Newly added tasks appear immediately in the Pending Tasks list
- [ ] Each task has a "Mark Complete" toggle — completed tasks move to the Completed Tasks list
- [ ] Each task has an Edit button that allows the task text to be modified inline
- [ ] Each task has a Delete button that permanently removes it from either list
- [ ] Task count indicators: "X pending" and "Y completed" displayed above each list
- [ ] (Bonus) Timestamp displayed on each task showing when it was added and/or completed
- [ ] (Bonus) Tasks persist across page refreshes using `localStorage`
- [ ] Empty state messaging: display a friendly message when a list has no items

## Planned Approach

- Use a single source of truth for task state, with rendering driven from that state.
- Separate pending and completed lists with clear count indicators.
- Implement inline editing with a save/cancel flow.
- Persist tasks and timestamps in `localStorage`.
- Include empty-state messages for both lists.

## Demo

- **Live demo:** To be added after deployment.
- **Demo video:** To be added after recording.

## Screenshots

Screenshots will be added after implementation.

## How to Run

Open `index.html` directly in a browser once the app is implemented.

## Author

Abdelrahman Mohammed Mahmoud  
Oasis Infobyte Internship — Web Development and Designing
