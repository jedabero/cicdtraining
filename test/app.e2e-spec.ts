import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/version (GET)', () => {
    return request(app.getHttpServer())
      .get('/version')
      .expect(200)
      .expect({
        name: 'cicdtraining',
        version: '0.0.1',
        environment: process.env.NODE_ENV ?? 'development',
      });
  });

  it('/weather?city=Bogota (GET)', () => {
    mockFetchWeather();

    return request(app.getHttpServer())
      .get('/weather?city=Bogota')
      .expect(200)
      .expect({
        city: 'Bogota',
        country: 'Colombia',
        temperature: 20,
        unit: 'c',
        unitLabel: 'celsius',
        source: 'open-meteo',
        cached: false,
      });
  });

  it('/weather?city=Bogota&unit=f (GET)', () => {
    mockFetchWeather();

    return request(app.getHttpServer())
      .get('/weather?city=Bogota&unit=f')
      .expect(200)
      .expect({
        city: 'Bogota',
        country: 'Colombia',
        temperature: 68,
        unit: 'f',
        unitLabel: 'fahrenheit',
        source: 'open-meteo',
        cached: false,
      });
  });

  it('/weather without city returns 400', () => {
    return request(app.getHttpServer())
      .get('/weather?unit=c')
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('city query parameter is required');
      });
  });

  it('/weather with unsupported unit returns 400', () => {
    return request(app.getHttpServer())
      .get('/weather?city=Bogota&unit=x')
      .expect(400)
      .expect(({ body }) => {
        expect(body.message).toBe('unit must be one of: c, f, k');
      });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });
});
