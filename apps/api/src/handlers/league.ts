import { DatabaseService } from '../utils/db';
import { fetchLeagueData, extractLeagueSettings } from '../services/espn';

export class LeagueHandler {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async handlePost(request: Request): Promise<Response> {
    try {
      const body = await request.json() as any;
      const { userId, leagueId, scoringJson, rosterJson, keeperRulesJson, auctionBudget, waiverBudget } = body;

      if (!userId || !leagueId) {
        return new Response(
          JSON.stringify({ error: 'userId and leagueId are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      await this.db.upsertLeagueSettings(
        userId,
        leagueId,
        scoringJson || '{}',
        rosterJson || '{}',
        keeperRulesJson || '{}',
        auctionBudget || 0,
        waiverBudget || 0
      );

      return new Response(
        JSON.stringify({ success: true, message: 'League settings saved' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('League POST error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save league settings' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const leagueId = url.searchParams.get('leagueId');

      if (!userId || !leagueId) {
        return new Response(
          JSON.stringify({ error: 'userId and leagueId are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const settings = await this.db.getLeagueSettings(userId, leagueId);

      if (!settings) {
        return new Response(
          JSON.stringify({ error: 'League settings not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(settings),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('League GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get league settings' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handleGetLeagueSettings(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      
      // Extract leagueId from path: /league/:leagueId/settings
      const leagueIdIndex = pathParts.indexOf('league') + 1;
      const leagueId = pathParts[leagueIdIndex];

      if (!leagueId) {
        return new Response(
          JSON.stringify({ error: 'leagueId is required in URL path' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Fetching league settings for league ${leagueId}...`);

      // Fetch league data from ESPN
      const leagueData = await fetchLeagueData(leagueId);
      
      // Extract league settings
      const settings = extractLeagueSettings(leagueData);

      return new Response(
        JSON.stringify({
          success: true,
          league_id: leagueId,
          settings: settings
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('League settings GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch league settings' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 