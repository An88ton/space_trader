import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { Good } from '../entities/good.entity';
import { UserShip } from '../entities/user-ship.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { PlanetMarket } from '../entities/planet-market.entity';
import { ReputationLog } from '../entities/reputation-log.entity';
import { BuyGoodsDto } from './dto/buy-goods.dto';
import { SellGoodsDto } from './dto/sell-goods.dto';
import { LoggedInUserDto } from '../auth/dto/logged-in-user.dto';
import {
  ShipSnapshotDto,
  FuelStatsDto,
  PlayerStatsDto,
  ShipPositionDto,
} from '../auth/dto/logged-in-user.dto';
import {
  shouldPlanetSellGood,
  shouldPlanetBuyGood,
  calculateMarketPrice,
  createMarketEntry,
} from '../utils/market-logic';
import { EventService } from '../events/event.service';

type SessionTokenPayload = {
  sub: number;
  email: string;
  ver?: number;
};

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    @InjectRepository(Planet)
    private readonly planetRepository: Repository<Planet>,
    @InjectRepository(Good)
    private readonly goodRepository: Repository<Good>,
    @InjectRepository(UserShip)
    private readonly userShipRepository: Repository<UserShip>,
    @InjectRepository(PlayerInventory)
    private readonly inventoryRepository: Repository<PlayerInventory>,
    @InjectRepository(PlanetMarket)
    private readonly planetMarketRepository: Repository<PlanetMarket>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly eventService: EventService,
  ) {}

  async verifySessionToken(token: string): Promise<SessionTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<SessionTokenPayload>(
        token,
      );
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired session token');
    }
  }

  async buyGoods(
    token: string,
    buyGoodsDto: BuyGoodsDto,
  ): Promise<LoggedInUserDto> {
    // Verify and extract user from token
    const payload = await this.verifySessionToken(token);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
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

    // Verify player is at the specified planet
    if (currentPlanet.id !== buyGoodsDto.planetId) {
      throw new BadRequestException(
        'You can only buy goods on the planet where you are located',
      );
    }

    // Get the planet
    const planet = await this.planetRepository.findOne({
      where: { id: buyGoodsDto.planetId },
    });

    if (!planet) {
      throw new NotFoundException('Planet not found');
    }

    // Get the good
    const good = await this.goodRepository.findOne({
      where: { id: buyGoodsDto.goodId },
    });

    if (!good) {
      throw new NotFoundException('Good not found');
    }

    // Check if planet should sell this good
    if (!shouldPlanetSellGood(planet, good)) {
      throw new BadRequestException(
        'This good is not available for purchase on this planet',
      );
    }

    // Get or create planet market entry for selling this good
    let marketEntry = await this.planetMarketRepository.findOne({
      where: {
        planet: { id: buyGoodsDto.planetId },
        good: { id: buyGoodsDto.goodId },
        isSelling: true,
      },
      relations: ['planet', 'good'],
    });

    // If market entry doesn't exist, create it
    if (!marketEntry) {
      marketEntry = createMarketEntry(planet, good, true);
      marketEntry = await this.planetMarketRepository.save(marketEntry);
    }

    // Apply market event modifiers
    const currentTurn = 0; // TODO: Implement turn system
    const priceModifier = await this.eventService.getMarketPriceModifier(
      planet.id,
      good.type,
      currentTurn,
    );
    const adjustedPrice = Math.round(marketEntry.price * priceModifier);

    // Calculate total cost
    const totalCost = adjustedPrice * buyGoodsDto.quantity;

    // Check if user has enough credits
    if (user.credits < totalCost) {
      throw new BadRequestException('Insufficient credits');
    }

    // Calculate current cargo usage
    const currentCargoUsage = this.calculateCargoUsage(ship.inventories || []);

    // Check if there's enough cargo capacity
    const availableCargo = ship.cargoCapacity - currentCargoUsage;
    if (availableCargo < buyGoodsDto.quantity) {
      throw new BadRequestException(
        `Insufficient cargo capacity. Available: ${availableCargo}, Required: ${buyGoodsDto.quantity}`,
      );
    }

    // Perform the transaction
    return await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const inventoryRepo = manager.getRepository(PlayerInventory);

      // Deduct credits
      await userRepo.update(
        { id: user.id },
        { credits: user.credits - totalCost },
      );

      // Find or create inventory entry
      let inventory = await inventoryRepo.findOne({
        where: {
          ship: { id: ship.id },
          good: { id: good.id },
        },
        relations: ['ship', 'good'],
      });

      if (inventory) {
        // Update existing inventory
        inventory.quantity += buyGoodsDto.quantity;
        await inventoryRepo.save(inventory);
      } else {
        // Create new inventory entry
        inventory = inventoryRepo.create({
          ship,
          good,
          quantity: buyGoodsDto.quantity,
        });
        await inventoryRepo.save(inventory);
      }

      // Reload user with all relations for response
      const updatedUser = await userRepo.findOne({
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
        throw new NotFoundException('User not found after transaction');
      }

      return this.buildLoggedInUserDto(updatedUser);
    });
  }

  async sellGoods(
    token: string,
    sellGoodsDto: SellGoodsDto,
  ): Promise<LoggedInUserDto> {
    // Verify and extract user from token
    const payload = await this.verifySessionToken(token);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
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

    // Verify player is at the specified planet
    if (currentPlanet.id !== sellGoodsDto.planetId) {
      throw new BadRequestException(
        'You can only sell goods on the planet where you are located',
      );
    }

    // Get the planet
    const planet = await this.planetRepository.findOne({
      where: { id: sellGoodsDto.planetId },
    });

    if (!planet) {
      throw new NotFoundException('Planet not found');
    }

    // Get the good
    const good = await this.goodRepository.findOne({
      where: { id: sellGoodsDto.goodId },
    });

    if (!good) {
      throw new NotFoundException('Good not found');
    }

    // Check if planet should buy this good
    if (!shouldPlanetBuyGood(planet, good)) {
      throw new BadRequestException(
        'This planet does not buy this type of good',
      );
    }

    // Get or create planet market entry for buying this good
    let marketEntry = await this.planetMarketRepository.findOne({
      where: {
        planet: { id: sellGoodsDto.planetId },
        good: { id: sellGoodsDto.goodId },
        isSelling: false,
      },
      relations: ['planet', 'good'],
    });

    // If market entry doesn't exist, create it
    if (!marketEntry) {
      marketEntry = createMarketEntry(planet, good, false);
      marketEntry = await this.planetMarketRepository.save(marketEntry);
    }

    // Apply market event modifiers
    const currentTurn = 0; // TODO: Implement turn system
    const priceModifier = await this.eventService.getMarketPriceModifier(
      planet.id,
      good.type,
      currentTurn,
    );
    const adjustedPrice = Math.round(marketEntry.price * priceModifier);

    // Calculate total credits earned (using adjusted market price)
    const totalCredits = adjustedPrice * sellGoodsDto.quantity;

    // Perform the transaction
    return await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const inventoryRepo = manager.getRepository(PlayerInventory);
      const reputationLogRepo = manager.getRepository(ReputationLog);

      // Check for smuggling crackdown event (inside transaction)
      const activeEvents = await this.eventService.getActiveMarketEvents(
        planet.id,
        currentTurn,
      );
      
      // Check if there's a smuggling crackdown and good is contraband
      const hasSmugglingCrackdown = activeEvents.some(
        (ae) =>
          ae.event.eventCategory === 'smuggling_crackdown' &&
          good.type === 'luxury', // Assuming luxury goods are contraband
      );

      if (hasSmugglingCrackdown) {
        // Apply negative reputation for selling contraband during crackdown
        await userRepo.update(
          { id: user.id },
          { reputation: Math.max(0, user.reputation - 20) },
        );
        
        // Log reputation change
        const reputationLog = reputationLogRepo.create({
          user,
          delta: -20,
          reason: 'Smuggling crackdown: Caught selling contraband',
        });
        await reputationLogRepo.save(reputationLog);
      }

      // Find player inventory entry inside transaction to avoid race conditions
      const inventory = await inventoryRepo.findOne({
        where: {
          ship: { id: ship.id },
          good: { id: good.id },
        },
        relations: ['ship', 'good'],
      });

      if (!inventory || inventory.quantity < sellGoodsDto.quantity) {
        throw new BadRequestException(
          `Insufficient inventory. Available: ${inventory?.quantity ?? 0}, Required: ${sellGoodsDto.quantity}`,
        );
      }

      // Add credits
      await userRepo.update(
        { id: user.id },
        { credits: user.credits + totalCredits },
      );

      // Update inventory
      inventory.quantity -= sellGoodsDto.quantity;
      if (inventory.quantity <= 0) {
        // Remove inventory entry if quantity becomes 0 or less
        await inventoryRepo.remove(inventory);
      } else {
        await inventoryRepo.save(inventory);
      }

      // Reload user with all relations for response
      const updatedUser = await userRepo.findOne({
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
        throw new NotFoundException('User not found after transaction');
      }

      return this.buildLoggedInUserDto(updatedUser);
    });
  }

  async getInventory(token: string): Promise<{
    inventory: Array<{
      good: {
        id: number;
        name: string;
        type: string;
        basePrice: number;
      };
      quantity: number;
    }>;
    cargoUsage: number;
    cargoCapacity: number;
    availableCargo: number;
  }> {
    // Verify and extract user from token
    const payload = await this.verifySessionToken(token);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: {
        userShips: {
          ship: {
            inventories: {
              good: true,
            },
          },
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
    const inventories = ship.inventories || [];
    const cargoUsage = this.calculateCargoUsage(inventories);
    const cargoCapacity = ship.cargoCapacity;

    return {
      inventory: inventories.map((inv) => ({
        good: {
          id: inv.good.id,
          name: inv.good.name,
          type: inv.good.type,
          basePrice: inv.good.basePrice,
        },
        quantity: inv.quantity,
      })),
      cargoUsage,
      cargoCapacity,
      availableCargo: cargoCapacity - cargoUsage,
    };
  }

  private calculateCargoUsage(
    inventories: PlayerInventory[],
  ): number {
    return inventories.reduce((total, inv) => total + inv.quantity, 0);
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

  private buildLoggedInUserDto(user: User): LoggedInUserDto {
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

    const stats: PlayerStatsDto = {
      credits: user.credits,
      reputation: user.reputation,
      cargoCapacity: activeShip?.cargoCapacity ?? null,
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

