import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { UserShip } from '../entities/user-ship.entity';
import { TravelLog } from '../entities/travel-log.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { Event } from '../entities/event.entity';
import { TravelRequestDto } from './dto/travel-request.dto';
import { TravelResponseDto, TravelLogDto, TravelEventResultDto, TravelEventDto } from './dto/travel-response.dto';
import { hexDistance, HexCoordinate } from '../utils/hex-coordinates';
import { getDockingFeeMultiplier, calculateRank } from '../utils/rank-utils';
import { JwtService } from '@nestjs/jwt';
import {
  CargoItemDto,
  LoggedInUserDto,
  ShipSnapshotDto,
  FuelStatsDto,
  PlayerStatsDto,
  ShipPositionDto,
} from '../auth/dto/logged-in-user.dto';
import { EventService } from '../events/event.service';

type SessionTokenPayload = {
  sub: number;
  email: string;
  ver?: number;
};

@Injectable()
export class TravelService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    @InjectRepository(Planet)
    private readonly planetRepository: Repository<Planet>,
    @InjectRepository(UserShip)
    private readonly userShipRepository: Repository<UserShip>,
    @InjectRepository(TravelLog)
    private readonly travelLogRepository: Repository<TravelLog>,
    @InjectRepository(PlayerInventory)
    private readonly inventoryRepository: Repository<PlayerInventory>,
    private readonly jwtService: JwtService,
    private readonly eventService: EventService,
  ) {}

  async travel(
    token: string,
    travelRequest: TravelRequestDto,
  ): Promise<TravelResponseDto> {
    // Verify and extract user from token
    const payload = await this.verifySessionToken(token);
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
      throw new UnauthorizedException('User not found');
    }

    // Verify session is current
    this.ensureSessionIsCurrent(user, payload);

    // Get active ship assignment
    const activeAssignment = this.resolveActiveAssignment(user);
    if (!activeAssignment || !activeAssignment.ship) {
      throw new BadRequestException('No active ship found');
    }

    const ship = activeAssignment.ship;
    const currentPlanet = activeAssignment.currentPlanet;

    if (!currentPlanet) {
      throw new BadRequestException('Ship is not currently at a planet');
    }

    // Get destination planet
    const destinationPlanet = await this.planetRepository.findOne({
      where: { id: travelRequest.destinationPlanetId },
    });

    if (!destinationPlanet) {
      throw new NotFoundException('Destination planet not found');
    }

    if (destinationPlanet.id === currentPlanet.id) {
      throw new BadRequestException('Already at destination planet');
    }

    // Validate hex coordinates exist
    if (
      currentPlanet.hexQ === null ||
      currentPlanet.hexR === null ||
      destinationPlanet.hexQ === null ||
      destinationPlanet.hexR === null
    ) {
      throw new BadRequestException(
        'Planets must have valid hex coordinates to travel',
      );
    }

    // Calculate distance and fuel required
    const from: HexCoordinate = {
      q: currentPlanet.hexQ,
      r: currentPlanet.hexR,
    };
    const to: HexCoordinate = {
      q: destinationPlanet.hexQ,
      r: destinationPlanet.hexR,
    };
    const distance = hexDistance(from, to);
    const fuelRequired = distance; // 1 fuel per hex distance

    // Check if ship has enough fuel
    if (ship.fuelCurrent < fuelRequired) {
      throw new BadRequestException(
        `Insufficient fuel. Need ${fuelRequired}, have ${ship.fuelCurrent}`,
      );
    }

    // Calculate docking fee with rank-based discount
    // Calculate rank dynamically from current reputation to ensure it's up-to-date
    const currentRank = calculateRank(user.reputation);
    const baseDockingFee = destinationPlanet.dockingFee;
    const discountMultiplier = getDockingFeeMultiplier(currentRank);
    const dockingFee = Math.floor(baseDockingFee * discountMultiplier);

    if (user.credits < dockingFee) {
      throw new BadRequestException(
        `Insufficient credits for docking fee. Need ${dockingFee}, have ${user.credits}`,
      );
    }

    // Perform travel in transaction
    return await this.userRepository.manager.transaction(
      async (manager) => {
        // Update user rank if it's out of sync with reputation
        if (user.rank !== currentRank) {
          user.rank = currentRank;
        }
        // Deduct docking fee from user credits
        user.credits -= dockingFee;
        await manager.getRepository(User).save(user);

        // Generate travel event (deterministic)
        const travelTurn = 0; // TODO: Implement turn system
        const eventResult = await this.eventService.generateTravelEvent(
          user,
          ship,
          currentPlanet,
          destinationPlanet,
          travelTurn,
          manager,
        );

        // Apply fuel modifier from event (only if event doesn't require a choice)
        // If it requires a choice, fuel will be applied when choice is submitted
        const actualFuelUsed = eventResult.requiresChoice
          ? fuelRequired
          : Math.floor(fuelRequired * eventResult.fuelModifier);
        ship.fuelCurrent = Math.max(0, ship.fuelCurrent - actualFuelUsed);
        await manager.getRepository(Ship).save(ship);

        // Update ship position
        activeAssignment.currentPlanet = destinationPlanet;
        await manager.getRepository(UserShip).save(activeAssignment);

        // Create travel log
        const travelLog = manager.getRepository(TravelLog).create({
          ship,
          originPlanet: currentPlanet,
          destinationPlanet,
          distance,
          fuelUsed: actualFuelUsed,
          travelTurn,
          event: eventResult.event || undefined,
        });

        const savedTravelLog = await manager
          .getRepository(TravelLog)
          .save(travelLog);

        // Log event occurrence (only if it doesn't require a choice)
        // Choices will be logged when the choice is submitted
        if (!eventResult.requiresChoice) {
          await this.eventService.logEvent(
            eventResult.event,
            user,
            savedTravelLog,
            eventResult,
            manager,
          );

          // Update user credits if event caused credit loss
          if (eventResult.creditsLost > 0) {
            user.credits -= eventResult.creditsLost;
            await manager.getRepository(User).save(user);
          }
        }

        // Reload user with updated relations
        const updatedUser = await manager.getRepository(User).findOne({
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
          throw new Error('Failed to reload user after travel');
        }

        // Build response
        const travelLogDto: TravelLogDto = {
          id: savedTravelLog.id,
          distance: savedTravelLog.distance,
          fuelUsed: savedTravelLog.fuelUsed,
          travelTurn: savedTravelLog.travelTurn,
          completedAt: savedTravelLog.completedAt,
          originPlanetId: currentPlanet.id,
          originPlanetName: currentPlanet.name,
          destinationPlanetId: destinationPlanet.id,
          destinationPlanetName: destinationPlanet.name,
        };

        const userDto = await this.buildLoggedInUserDto(updatedUser);

        // Build event message
        let eventMessage = '';
        if (eventResult.event) {
          eventMessage = ` ${eventResult.description}`;
          if (eventResult.cargoLost > 0) {
            eventMessage += ` Lost ${eventResult.cargoLost} cargo.`;
          }
          if (eventResult.creditsLost > 0) {
            eventMessage += ` Lost ${eventResult.creditsLost} credits.`;
          }
          if (eventResult.reputationChange !== 0) {
            eventMessage += ` Reputation ${eventResult.reputationChange > 0 ? '+' : ''}${eventResult.reputationChange}.`;
          }
        }

        // Load event with choices if it requires a choice
        let eventWithChoices = eventResult.event;
        if (eventResult.requiresChoice && eventResult.event) {
          eventWithChoices = await manager.getRepository(Event).findOne({
            where: { id: eventResult.event.id },
            relations: ['choices'],
          });
        }

        // Build event result DTO
        const eventResultDto: TravelEventResultDto | null = eventResult.event
          ? {
              event: {
                id: eventResult.event.id,
                name: eventResult.event.name,
                description: eventResult.event.description || null,
                eventType: eventResult.event.eventType,
                eventCategory: eventResult.event.eventCategory,
                reputationChange: eventResult.event.reputationChange,
              },
              fuelModifier: eventResult.fuelModifier,
              cargoLost: eventResult.cargoLost,
              creditsLost: eventResult.creditsLost,
              reputationChange: eventResult.reputationChange,
              description: eventResult.description,
              requiresChoice: eventResult.requiresChoice || false,
              choices: eventWithChoices?.choices
                ?.sort((a, b) => a.sortOrder - b.sortOrder)
                .map((choice) => ({
                  id: choice.id,
                  label: choice.label,
                  description: choice.description || null,
                })),
              travelLogId: savedTravelLog.id,
            }
          : null;

        return {
          success: true,
          message: `Successfully traveled from ${currentPlanet.name} to ${destinationPlanet.name}. Docking fee: ${dockingFee} credits.${eventMessage}`,
          travelLog: travelLogDto,
          user: userDto,
          event: eventResultDto,
        };
      },
    );
  }

  private async verifySessionToken(
    token: string,
  ): Promise<SessionTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<SessionTokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session token');
    }
  }

  private ensureSessionIsCurrent(
    user: User,
    payload: SessionTokenPayload,
  ): void {
    const tokenVersion = this.resolveTokenVersion(payload.ver);
    if (this.resolveTokenVersion(user.sessionVersion) !== tokenVersion) {
      throw new UnauthorizedException('Session is no longer valid');
    }
  }

  private resolveTokenVersion(version: unknown): number {
    return typeof version === 'number' &&
      Number.isFinite(version) &&
      version >= 0
      ? Math.floor(version)
      : 0;
  }

  private resolveActiveAssignment(user: User): UserShip | null {
    const relations: unknown = user.userShips;
    const assignments: UserShip[] = Array.isArray(relations)
      ? (relations as UserShip[])
      : [];
    const activeAssignment = assignments.find(
      (userShip) => userShip.isActive && userShip.ship,
    );

    return activeAssignment ?? null;
  }

  private async buildLoggedInUserDto(user: User): Promise<LoggedInUserDto> {
    const activeAssignment = this.resolveActiveAssignment(user);
    const activeShip = activeAssignment?.ship ?? null;
    let ship: ShipSnapshotDto | null = null;

    if (activeShip) {
      const pricedShip = activeShip as Ship & {
        level: number;
        price: number;
      };

      const snapshot = {
        id: pricedShip.id,
        name: pricedShip.name,
        level: pricedShip.level,
        price: pricedShip.price,
        cargoCapacity: pricedShip.cargoCapacity,
        fuelCapacity: pricedShip.fuelCapacity,
        fuelCurrent: pricedShip.fuelCurrent,
        speed: pricedShip.speed,
        acquiredAt: pricedShip.acquiredAt,
      } satisfies ShipSnapshotDto;

      ship = snapshot;
    }

    const fuelStats: FuelStatsDto = activeShip
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
        };

    // Load cargo inventory for the active ship
    let cargoUsed = 0;
    const cargoItems: CargoItemDto[] = [];

    if (activeShip) {
      // Check if inventories are already loaded on the ship object
      let inventories: PlayerInventory[] = [];

      if (activeShip.inventories && Array.isArray(activeShip.inventories)) {
        // Use already-loaded inventories
        inventories = activeShip.inventories;
      } else {
        // Query inventories if not already loaded
        inventories = await this.inventoryRepository.find({
          where: { ship: { id: activeShip.id } },
          relations: ['good'],
        });
      }

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

    const stats: PlayerStatsDto = {
      credits: user.credits,
      reputation: user.reputation,
      rank: user.rank,
      cargoCapacity: activeShip?.cargoCapacity ?? null,
      cargoUsed,
      cargoItems,
      fuel: fuelStats,
    };

    const planetCandidate: Planet | null = activeAssignment?.currentPlanet ?? null;
    const position: ShipPositionDto | null = planetCandidate
      ? {
          planetId: planetCandidate.id,
          planetName: planetCandidate.name,
          hex:
            typeof planetCandidate.hexQ === 'number' &&
            typeof planetCandidate.hexR === 'number'
              ? {
                  q: planetCandidate.hexQ,
                  r: planetCandidate.hexR,
                }
              : null,
        }
      : null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      rank: user.rank,
      reputation: user.reputation,
      credits: user.credits,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ship,
      stats,
      position,
    };
  }
}

