import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }

  @Get()
  getToken() {
    return this.appService.getToken();
  }

  @Get('ip')
  async getIp() {
    return await this.appService.getIp();
  }
}
