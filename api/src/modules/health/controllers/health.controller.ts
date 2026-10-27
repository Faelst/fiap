import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public';
import { HealthResponse } from '../dto/health.response';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'A API está no ar' })
  @ApiOkResponse({ type: HealthResponse })
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
