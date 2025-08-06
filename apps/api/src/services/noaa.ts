import { fetchJson, noaaRateLimiter } from '../utils/fetchHelpers';

export interface NOAAWeatherData {
  latitude: number;
  longitude: number;
  date: string;
  temperature?: number;
  conditions?: string;
  windSpeed?: number;
  windDirection?: string;
  humidity?: number;
  precipitation?: number;
}

export interface NOAAResponse {
  properties?: {
    periods?: Array<{
      temperature: number;
      shortForecast: string;
      windSpeed: string;
      windDirection: string;
      relativeHumidity: {
        value: number;
      };
      probabilityOfPrecipitation: {
        value: number;
      };
    }>;
  };
  error?: string;
}

export class NOAAService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getGameWeather(
    lat: number,
    lon: number,
    date: string
  ): Promise<NOAAWeatherData> {
    if (!noaaRateLimiter()) {
      throw new Error('NOAA API rate limit exceeded. Please try again later.');
    }

    try {
      // First, get the grid data for the coordinates
      const gridResponse = await fetchJson<any>(`${this.baseUrl}/points/${lat},${lon}`);
      
      if (!gridResponse.properties?.gridId || !gridResponse.properties?.gridX || !gridResponse.properties?.gridY) {
        throw new Error('Invalid grid data received from NOAA');
      }

      const { gridId, gridX, gridY } = gridResponse.properties;
      
      // Then get the forecast for that grid
      const forecastUrl = `${this.baseUrl}/grids/${gridId}/${gridX},${gridY}/forecast`;
      const forecastResponse = await fetchJson<NOAAResponse>(forecastUrl);

      if (forecastResponse.error) {
        throw new Error(`NOAA API error: ${forecastResponse.error}`);
      }

      // Parse the forecast data for the specific date
      const weatherData = this.parseForecastForDate(forecastResponse, date);

      return {
        latitude: lat,
        longitude: lon,
        date,
        ...weatherData
      };

    } catch (error) {
      console.error('NOAA API error:', error);
      throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseForecastForDate(response: NOAAResponse, targetDate: string): Partial<NOAAWeatherData> {
    if (!response.properties?.periods || !Array.isArray(response.properties.periods)) {
      return {};
    }

    // Find the forecast period that matches our target date
    const targetPeriod = response.properties.periods.find(period => {
      // This is a simplified date matching - we'll need to refine based on actual NOAA response format
      return period.shortForecast && period.shortForecast.toLowerCase().includes(targetDate.toLowerCase());
    });

    if (!targetPeriod) {
      return {};
    }

    return {
      temperature: targetPeriod.temperature,
      conditions: targetPeriod.shortForecast,
      windSpeed: this.parseWindSpeed(targetPeriod.windSpeed),
      windDirection: targetPeriod.windDirection,
      humidity: targetPeriod.relativeHumidity?.value,
      precipitation: targetPeriod.probabilityOfPrecipitation?.value
    };
  }

  private parseWindSpeed(windSpeedStr: string): number | undefined {
    // Parse wind speed string like "10 mph" to number
    const match = windSpeedStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  async getWeatherForStadium(stadiumName: string, date: string): Promise<NOAAWeatherData | null> {
    // Stadium coordinates mapping - we can expand this as needed
    const stadiumCoords: { [key: string]: { lat: number; lon: number } } = {
      'Lambeau Field': { lat: 44.5013, lon: -88.0622 },
      'Soldier Field': { lat: 41.8623, lon: -87.6166 },
      'Ford Field': { lat: 42.3400, lon: -83.0456 },
      'MetLife Stadium': { lat: 40.8135, lon: -74.0741 },
      // Add more stadiums as needed
    };

    const coords = stadiumCoords[stadiumName];
    if (!coords) {
      console.warn(`No coordinates found for stadium: ${stadiumName}`);
      return null;
    }

    return this.getGameWeather(coords.lat, coords.lon, date);
  }

  async getWeatherForTeam(teamAbbreviation: string, date: string): Promise<NOAAWeatherData | null> {
    // Team to stadium mapping - we can expand this as needed
    const teamStadiums: { [key: string]: string } = {
      'GB': 'Lambeau Field',
      'CHI': 'Soldier Field',
      'DET': 'Ford Field',
      'NYG': 'MetLife Stadium',
      'NYJ': 'MetLife Stadium',
      // Add more teams as needed
    };

    const stadiumName = teamStadiums[teamAbbreviation];
    if (!stadiumName) {
      console.warn(`No stadium found for team: ${teamAbbreviation}`);
      return null;
    }

    return this.getWeatherForStadium(stadiumName, date);
  }
} 