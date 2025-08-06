# Fantasy Command Center

A monorepo for fantasy football management with Cloudflare Workers API and React frontend.

## Project Structure

```
fantasy-command-center/
├── apps/
│   ├── api/          # Cloudflare Worker API backend
│   └── ui/           # React + Vite frontend
└── packages/
    └── shared/       # Shared types and utilities
```

## Development

### Prerequisites
- Node.js 18+
- npm
- Wrangler CLI

### Setup
1. Install dependencies: `npm install`
2. Start API dev server: `npm run dev --workspace=apps/api`
3. Start UI dev server: `npm run dev --workspace=apps/ui`

### Deployment
- API: `npm run deploy --workspace=apps/api`
- UI: Automatically deployed via Cloudflare Pages

## API Endpoints

- `POST /league` - Store league settings
- `GET /players` - Get all players
- `POST /sync/espn` - Sync players from ESPN
- `GET /projections` - Get player projections
- `POST /sync/projections` - Sync projections from FantasyPros
- `GET /alerts` - Get user alerts

## Database Schema

Tables: `league_settings`, `players`, `projections`, `alerts`, `transactions`, `keepers`

All tables include `created_at` and `updated_at` timestamps.

<!-- Updated: Latest deployment with API integration fixes --> 