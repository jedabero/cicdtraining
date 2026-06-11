import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
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
}
