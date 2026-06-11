import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

type WeatherUnit = 'c' | 'f' | 'k';

type WeatherResponse = {
  city: string;
  country: string;
  temperature: number;
  unit: WeatherUnit;
  unitLabel: 'celsius' | 'fahrenheit' | 'kelvin';
  source: 'open-meteo';
  cached: boolean;
};

type CachedWeatherResponse = Omit<WeatherResponse, 'cached'>;

type OpenMeteoGeocodingResponse = {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
};

type OpenMeteoWeatherResponse = {
  current?: {
    temperature_2m?: number;
  };
};

@Injectable()
export class AppService {
  private readonly weatherCache = new Map<string, CachedWeatherResponse>();
  private readonly maxWeatherCacheEntries = 50;

  getHello(): string {
    return 'Hello World!';
  }

  getVersion(): { name: string; version: string; environment: string } {
    return {
      name: 'cicdtraining',
      version: '0.0.1',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }

  async getWeather(city?: string, unit: string = 'c'): Promise<WeatherResponse> {
    if (!city?.trim()) {
      throw new BadRequestException('city query parameter is required');
    }

    const normalizedUnit = this.normalizeWeatherUnit(unit);
    const normalizedCity = city.trim();
    const cacheKey = `${normalizedCity.toLowerCase()}:${normalizedUnit}`;
    const cached = this.weatherCache.get(cacheKey);

    if (cached) {
      return { ...cached, cached: true };
    }

    const location = await this.fetchLocation(normalizedCity);
    const celsius = await this.fetchTemperature(location.latitude, location.longitude);
    const response: CachedWeatherResponse = {
      city: location.name,
      country: location.country,
      temperature: this.convertTemperature(celsius, normalizedUnit),
      unit: normalizedUnit,
      unitLabel: this.getUnitLabel(normalizedUnit),
      source: 'open-meteo',
    };

    this.rememberWeather(cacheKey, response);

    return { ...response, cached: false };
  }

  private normalizeWeatherUnit(unit: string): WeatherUnit {
    if (unit === 'c' || unit === 'f' || unit === 'k') {
      return unit;
    }

    throw new BadRequestException('unit must be one of: c, f, k');
  }

  private async fetchLocation(city: string) {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    );

    if (!response.ok) {
      throw new ServiceUnavailableException('weather geocoding service is unavailable');
    }

    const data = (await response.json()) as OpenMeteoGeocodingResponse;
    const [location] = data.results ?? [];

    if (!location) {
      throw new BadRequestException(`city not found: ${city}`);
    }

    return location;
  }

  private async fetchTemperature(latitude: number, longitude: number): Promise<number> {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
    );

    if (!response.ok) {
      throw new ServiceUnavailableException('weather service is unavailable');
    }

    const data = (await response.json()) as OpenMeteoWeatherResponse;
    const temperature = data.current?.temperature_2m;

    if (typeof temperature !== 'number') {
      throw new ServiceUnavailableException('weather service returned an invalid response');
    }

    return temperature;
  }

  private convertTemperature(celsius: number, unit: WeatherUnit): number {
    if (unit === 'f') {
      return this.roundTemperature((celsius * 9) / 5 + 32);
    }

    if (unit === 'k') {
      return this.roundTemperature(celsius + 273.15);
    }

    return this.roundTemperature(celsius);
  }

  private getUnitLabel(unit: WeatherUnit): WeatherResponse['unitLabel'] {
    if (unit === 'f') {
      return 'fahrenheit';
    }

    if (unit === 'k') {
      return 'kelvin';
    }

    return 'celsius';
  }

  private roundTemperature(temperature: number): number {
    return Math.round(temperature * 10) / 10;
  }

  private rememberWeather(cacheKey: string, weather: CachedWeatherResponse) {
    if (this.weatherCache.size >= this.maxWeatherCacheEntries) {
      const oldestKey = this.weatherCache.keys().next().value as string | undefined;

      if (oldestKey) {
        this.weatherCache.delete(oldestKey);
      }
    }

    this.weatherCache.set(cacheKey, weather);
  }
}
