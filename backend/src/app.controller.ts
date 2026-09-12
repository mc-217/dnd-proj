import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Root API endpoint used for quick service metadata checks.
  @Get()
  getInfo() {
    // Delegates response shaping to the service layer.
    return this.appService.getInfo();
  }
}
