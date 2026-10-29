const STORAGE_KEY = 'oibsip-quiet-focus-tasks-v1';
const MAX_TASK_LENGTH = 160;

const elements = {
  form: document.querySelector('#task-form'),
  input: document.querySelector('#task-input'),
  pendingList: document.querySelector('#pending-list'),
  completedList: document.querySelector('#completed-list'),
  pendingEmpty: document.querySelector('#pending-empty'),
  completedEmpty: document.querySelector('#completed-empty'),
  pendingCount: document.querySelector('#pending-count'),
  completedCount: document.querySelector('#completed-count'),
  focusNumber: document.querySelector('#focus-number'),
  focusLabel: document.querySelector('#focus-label'),
  taskError: document.querySelector('#task-error'),
  liveRegion: document.querySelector('#live-region'),
};

let tasks = loadTasks();
let editingTaskId = null;

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTask(value) {
  return value
    && typeof value.id === 'string'
    && typeof value.text === 'string'
    && typeof value.createdAt === 'string'
    && typeof value.completed === 'boolean';
}

function loadTasks() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isTask)
      .map((task) => ({
        id: task.id,
        text: task.text.trim().slice(0, MAX_TASK_LENGTH),
        createdAt: task.createdAt,
        completed: task.completed,
        completedAt: typeof task.completedAt === 'string' ? task.completedAt : null,
      }))
      .filter((task) => task.text.length > 0);
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    announce('Your browser could not save this change locally.');
  }
}

function announce(message) {
  elements.liveRegion.textContent = '';
  window.setTimeout(() => {
    elements.liveRegion.textContent = message;
  }, 30);
}

function findTaskCard(taskId) {
  return [...document.querySelectorAll('.task-card')].find(
    (card) => card.dataset.taskId === taskId,
  );
}

function focusTaskAction(taskId, action) {
  const card = findTaskCard(taskId);
  const target = card?.querySelector(`[data-action="${action}"]`);
  if (target instanceof HTMLElement) target.focus();
}

function showComposerError(message) {
  elements.taskError.textContent = message;
  elements.taskError.hidden = false;
  elements.input.setAttribute('aria-invalid', 'true');
  elements.input.focus();
}

function clearComposerError() {
  elements.taskError.textContent = '';
  elements.taskError.hidden = true;
  elements.input.removeAttribute('aria-invalid');
}

function showEditorError(message) {
  const card = findTaskCard(editingTaskId);
  const input = card?.querySelector('input[name="edited-task"]');
  const error = card?.querySelector('.editor-error');
  if (!input || !error) return;

  input.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  error.hidden = false;
  input.focus();
}

function clearEditorError(input) {
  const editor = input.closest('.inline-editor');
  const error = editor?.querySelector('.editor-error');
  input.removeAttribute('aria-invalid');
  if (error) {
    error.textContent = '';
    error.hidden = true;
  }
}

function formatTimestamp(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Saved just now';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getSortedTasks(completed) {
  return tasks
    .filter((task) => task.completed === completed)
    .sort((a, b) => {
      const aDate = new Date(completed ? a.completedAt || a.createdAt : a.createdAt).getTime();
      const bDate = new Date(completed ? b.completedAt || b.createdAt : b.createdAt).getTime();
      return bDate - aDate;
    });
}

function createActionButton(action, label, extraClass = '', accessibleLabel = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `action-button ${extraClass}`.trim();
  button.dataset.action = action;
  button.textContent = label;
  if (accessibleLabel) button.setAttribute('aria-label', accessibleLabel);
  return button;
}

function createTaskCard(task) {
  const item = document.createElement('li');
  item.className = `task-card${task.completed ? ' task-card--completed' : ''}${editingTaskId === task.id ? ' task-card--editing' : ''}`;
  item.dataset.taskId = task.id;

  const top = document.createElement('div');
  top.className = 'task-card__top';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'toggle-button';
  toggle.dataset.action = 'toggle';
  toggle.setAttribute('aria-label', task.completed ? `Mark ${task.text} as pending` : `Mark ${task.text} complete`);
  toggle.title = task.completed ? 'Mark as pending' : 'Mark complete';
  toggle.textContent = '✓';

  top.append(toggle);

  if (editingTaskId === task.id) {
    const editor = document.createElement('form');
    editor.className = 'inline-editor';
    editor.dataset.editor = 'true';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'edited-task';
    input.value = task.text;
    input.maxLength = MAX_TASK_LENGTH;
    input.required = true;
    input.setAttribute('aria-label', 'Edit task text');

    const error = document.createElement('p');
    error.className = 'editor-error';
    error.id = 'editor-error';
    error.setAttribute('role', 'alert');
    error.hidden = true;
    input.setAttribute('aria-describedby', 'editor-error');
    input.addEventListener('input', () => clearEditorError(input));

    const editorActions = document.createElement('div');
    editorActions.className = 'editor-actions';

    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'editor-button editor-button--save';
    save.textContent = 'Save';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'editor-button';
    cancel.dataset.action = 'cancel-edit';
    cancel.textContent = 'Cancel';

    editorActions.append(save, cancel);
    editor.append(input, error, editorActions);
    top.append(editor);
  } else {
    const text = document.createElement('p');
    text.className = 'task-card__text';
    text.textContent = task.text;
    top.append(text);
  }

  const meta = document.createElement('p');
  meta.className = 'task-card__meta';
  meta.textContent = task.completed
    ? `Completed ${formatTimestamp(task.completedAt || task.createdAt)}`
    : `Added ${formatTimestamp(task.createdAt)}`;

  const actions = document.createElement('div');
  actions.className = 'task-card__actions';
  actions.append(
    createActionButton('edit', 'Edit', '', `Edit ${task.text}`),
    createActionButton(
      'delete',
      'Delete',
      'action-button--delete',
      `Delete ${task.text}`,
    ),
  );

  item.append(top, meta, actions);
  return item;
}

