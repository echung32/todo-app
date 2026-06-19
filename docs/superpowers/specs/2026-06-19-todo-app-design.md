# Simple TODO App — Design

**Date:** 2026-06-19
**Status:** Approved

## Overview

A simple, self-contained TODO app that runs in the browser with no build step,
no dependencies, and no server. The entire app is one `index.html` file with
inline CSS and JavaScript. Tasks persist in browser `localStorage`.

## Architecture

- Single file: `index.html` containing `<style>` and `<script>` inline.
- Open directly in any modern browser — no install, no server.
- State lives in a single in-memory `todos` array which is the single source of
  truth. The UI is always re-rendered from this array.

## Persistence

- Tasks stored in `localStorage` under a single key as a JSON array.
- Each task: `{ id, text, completed, dueDate }` where `id` is a unique string
  and `dueDate` is an ISO date string (`YYYY-MM-DD`) or `null` if unset.
- `load()` reads and parses on page open (empty array if none/invalid).
- `save()` serializes the `todos` array after every change.
- Tasks survive refresh and browser restart on the same machine/browser.

## Features

- **Add** — text input plus Enter key or an "Add" button creates a task.
  Empty/whitespace-only input is ignored. An optional date picker next to the
  input sets a due date at creation.
- **Due dates** — each task may have an optional due date. It is shown on the
  task; overdue tasks (due date before today and not completed) are visually
  highlighted. Editable inline (see Edit). Clearing the date removes it.
- **Mark complete** — a checkbox toggles the `completed` state; completed tasks
  render with a strikethrough.
- **Edit** — double-click a task's text to edit it inline. Enter or blur saves;
  Escape cancels. Saving empty text deletes the task. A due-date picker on the
  task lets the due date be changed or cleared at any time.
- **Delete** — an `×` button on each task removes it.
- **Filter** — All / Active / Completed buttons change which tasks show. A live
  count of remaining active tasks is displayed.

## Look & Feel

Clean and minimal:
- Neutral light background, centered card layout, system font stack.
- Subtle borders, one quiet accent color for buttons and the active filter.
- Responsive enough to be usable on a phone.

## Code Structure (inside the single file)

Small, focused functions:
- `load()` / `save()` — read/write `localStorage`.
- `render()` — redraw the task list from `todos` given the current filter, and
  update the active-task count.
- Event handlers — add, toggle complete, edit, delete, set filter.

## Testing

Manual verification in a browser:
- Add tasks; confirm they appear and persist across refresh.
- Toggle complete; confirm strikethrough and count update.
- Edit via double-click; confirm save/cancel behavior.
- Delete; confirm removal persists.
- Each filter shows the correct subset.
- Set a due date at creation and via edit; confirm it shows and persists.
- Confirm an overdue, incomplete task is highlighted; clearing the date removes
  both the highlight and the displayed date.

## Out of Scope (YAGNI)

- No backend, accounts, or multi-device sync.
- No priorities, tags, or reminders/notifications.
- No drag-and-drop reordering.
