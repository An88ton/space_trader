import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ShipyardService } from './shipyard.service';
import { BuyShipDto } from './dto/buy-ship.dto';
import { SellShipDto } from './dto/sell-ship.dto';

@Controller('shipyard')
export class ShipyardController {
  constructor(private readonly shipyardService: ShipyardService) {}

  @Get('ships')
  async getAvailableShips() {
    return this.shipyardService.getAvailableShips();
  }

  @Get('my-ships')
  async getUserShips(@Headers('authorization') authHeader: string | undefined) {
    const token = this.extractToken(authHeader);
    return this.shipyardService.getUserShips(token);
  }

  @Post('buy')
  async buyShip(
    @Headers('authorization') authHeader: string | undefined,
    @Body() buyShipDto: BuyShipDto,
  ) {
    const token = this.extractToken(authHeader);
    return this.shipyardService.buyShip(token, buyShipDto);
  }

  @Post('sell')
  async sellShip(
    @Headers('authorization') authHeader: string | undefined,
    @Body() sellShipDto: SellShipDto,
  ) {
    const token = this.extractToken(authHeader);
    return this.shipyardService.sellShip(token, sellShipDto);
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

