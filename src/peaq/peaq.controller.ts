import { Controller } from '@nestjs/common';
import { PeaqService } from './peaq.service';

@Controller('peaq')
export class PeaqController {
  constructor(private readonly peaqService: PeaqService) {}
}
