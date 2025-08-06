# Fantasy Command Center

A comprehensive fantasy football management platform built with Cloudflare Workers and React.

## Project Structure

```
fantasy-command-center/
├── apps/
│   ├── api/          # Cloudflare Worker API backend
│   └── ui/           # React/Vite frontend
├── packages/
│   └── shared/       # Shared types and utilities
└── package.json      # Root workspace configuration
```

## Development

### Prerequisites

- Node.js 18+
- npm
- Wrangler CLI

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `apps/api/wrangler.toml`

3. Run development server:
   ```bash
   npm run dev
   ```

### Deployment

```bash
npm run deploy
```

## API Endpoints

- `POST /league` - Store league settings
- `GET /players` - Return all players from DB
- `POST /sync/espn` - Sync players from ESPN API
- `POST /sync/projections` - Sync projections from FantasyPros
- `GET /alerts` - Fetch alerts for a user

## Database Schema

The API uses Cloudflare D1 with the following tables:
- `league_settings` - User league configurations
- `players` - Player data from ESPN
- `projections` - Fantasy projections from FantasyPros
- `alerts` - User notifications
- `transactions` - League transactions
- `keepers` - Keeper league data 