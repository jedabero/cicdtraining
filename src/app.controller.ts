import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Get('version')
  getVersion(): { name: string; version: string; environment: string } {
    return this.appService.getVersion();
  }

  @Get('weather')
  getWeather(@Query('city') city?: string, @Query('unit') unit?: string) {
    return this.appService.getWeather(city, unit);
  }
}
