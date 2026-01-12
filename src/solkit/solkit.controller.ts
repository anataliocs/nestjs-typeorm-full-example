import { Controller } from '@nestjs/common';
import { SolkitService } from './solkit.service';

@Controller('solkit')
export class SolkitController {
  constructor(private readonly solkitService: SolkitService) {}
}
