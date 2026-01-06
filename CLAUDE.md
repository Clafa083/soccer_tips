# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soccer Tips (VM-tipset) is a Swedish soccer betting/prediction web application where users bet on match scores for tournaments. The app features user authentication, match betting, knockout stage predictions, leaderboards, special bets, and a forum.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite, Material-UI (MUI) 7
- **Backend**: PHP REST API with PDO/MySQL
- **Database**: MySQL (hosted on familjenfalth.se)
- **State**: React Context (AppContext) with useReducer pattern
- **Routing**: React Router v7 with basename `/eankbt`

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + production build
npm run lint         # ESLint
npm run preview      # Preview production build
```

## Architecture

### Frontend Structure

- `src/features/` - Feature-based pages (admin, auth, betting, forum, knockout, leaderboard, matches, profile, user)
- `src/components/` - Reusable components (charts, matches, betting, knockout, admin)
- `src/services/` - API service modules (one per domain: authService, betService, matchService, etc.)
- `src/context/` - AppContext (auth state) and ThemeContext (dark/light mode)
- `src/api/api.ts` - Axios instance with auth interceptor (uses query params for tokens due to server limitations)
- `src/types/models.ts` - TypeScript interfaces for all data models
- `src/layouts/MainLayout.tsx` - Main app shell with navigation

### Backend Structure

- `php-backend/api/` - REST endpoints (auth.php, matches.php, bets.php, etc.)
- `php-backend/config/database.php` - PDO database singleton with helpers
- `php-backend/utils/auth.php` - JWT authentication utilities

### Key Patterns

**API Configuration**: The API URL is environment-aware via `src/config/config.ts`. Uses `VITE_API_URL` env var or falls back to production/localhost based on `import.meta.env.MODE`.

**Authentication**: Token-based auth stored in localStorage. The `api.ts` interceptor adds tokens as query parameters (not headers) because the server filters Authorization headers. PUT requests fallback to POST with `_method=PUT` query param for server compatibility.

**Match Types**: GROUP, ROUND_OF_32, ROUND_OF_16, QUARTER_FINAL, SEMI_FINAL, FINAL (see `MatchType` enum in models.ts)

**Protected Routes**: `ProtectedRoute` component wraps routes requiring auth. Use `requireAdmin` prop for admin-only routes.

## UI Language

The application UI is in Swedish. Component text, labels, and user-facing messages should be in Swedish.
