import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { TravelService } from './travel.service';
import { TravelRequestDto } from './dto/travel-request.dto';
import { TravelResponseDto } from './dto/travel-response.dto';

@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post()
  async travel(
    @Headers('authorization') authorization: string | undefined,
    @Body() travelRequest: TravelRequestDto,
  ): Promise<TravelResponseDto> {
    const token = this.extractToken(authorization);
    return this.travelService.travel(token, travelRequest);
  }

  private extractToken(authorization?: string): string {
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Missing session token');
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new UnauthorizedException('Missing session token');
    }

    return token;
  }
}

