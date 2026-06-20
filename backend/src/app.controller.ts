import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/guards/public.decorator';

@Controller('health') 
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  async checkHealth() {
    return this.appService.getHello();
  }
}