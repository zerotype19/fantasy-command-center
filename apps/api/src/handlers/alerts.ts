import { DatabaseService } from '../utils/db';

export class AlertsHandler {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async handleGet(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const leagueId = url.searchParams.get('leagueId');
      const status = url.searchParams.get('status');
      const limit = url.searchParams.get('limit');

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId query parameter is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const alertsResult = await this.db.getAlerts(userId, leagueId || undefined);
      let alerts = alertsResult.results || [];

      // Apply status filter if provided
      if (status) {
        alerts = alerts.filter((a: any) => a.status === status);
      }

      // Apply limit
      const limitNum = limit ? parseInt(limit, 10) : 50;
      if (limitNum > 0) {
        alerts = alerts.slice(0, limitNum);
      }

      return new Response(
        JSON.stringify({
          alerts: alerts,
          count: alerts.length
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Alerts GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handlePost(request: Request): Promise<Response> {
    try {
      const body = await request.json() as any;
      const { userId, leagueId, type, message } = body;

      if (!userId || !leagueId || !type || !message) {
        return new Response(
          JSON.stringify({ error: 'userId, leagueId, type, and message are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate alert type
      const validTypes = ['injury', 'trade', 'waiver', 'news', 'weather', 'system'];
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: 'Invalid alert type. Must be one of: ' + validTypes.join(', ') }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const result = await this.db.createAlert(userId, leagueId, type, message);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Alert created successfully',
          id: result.meta?.last_row_id
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Alerts POST error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  async handlePatch(request: Request): Promise<Response> {
    try {
      const body = await request.json() as any;
      const { alertId } = body;

      if (!alertId) {
        return new Response(
          JSON.stringify({ error: 'alertId is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const alertIdNum = parseInt(alertId, 10);
      if (isNaN(alertIdNum)) {
        return new Response(
          JSON.stringify({ error: 'alertId must be a valid number' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const result = await this.db.markAlertAsRead(alertIdNum);

      if (result.meta?.changes === 0) {
        return new Response(
          JSON.stringify({ error: 'Alert not found or already marked as read' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Alert marked as read successfully'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Alerts PATCH error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
} 