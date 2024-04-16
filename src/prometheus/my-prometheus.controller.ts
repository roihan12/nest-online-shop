import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';
import { Public } from 'src/auth/decorator/public..decorator';
@Controller('prometheus')
export class MyPrometheusControllers extends PrometheusController {
  @Public()
  @Get('')
  async index(@Res({ passthrough: true }) response: Response) {
    return super.index(response);
  }
}
