import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Version,
} from '@nestjs/common';
import { StablecoinsService } from './stablecoins.service';
import { AccountBalanceDto } from './dto/reap/account-balance.dto';
import { CardDto } from './dto/reap/card.dto';
import { CreateCardResponseDto } from './dto/reap/create-card-response.dto';

@Controller('/v1/stablecoins')
export class StablecoinsController {
  constructor(private readonly stablecoinsService: StablecoinsService) {}

  @Version('1')
  @Get('/balance')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getMasterAccountBalance(): Promise<AccountBalanceDto> {
    // Call Service layer to get balance
    return this.stablecoinsService.getMasterAccountBalance();
  }

  @Version('1')
  @Get('/cards')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getCardsByName(): Promise<CardDto[]> {
    // Call Service layer to get cards
    return this.stablecoinsService.getCards();
  }

  @Version('1')
  @Post('/cards')
  @Header('Cache-Control', 'no-store')
  @HttpCode(201)
  createCard(@Body() card: CardDto): Promise<CreateCardResponseDto> {
    return this.stablecoinsService.createCard(card);
  }
}
