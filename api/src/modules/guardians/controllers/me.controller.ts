import { Controller, Get } from '@nestjs/common';
import {
  type AuthenticatedGuardian,
  CurrentGuardian,
} from '../../../shared/decorators/current-guardian';
import { GetMeOutput, GetMeUseCase } from '../use-cases/get-me.use-case';

@Controller('me')
export class MeController {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  @Get()
  me(@CurrentGuardian() guardian: AuthenticatedGuardian): Promise<GetMeOutput> {
    return this.getMeUseCase.execute({ guardianId: guardian.id });
  }
}
