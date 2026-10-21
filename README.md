# Daybook

A React task workspace with a complete visual and functional redesign of the original todo app.

## Features

- Create, edit, complete and delete tasks; undo the latest deletion.
- Priorities, project categories and optional due dates.
- Search, combined filters, due/overdue view and sorting.
- Browser-local persistence with storage failure feedback.
- Export JSON backups and validate imports before explicitly replacing the workspace.
- Responsive layout, native modal dialogs, keyboard focus and reduced-motion support.

## Run and verify

Use Node.js 20.19+ or 22.12+ (Node 24 recommended).

```
npm ci
npm run dev
npm test
npm run build
```

Build output is in `dist/`. Deploy as a static site; no backend or account required.

## Limitations

Tasks are stored only in this browser and are not synced across devices. Export a backup to retain a copy. Maximum 2,000 tasks and 2 MB per imported file. Starter tasks are editable examples. Google Fonts is optional and system fonts provide an offline fallback.

## Art direction

A bright cobalt agenda workspace with responsive navigation and pastel progress cards.

Responsive layouts were checked at 360px, 768px and 1440px viewport widths. Compact layouts use larger touch controls and stack or recompose desktop sections. Reduced-motion preferences are supported.

## Live app

[Open Daybook](https://bigmindhub.netlify.app/projects/daybook/) · [Portfolio](https://bigmindhub.netlify.app/#projects)
