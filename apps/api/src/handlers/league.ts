import { DatabaseService } from '../utils/db';

export interface LeagueSettings {
  userId: string;
  leagueId: string;
  scoringJson: string;
  rosterJson: string;
  keeperRulesJson: string;
  auctionBudget: number;
  waiverBudget: number;
}

export class LeagueHandler {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async handlePost(request: Request): Promise<Response> {
    try {
      const body = await request.json() as LeagueSettings;
      
      // Validate required fields
      if (!body.userId || !body.leagueId) {
        return new Response(
          JSON.stringify({ error: 'userId and leagueId are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate JSON fields
      try {
        JSON.parse(body.scoringJson);
        JSON.parse(body.rosterJson);
        JSON.parse(body.keeperRulesJson);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in scoring, roster, or keeper rules' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate numeric fields
      if (typeof body.auctionBudget !== 'number' || typeof body.waiverBudget !== 'number') {
        return new Response(
          JSON.stringify({ error: 'auctionBudget and waiverBudget must be numbers' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Upsert league settings
      const result = await this.db.upsertLeagueSettings(
        body.userId,
        body.leagueId,
        body.scoringJson,
        body.rosterJson,
        body.keeperRulesJson,
        body.auctionBudget,
        body.waiverBudget
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'League settings saved successfully',
          id: result.meta?.last_row_id
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('League POST error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
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
          JSON.stringify({ error: 'userId and leagueId query parameters are required' }),
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
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 