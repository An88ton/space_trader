import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Query,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventService } from './event.service';
import { JwtService } from '@nestjs/jwt';
import { EventResponseDto } from './dto/event-response.dto';
import type { EventChoiceRequestDto } from './dto/event-choice.dto';
import { EventChoiceResponseDto } from './dto/event-choice.dto';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { UserShip } from '../entities/user-ship.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { CargoItemDto } from '../auth/dto/logged-in-user.dto';

type SessionTokenPayload = {
  sub: number;
  email: string;
  ver?: number;
};

@Controller('events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    @InjectRepository(UserShip)
    private readonly userShipRepository: Repository<UserShip>,
    @InjectRepository(PlayerInventory)
    private readonly inventoryRepository: Repository<PlayerInventory>,
  ) {}

  private async verifySessionToken(
    token: string,
  ): Promise<SessionTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<SessionTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session token');
    }
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

  @Get('travel')
  async getTravelEvents(
    @Headers('authorization') authorization: string | undefined,
  ): Promise<EventResponseDto[]> {
    const token = this.extractToken(authorization);
    await this.verifySessionToken(token);

    const events = await this.eventService.getTravelEvents();
    return events.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description || null,
      eventType: event.eventType,
      eventCategory: event.eventCategory,
      reputationChange: event.reputationChange,
      occurredAt: new Date(), // Not applicable for template events
    }));
  }

  @Get('active')
  async getActiveEvents(
    @Headers('authorization') authorization: string | undefined,
    @Query('planetId') planetId?: string,
    @Query('turn') turn?: string,
  ): Promise<EventResponseDto[]> {
    const token = this.extractToken(authorization);
    await this.verifySessionToken(token);

    const currentTurn = turn ? parseInt(turn, 10) : 0;
    const planetIdNum = planetId ? parseInt(planetId, 10) : null;

    const activeEvents = await this.eventService.getActiveMarketEvents(
      planetIdNum,
      currentTurn,
    );

    return activeEvents.map((activeEvent) => ({
      id: activeEvent.event.id,
      name: activeEvent.event.name,
      description: activeEvent.event.description || null,
      eventType: activeEvent.event.eventType,
      eventCategory: activeEvent.event.eventCategory,
      reputationChange: activeEvent.event.reputationChange,
      occurredAt: activeEvent.createdAt,
    }));
  }

  @Post('choice')
  async submitEventChoice(
    @Headers('authorization') authorization: string | undefined,
    @Body() choiceRequest: EventChoiceRequestDto,
  ): Promise<EventChoiceResponseDto> {
    const token = this.extractToken(authorization);
    const payload = await this.verifySessionToken(token);

    // Load user and ship
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: {
        userShips: {
          ship: true,
          currentPlanet: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userActiveAssignment = user.userShips?.find(
      (us) => us.isActive && us.ship,
    );

    if (!userActiveAssignment || !userActiveAssignment.ship) {
      throw new BadRequestException('No active ship found');
    }

    const ship = userActiveAssignment.ship;

    // Apply choice in transaction to ensure data consistency
    const result = await this.userRepository.manager.transaction(
      async (manager) => {
        return await this.eventService.applyEventChoice(
          choiceRequest.eventId,
          choiceRequest.choiceId,
          user,
          ship,
          choiceRequest.travelLogId || null,
          manager,
        );
      },
    );

    // Reload user to get updated state after choice is applied
    const updatedUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: {
        userShips: {
          ship: {
            inventories: {
              good: true,
            },
          },
          currentPlanet: true,
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found after choice application');
    }

    // Build simplified user DTO for response
    const updatedActiveAssignment = updatedUser.userShips?.find(
      (us) => us.isActive && us.ship,
    );
    const activeShip = updatedActiveAssignment?.ship ?? null;

    // Load cargo inventory
    let cargoUsed = 0;
    const cargoItems: CargoItemDto[] = [];

    if (activeShip) {
      // Use already-loaded inventories if available
      const inventories =
        activeShip.inventories && Array.isArray(activeShip.inventories)
          ? activeShip.inventories
          : await this.inventoryRepository.find({
              where: { ship: { id: activeShip.id } },
              relations: ['good'],
            });

      cargoItems.push(
        ...inventories
          .filter((inv) => inv.quantity > 0)
          .map((inv) => {
            cargoUsed += inv.quantity;
            return {
              goodId: inv.good.id,
              goodName: inv.good.name,
              quantity: inv.quantity,
            };
          }),
      );
    }

    const userDto = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      rank: updatedUser.rank,
      reputation: updatedUser.reputation,
      credits: updatedUser.credits,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      ship: activeShip
        ? {
            id: activeShip.id,
            name: activeShip.name,
            level: activeShip.level,
            price: activeShip.price,
            cargoCapacity: activeShip.cargoCapacity,
            fuelCapacity: activeShip.fuelCapacity,
            fuelCurrent: activeShip.fuelCurrent,
            speed: activeShip.speed,
            acquiredAt: activeShip.acquiredAt,
          }
        : null,
      stats: {
        credits: updatedUser.credits,
        reputation: updatedUser.reputation,
        cargoCapacity: activeShip?.cargoCapacity ?? null,
        cargoUsed,
        cargoItems,
        fuel: activeShip
          ? {
              current: activeShip.fuelCurrent,
              capacity: activeShip.fuelCapacity,
              percentage:
                activeShip.fuelCapacity > 0
                  ? Math.round(
                      (activeShip.fuelCurrent / activeShip.fuelCapacity) * 100,
                    )
                  : 0,
            }
          : {
              current: null,
              capacity: null,
              percentage: null,
            },
      },
      position: updatedActiveAssignment?.currentPlanet
        ? {
            planetId: updatedActiveAssignment.currentPlanet.id,
            planetName: updatedActiveAssignment.currentPlanet.name,
            hex:
              typeof updatedActiveAssignment.currentPlanet.hexQ === 'number' &&
              typeof updatedActiveAssignment.currentPlanet.hexR === 'number'
                ? {
                    q: updatedActiveAssignment.currentPlanet.hexQ,
                    r: updatedActiveAssignment.currentPlanet.hexR,
                  }
                : null,
          }
        : null,
    };

    return {
      success: true,
      message: result.description,
      eventResult: {
        fuelModifier: result.fuelModifier,
        cargoLost: result.cargoLost,
        creditsLost: result.creditsLost,
        reputationChange: result.reputationChange,
        description: result.description,
      },
      user: userDto,
    };
  }
}
