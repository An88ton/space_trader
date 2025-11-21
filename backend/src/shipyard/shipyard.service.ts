import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { UserShip } from '../entities/user-ship.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { BuyShipDto } from './dto/buy-ship.dto';
import { SellShipDto } from './dto/sell-ship.dto';
import { ShipyardShipDto } from './dto/shipyard-ship.dto';
import { UserShipDto } from './dto/user-ship.dto';
import { LoggedInUserDto } from '../auth/dto/logged-in-user.dto';
import {
  CargoItemDto,
  ShipSnapshotDto,
  FuelStatsDto,
  PlayerStatsDto,
  ShipPositionDto,
} from '../auth/dto/logged-in-user.dto';

type SessionTokenPayload = {
  sub: number;
  email: string;
  ver?: number;
};

@Injectable()
export class ShipyardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ship)
    private readonly shipRepository: Repository<Ship>,
    @InjectRepository(Planet)
    private readonly planetRepository: Repository<Planet>,
    @InjectRepository(UserShip)
    private readonly userShipRepository: Repository<UserShip>,
    @InjectRepository(PlayerInventory)
    private readonly inventoryRepository: Repository<PlayerInventory>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
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

  async getAvailableShips(): Promise<ShipyardShipDto[]> {
    const ships = await this.shipRepository.find({
      order: { level: 'ASC', price: 'ASC' },
    });

    return ships.map((ship) => ({
      id: ship.id,
      name: ship.name,
      level: ship.level,
      price: ship.price,
      cargoCapacity: ship.cargoCapacity,
      fuelCapacity: ship.fuelCapacity,
      speed: ship.speed,
    }));
  }

  async getUserShips(token: string): Promise<UserShipDto[]> {
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

    this.ensureSessionIsCurrent(user, payload);

    const userShips = user.userShips || [];

    return userShips.map((userShip) => ({
      id: userShip.id,
      ship: {
        id: userShip.ship.id,
        name: userShip.ship.name,
        level: userShip.ship.level,
        price: userShip.ship.price,
        cargoCapacity: userShip.ship.cargoCapacity,
        fuelCapacity: userShip.ship.fuelCapacity,
        fuelCurrent: userShip.ship.fuelCurrent,
        speed: userShip.ship.speed,
        acquiredAt: userShip.ship.acquiredAt,
      },
      isActive: userShip.isActive,
      acquiredAt: userShip.acquiredAt,
      currentPlanet: userShip.currentPlanet
        ? {
            id: userShip.currentPlanet.id,
            name: userShip.currentPlanet.name,
          }
        : null,
    }));
  }

  async buyShip(token: string, buyShipDto: BuyShipDto): Promise<LoggedInUserDto> {
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

    this.ensureSessionIsCurrent(user, payload);

    // Get the ship to buy
    const shipToBuy = await this.shipRepository.findOne({
      where: { id: buyShipDto.shipId },
    });

    if (!shipToBuy) {
      throw new NotFoundException('Ship not found');
    }

    // Verify user has enough credits
    if (user.credits < shipToBuy.price) {
      throw new BadRequestException(
        `Insufficient credits. Need ${shipToBuy.price}, have ${user.credits}`,
      );
    }

    // Get active assignment (if user has an active ship)
    const activeAssignment = this.resolveActiveAssignment(user);
    
    // Get current planet - either from active ship or verify planetId directly
    let currentPlanet: Planet | null = null;
    if (activeAssignment?.currentPlanet) {
      currentPlanet = activeAssignment.currentPlanet;
    } else {
      // If no active ship, get planet from the provided planetId
      currentPlanet = await this.planetRepository.findOne({
        where: { id: buyShipDto.planetId },
      });
      if (!currentPlanet) {
        throw new NotFoundException('Planet not found');
      }
    }

    // Verify user is at the specified planet (if they have an active ship)
    if (activeAssignment && currentPlanet.id !== buyShipDto.planetId) {
      throw new BadRequestException(
        'You can only buy ships at the planet where you are located',
      );
    }

    // Check if old active ship has cargo (if there is an active ship)
    const oldActiveShip = activeAssignment?.ship;
    if (oldActiveShip) {
      const inventories = await this.inventoryRepository.find({
        where: { ship: { id: oldActiveShip.id } },
        relations: ['good'],
      });
      const hasCargo = inventories.some((inv) => inv.quantity > 0);
      if (hasCargo) {
        throw new BadRequestException(
          'Cannot buy a new ship while your current ship has cargo. Please unload all cargo first.',
        );
      }
    }

    // Perform transaction
    return await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const shipRepo = manager.getRepository(Ship);
      const userShipRepo = manager.getRepository(UserShip);
      const inventoryRepo = manager.getRepository(PlayerInventory);

      // Delete old active ship if it exists
      if (activeAssignment) {
        // Delete all inventories for the old ship (should be empty, but clean up anyway)
        await inventoryRepo.delete({
          ship: { id: activeAssignment.ship.id },
        });

        // Delete the user-ship relationship
        await userShipRepo.remove(activeAssignment);

        // Delete the old ship instance
        await shipRepo.remove(activeAssignment.ship);
      }

      // Deduct credits
      await userRepo.update(
        { id: user.id },
        { credits: user.credits - shipToBuy.price },
      );

      // Create a new ship instance for the user
      const newShip = shipRepo.create({
        name: shipToBuy.name,
        level: shipToBuy.level,
        price: shipToBuy.price,
        cargoCapacity: shipToBuy.cargoCapacity,
        fuelCapacity: shipToBuy.fuelCapacity,
        fuelCurrent: shipToBuy.fuelCapacity, // Start with full fuel
        speed: shipToBuy.speed,
      });

      const savedShip = await shipRepo.save(newShip);

      // Create user-ship relationship (set as active since it's replacing the old one)
      const userShip = userShipRepo.create({
        user,
        ship: savedShip,
        isActive: true, // New ship becomes the active one
        currentPlanet: currentPlanet,
      });

      await userShipRepo.save(userShip);

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

      // Build and return the LoggedInUserDto
      return await this.buildLoggedInUserDto(updatedUser);
    });
  }

  async sellShip(token: string, sellShipDto: SellShipDto): Promise<LoggedInUserDto> {
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

    this.ensureSessionIsCurrent(user, payload);

    // Get the user ship to sell
    const userShipToSell = await this.userShipRepository.findOne({
      where: {
        id: sellShipDto.userShipId,
        user: { id: user.id },
      },
      relations: {
        ship: {
          inventories: {
            good: true,
          },
        },
        currentPlanet: true,
      },
    });

    if (!userShipToSell) {
      throw new NotFoundException('Ship not found or you do not own this ship');
    }

    // Cannot sell the active ship
    if (userShipToSell.isActive) {
      throw new BadRequestException(
        'Cannot sell your active ship. Please activate another ship first.',
      );
    }

    // Check if ship has cargo
    const inventories = userShipToSell.ship.inventories || [];
    const hasCargo = inventories.some((inv) => inv.quantity > 0);

    if (hasCargo) {
      throw new BadRequestException(
        'Cannot sell ship with cargo. Please unload all cargo first.',
      );
    }

    // Calculate sell price (50% of purchase price)
    const sellPrice = Math.floor(userShipToSell.ship.price * 0.5);

    // Perform transaction
    return await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const userShipRepo = manager.getRepository(UserShip);
      const shipRepo = manager.getRepository(Ship);

      // Add credits
      await userRepo.update(
        { id: user.id },
        { credits: user.credits + sellPrice },
      );

      // Delete user-ship relationship
      await userShipRepo.remove(userShipToSell);

      // Delete the ship instance
      await shipRepo.remove(userShipToSell.ship);

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

      // Build and return the LoggedInUserDto
      return await this.buildLoggedInUserDto(updatedUser);
    });
  }

  private async buildLoggedInUserDto(
    user: User,
  ): Promise<LoggedInUserDto> {
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
}

