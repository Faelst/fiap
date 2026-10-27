import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../shared/decorators/public';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
