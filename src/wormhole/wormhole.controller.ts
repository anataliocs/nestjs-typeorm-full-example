import { Controller } from '@nestjs/common';
import { WormholeService } from './wormhole.service';

@Controller('wormhole')
export class WormholeController {
  constructor(private readonly wormholeService: WormholeService) {}
}
