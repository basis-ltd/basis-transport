import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/auth.decorators';

@Controller()
export class AppController {
  @Public()
  @Get()
  getWelcome() {
    return { message: 'Welcome to the Transport Management API' };
  }
}
