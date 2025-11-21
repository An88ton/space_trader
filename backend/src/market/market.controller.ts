import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { BuyGoodsDto } from './dto/buy-goods.dto';
import { SellGoodsDto } from './dto/sell-goods.dto';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Post('buy')
  async buyGoods(
    @Headers('authorization') authHeader: string | undefined,
    @Body() buyGoodsDto: BuyGoodsDto,
  ) {
    const token = this.extractToken(authHeader);
    return this.marketService.buyGoods(token, buyGoodsDto);
  }

  @Post('sell')
  async sellGoods(
    @Headers('authorization') authHeader: string | undefined,
    @Body() sellGoodsDto: SellGoodsDto,
  ) {
    const token = this.extractToken(authHeader);
    return this.marketService.sellGoods(token, sellGoodsDto);
  }

  @Get('inventory')
  async getInventory(
    @Headers('authorization') authHeader: string | undefined,
  ) {
    const token = this.extractToken(authHeader);
    return this.marketService.getInventory(token);
  }

  private extractToken(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new BadRequestException('Authorization header is required');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new BadRequestException(
        'Authorization header must be in format: Bearer <token>',
      );
    }

    return parts[1];
  }
}

