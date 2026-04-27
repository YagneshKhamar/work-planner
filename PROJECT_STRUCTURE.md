# Project Structure

This document reflects the repository structure as it exists right now. It is written to make the current source layout clear to humans and AI agents alike.

## 1. Top-Level Layout

```text
execd/
+-- .claude/                 # local Claude tool metadata
+-- .code-review-graph/      # local review artifact metadata
+-- .editorconfig
+-- .env                     # local environment variables
+-- .gitignore
+-- .github/
+-- .vscode/
+-- .prettierignore
+-- .prettierrc.yaml
+-- CONTRIBUTING.md
+-- dev-app-update.yml
+-- dist/                    # build output
+-- electron-builder.yml
+-- electron.vite.config.ts
+-- eslint.config.mjs
+-- node_modules/            # dependencies
+-- out/                     # build artifacts
+-- package-lock.json
+-- package.json
+-- PROJECT_STRUCTURE.md
+-- README.md
+-- resources/
+-- screenshots/
+-- src/
+-- tsconfig.json
+-- tsconfig.node.json
+-- tsconfig.web.json
```

> Note: `dist/`, `node_modules/`, and `out/` are generated directories and are not part of the source code logic.

## 2. Source Tree

```text
src/
+-- main/
�   +-- index.ts
�   +-- db/
�   �   +-- database.ts
�   �   +-- migrations/
�   �   �   +-- 001_initial.ts
�   �   +-- queries/                    (empty)
�   +-- ipc/
�       +-- ai.ipc.ts
�       +-- business.ipc.ts
�       +-- config.ipc.ts
�       +-- goals.ipc.ts
�       +-- planning.ipc.ts
�       +-- reports.ipc.ts
�       +-- sales.ipc.ts
�       +-- tasks.ipc.ts
�       +-- team.ipc.ts
+-- overlay/
�   +-- index.html                 # legacy overlay shell
�   +-- src/
�       +-- main.tsx
�       +-- Overlay.tsx
+-- preload/
�   +-- index.d.ts
�   +-- index.ts
+-- renderer/
�   +-- index.html
�   +-- overlay.html
�   +-- src/
�       +-- App.tsx
�       +-- env.d.ts
�       +-- main.tsx
�       +-- overlay-main.tsx
�       +-- assets/
�       �   +-- base.css
�       �   +-- main.css
�       +-- components/
�       �   +-- Sidebar.tsx
�       �   +-- Toast.tsx
�       �   +-- UpdateNotifier.tsx
�       �   +-- Versions.tsx
�       +-- hooks/                    (empty)
�       +-- overlay/
�       �   +-- Overlay.tsx
�       +-- pages/
�           +-- Analytics.tsx
�           +-- Business.tsx
�           +-- DailyReport.tsx
�           +-- Goals.tsx
�           +-- History.tsx
�           +-- Reports.tsx
�           +-- Setup.tsx
�           +-- Team.tsx
�           +-- Today.tsx
+-- shared/
    +-- constants.ts
    +-- types/
        +-- index.ts
```

## 3. File Responsibilities

