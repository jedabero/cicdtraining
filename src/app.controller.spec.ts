import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockFetchWeather = () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              name: 'Bogota',
              country: 'Colombia',
              latitude: 4.711,
              longitude: -74.0721,
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 20,
          },
        }),
      } as Response);
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return status ok', () => {
      expect(appController.getHealth()).toEqual({ status: 'ok' });
    });
  });

  describe('version', () => {
    it('should return application version metadata', () => {
      expect(appController.getVersion()).toEqual({
        name: 'cicdtraining',
        version: '0.0.1',
        environment: process.env.NODE_ENV ?? 'development',
      });
    });
  });

  describe('weather', () => {
    it('should return weather in celsius by default', async () => {
      mockFetchWeather();

      await expect(appController.getWeather('Bogota')).resolves.toEqual({
        city: 'Bogota',
        country: 'Colombia',
        temperature: 20,
        unit: 'c',
        unitLabel: 'celsius',
        source: 'open-meteo',
        cached: false,
      });
    });

    it('should return weather in fahrenheit', async () => {
      mockFetchWeather();

      await expect(appController.getWeather('Bogota', 'f')).resolves.toEqual({
        city: 'Bogota',
        country: 'Colombia',
        temperature: 68,
        unit: 'f',
        unitLabel: 'fahrenheit',
        source: 'open-meteo',
        cached: false,
      });
    });

    it('should return weather in kelvin', async () => {
      mockFetchWeather();

      await expect(appController.getWeather('Bogota', 'k')).resolves.toEqual({
        city: 'Bogota',
        country: 'Colombia',
        temperature: 293.2,
        unit: 'k',
        unitLabel: 'kelvin',
        source: 'open-meteo',
        cached: false,
      });
    });

    it('should return cached weather on repeated requests', async () => {
      mockFetchWeather();

      await appController.getWeather('Bogota', 'c');

      await expect(appController.getWeather('Bogota', 'c')).resolves.toEqual({
        city: 'Bogota',
        country: 'Colombia',
        temperature: 20,
        unit: 'c',
        unitLabel: 'celsius',
        source: 'open-meteo',
        cached: true,
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should reject missing city', async () => {
      await expect(appController.getWeather(undefined, 'c')).rejects.toThrow(
        'city query parameter is required',
      );
    });

    it('should reject unsupported units', async () => {
      await expect(appController.getWeather('Bogota', 'x')).rejects.toThrow(
        'unit must be one of: c, f, k',
      );
    });
  });
});