function renderList(listElement, emptyElement, listTasks) {
  listElement.replaceChildren();
  emptyElement.hidden = listTasks.length > 0;

  const fragment = document.createDocumentFragment();
  listTasks.forEach((task) => fragment.append(createTaskCard(task)));
  listElement.append(fragment);
}

function render() {
  const pendingTasks = getSortedTasks(false);
  const completedTasks = getSortedTasks(true);

  renderList(elements.pendingList, elements.pendingEmpty, pendingTasks);
  renderList(elements.completedList, elements.completedEmpty, completedTasks);

  elements.pendingCount.textContent = `${pendingTasks.length} pending`;
  elements.completedCount.textContent = `${completedTasks.length} completed`;
  elements.focusNumber.textContent = pendingTasks.length;
  elements.focusLabel.textContent = pendingTasks.length === 1 ? 'task waiting' : 'tasks waiting';

  if (editingTaskId) {
    const editor = findTaskCard(editingTaskId)?.querySelector(
      'input[name="edited-task"]',
    );
    if (editor) {
      editor.focus();
      editor.select();
    }
  }
}

function addTask(text) {
  const cleanText = text.trim().replace(/\s+/g, ' ');
  if (!cleanText) {
    showComposerError('Write a task before adding it.');
    return;
  }

  clearComposerError();

  const task = {
    id: createId(),
    text: cleanText.slice(0, MAX_TASK_LENGTH),
    createdAt: new Date().toISOString(),
    completed: false,
    completedAt: null,
  };

  tasks.unshift(task);
  saveTasks();
  render();
  elements.form.reset();
  elements.input.focus();
  announce(`Added ${task.text} to pending tasks.`);
}

function toggleTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  editingTaskId = null;
  saveTasks();
  render();
  focusTaskAction(taskId, 'toggle');
  announce(task.completed ? `Marked ${task.text} complete.` : `Moved ${task.text} back to pending tasks.`);
}

function startEdit(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  render();
}

function saveEdit(taskId, nextText) {
  const cleanText = nextText.trim().replace(/\s+/g, ' ');
  if (!cleanText) {
    showEditorError('A task cannot be empty.');
    return;
  }

  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.text = cleanText.slice(0, MAX_TASK_LENGTH);
  editingTaskId = null;
  saveTasks();
  render();
  focusTaskAction(taskId, 'edit');
  announce('Task updated.');
}

function deleteTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  tasks = tasks.filter((item) => item.id !== taskId);
  if (editingTaskId === taskId) editingTaskId = null;
  saveTasks();
  render();
  elements.input.focus();
  announce(`Deleted ${task.text}.`);
}

function handleListClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const card = button.closest('[data-task-id]');
  const taskId = card?.dataset.taskId;
  if (!taskId) return;

  if (button.dataset.action === 'toggle') toggleTask(taskId);
  if (button.dataset.action === 'edit') startEdit(taskId);
  if (button.dataset.action === 'cancel-edit') {
    editingTaskId = null;
    render();
    focusTaskAction(taskId, 'edit');
    announce('Edit canceled.');
  }
  if (button.dataset.action === 'delete') deleteTask(taskId);
}

function handleListSubmit(event) {
  const form = event.target.closest('[data-editor="true"]');
  if (!form) return;

  event.preventDefault();
  const taskId = form.closest('[data-task-id]')?.dataset.taskId;
  const input = form.elements.namedItem('edited-task');
  if (taskId && input instanceof HTMLInputElement) saveEdit(taskId, input.value);
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(elements.input.value);
});

elements.input.addEventListener('input', clearComposerError);

elements.pendingList.addEventListener('click', handleListClick);
elements.completedList.addEventListener('click', handleListClick);
elements.pendingList.addEventListener('submit', handleListSubmit);
elements.completedList.addEventListener('submit', handleListSubmit);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && editingTaskId) {
    const taskId = editingTaskId;
    editingTaskId = null;
    render();
    focusTaskAction(taskId, 'edit');
    announce('Edit canceled.');
  }
});

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    tasks = loadTasks();
    editingTaskId = null;
    render();
    announce('Tasks were updated in another tab.');
  }
});

render();