| Path                                             | Responsibility                                                        | Status      |
| ------------------------------------------------ | --------------------------------------------------------------------- | ----------- |
| `src/main/index.ts`                              | Electron bootstrap, app lifecycle, window creation, IPC registration  | Active      |
| `src/main/db/database.ts`                        | SQLite initialization, migration execution, DB lifecycle management   | Active      |
| `src/main/db/migrations/001_initial.ts`          | Initial database schema and table creation                            | Active      |
| `src/main/db/queries/`                           | Placeholder for reusable DB queries                                   | Empty       |
| `src/main/ipc/ai.ipc.ts`                         | AI orchestration and AI-related IPC handlers                          | Active      |
| `src/main/ipc/business.ipc.ts`                   | Business workflow IPC handlers                                        | Active      |
| `src/main/ipc/config.ipc.ts`                     | App configuration persistence and IPC methods                         | Active      |
| `src/main/ipc/goals.ipc.ts`                      | Goal and subgoal CRUD, validation, and goal-related IPC               | Active      |
| `src/main/ipc/planning.ipc.ts`                   | Planning IPC placeholder                                              | Placeholder |
| `src/main/ipc/reports.ipc.ts`                    | Reporting, analytics, and export IPC                                  | Active      |
| `src/main/ipc/sales.ipc.ts`                      | Sales-related IPC handlers                                            | Active      |
| `src/main/ipc/tasks.ipc.ts`                      | Task lifecycle: daily plan, completion, carry-over, missed tasks, EOD | Active      |
| `src/main/ipc/team.ipc.ts`                       | Team members, tasks, follow-ups, and team management IPC              | Active      |
| `src/overlay/index.html`                         | Legacy overlay HTML shell                                             | Legacy      |
| `src/overlay/src/main.tsx`                       | Legacy overlay React entrypoint                                       | Legacy      |
| `src/overlay/src/Overlay.tsx`                    | Legacy overlay UI component                                           | Legacy      |
| `src/preload/index.d.ts`                         | Type declarations for the exposed preload API                         | Active      |
| `src/preload/index.ts`                           | `contextBridge` preload API installation                              | Active      |
| `src/renderer/index.html`                        | Main renderer HTML entry                                              | Active      |
| `src/renderer/overlay.html`                      | Active overlay HTML entry                                             | Active      |
| `src/renderer/src/App.tsx`                       | Main renderer routing and page shell                                  | Active      |
| `src/renderer/src/env.d.ts`                      | Renderer ambient type declarations                                    | Active      |
| `src/renderer/src/main.tsx`                      | Main renderer React bootstrap                                         | Active      |
| `src/renderer/src/overlay-main.tsx`              | Overlay renderer React bootstrap                                      | Active      |
| `src/renderer/src/assets/base.css`               | Base CSS reset and design foundation                                  | Active      |
| `src/renderer/src/assets/main.css`               | Application-level styling and theme rules                             | Active      |
| `src/renderer/src/components/Sidebar.tsx`        | Navigation sidebar component                                          | Active      |
| `src/renderer/src/components/Toast.tsx`          | Toast notifications and provider                                      | Active      |
| `src/renderer/src/components/UpdateNotifier.tsx` | Update notification UI helper                                         | Active      |
| `src/renderer/src/components/Versions.tsx`       | Version display widget; appears unused in main UI                     | Placeholder |
| `src/renderer/src/hooks/`                        | Custom hooks directory                                                | Empty       |
| `src/renderer/src/overlay/Overlay.tsx`           | Active overlay widget UI                                              | Active      |
| `src/renderer/src/pages/Analytics.tsx`           | Analytics dashboard page                                              | Active      |
| `src/renderer/src/pages/Business.tsx`            | Business planning page                                                | Active      |
| `src/renderer/src/pages/DailyReport.tsx`         | Daily reporting page                                                  | Active      |
| `src/renderer/src/pages/Goals.tsx`               | Goals setup and tracking page                                         | Active      |
| `src/renderer/src/pages/History.tsx`             | History page                                                          | Active      |
| `src/renderer/src/pages/Reports.tsx`             | Reports overview and navigation page                                  | Active      |
| `src/renderer/src/pages/Setup.tsx`               | App setup and onboarding page                                         | Active      |
| `src/renderer/src/pages/Team.tsx`                | Team management and follow-up page                                    | Active      |
| `src/renderer/src/pages/Today.tsx`               | Daily execution and task planning page                                | Active      |
| `src/shared/constants.ts`                        | Shared constants used across main and renderer                        | Active      |
| `src/shared/types/index.ts`                      | Shared domain types and IPC contracts                                 | Active      |

## 4. Route Map

| Route           | Page File                                 | Status |
| --------------- | ----------------------------------------- | ------ |
| `/`             | `src/renderer/src/App.tsx` (router entry) | Active |
| `/setup`        | `src/renderer/src/pages/Setup.tsx`        | Active |
| `/goals`        | `src/renderer/src/pages/Goals.tsx`        | Active |
| `/today`        | `src/renderer/src/pages/Today.tsx`        | Active |
| `/reports`      | `src/renderer/src/pages/Reports.tsx`      | Active |
| `/business`     | `src/renderer/src/pages/Business.tsx`     | Active |
| `/analytics`    | `src/renderer/src/pages/Analytics.tsx`    | Active |
| `/team`         | `src/renderer/src/pages/Team.tsx`         | Active |
| `/history`      | `src/renderer/src/pages/History.tsx`      | Active |
| `/report/daily` | `src/renderer/src/pages/DailyReport.tsx`  | Active |

## 5. IPC Surface

| Namespace  | Responsibility summary                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| `config`   | Application configuration persistence and retrieval                                  |
| `goals`    | Goal/subgoal lifecycle and validation                                                |
| `ai`       | AI prompt orchestration and generation flows                                         |
| `tasks`    | Daily task plans, completion state, missed tasks, carry-over, and end-of-day actions |
| `reports`  | Reporting and analytics data access                                                  |
| `team`     | Team members, assignments, follow-ups, and overdue task workflows                    |
| `business` | Business-specific workflow IPC                                                       |
| `sales`    | Sales-related workflow IPC                                                           |
| `overlay`  | Overlay window visibility and main window navigation                                 |

## 6. Notes and Structural Observations

- The active renderer build uses `src/renderer/index.html` and `src/renderer/overlay.html` as entry points.
- `src/renderer/src/overlay/Overlay.tsx` is the active overlay component; `src/overlay/` contains a legacy overlay implementation.
- `src/main/db/queries/` and `src/renderer/src/hooks/` are empty placeholder directories for future shared logic.
- `src/main/ipc/planning.ipc.ts` is currently a placeholder with no implemented handlers.
- `src/renderer/src/components/Versions.tsx` appears to be a UI placeholder component and is not strongly wired into the app.
- `electron.vite.config.ts` defines the active renderer inputs and alias mappings for the Electron/Vite build.
