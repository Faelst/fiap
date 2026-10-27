import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  type AuthenticatedGuardian,
  CurrentGuardian,
} from '../../../shared/decorators/current-guardian';
import { ApiAuthenticated } from '../../../shared/swagger/api-docs';
import { MeResponse } from '../dto/me.response';
import { GetMeOutput, GetMeUseCase } from '../use-cases/get-me.use-case';

@ApiTags('me')
@ApiAuthenticated()
@Controller('me')
export class MeController {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Responsável logado e os alunos vinculados a ele',
  })
  @ApiOkResponse({ type: MeResponse })
  me(@CurrentGuardian() guardian: AuthenticatedGuardian): Promise<GetMeOutput> {
    return this.getMeUseCase.execute({ guardianId: guardian.id });
  }
}
