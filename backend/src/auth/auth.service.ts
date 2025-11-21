import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { UserShip } from '../entities/user-ship.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisteredUserDto } from './dto/registered-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {
  FuelStatsDto,
  LoggedInUserDto,
  PlayerStatsDto,
  ShipSnapshotDto,
  ShipPositionDto,
} from './dto/logged-in-user.dto';
import { JwtService } from '@nestjs/jwt';
import { SessionDto } from './dto/session.dto';
import { Planet } from '../entities/planet.entity';

type SessionTokenPayload = {
  sub: number;
  email: string;
  ver?: number;
};

const STARTING_SHIP_BLUEPRINT = {
  name: 'Founders Shuttle',
  level: 1,
  price: 0,
  cargoCapacity: 25,
  fuelCapacity: 75,
  speed: 6,
} as const;

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;
  private readonly startingPlanetName: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    this.startingPlanetName =
      process.env.STARTING_PLANET_NAME?.trim() || 'Alpha Prime';
  }

  async register({
    email: rawEmail,
    password: rawPassword,
  }: RegisterUserDto): Promise<RegisteredUserDto> {
    const email = this.normalizeEmailInput(rawEmail);
    const password = this.ensureString(
      rawPassword,
      'Password must be a string',
    );
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    const username = await this.generateUniqueUsername(email);

    const user = this.userRepository.create({
      email,
      passwordHash,
      username,
    });

    const savedUser = await this.userRepository.manager.transaction(
      async (manager) => {
        const transactionalUserRepository = manager.getRepository(User);
        const persistedUser = await transactionalUserRepository.save(user);
        await this.assignStarterShip(persistedUser, manager);
        return persistedUser;
      },
    );

    return {
      id: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      createdAt: savedUser.createdAt,
    };
  }

  async login({
    email: rawEmail,
    password: rawPassword,
  }: LoginUserDto): Promise<SessionDto> {
    const email = this.normalizeEmailInput(rawEmail);
    const password = this.ensureString(
      rawPassword,
      'Password must be a string',
    );
    const user = await this.userRepository.findOne({
      where: { email },
      relations: {
        userShips: {
          ship: true,
          currentPlanet: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildSessionDto(user);
  }

  async resumeSession(token: string): Promise<SessionDto> {
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
    const authenticatedUser = this.ensureSessionIsCurrent(user, payload);

    return this.buildSessionDto(authenticatedUser);
  }

  async logout(token: string): Promise<{ success: true }> {
    const payload = await this.verifySessionToken(token);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    const authenticatedUser = this.ensureSessionIsCurrent(user, payload);

    authenticatedUser.sessionVersion =
      this.resolveTokenVersion(authenticatedUser.sessionVersion) + 1;

    await this.userRepository.save(authenticatedUser);

    return { success: true };
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const localPart = email.split('@')[0];
    const sanitizedBase =
      localPart
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase()
        .slice(0, 18) || 'captain';

    let candidate = sanitizedBase;
    let attempts = 0;

    while (
      await this.userRepository.findOne({ where: { username: candidate } })
    ) {
      const suffix = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(2, '0');
      const trimmedBase = sanitizedBase.slice(
        0,
        Math.max(1, 18 - suffix.length),
      );
      candidate = `${trimmedBase}-${suffix}`;
      attempts += 1;

      if (attempts > 50) {
        candidate = `captain-${randomUUID().slice(0, 6)}`;
      }
    }

    return candidate;
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
      position: this.buildShipPositionDto(activeAssignment),
    };
  }

  private buildSessionDto(user: User): SessionDto {
    const sessionVersion = this.resolveTokenVersion(user.sessionVersion);
    const payload = { sub: user.id, email: user.email, ver: sessionVersion };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.buildLoggedInUserDto(user),
    };
  }

  private normalizeEmailInput(email: unknown): string {
    const stringEmail = this.ensureString(email, 'Email must be a string');
    return stringEmail.trim().toLowerCase();
  }

  private ensureString(value: unknown, message: string): string {
    if (typeof value !== 'string') {
      throw new BadRequestException(message);
    }
    return value;
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
    user: User | null,
    payload: SessionTokenPayload,
  ): User {
    if (!user) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const tokenVersion = this.resolveTokenVersion(payload.ver);
    if (this.resolveTokenVersion(user.sessionVersion) !== tokenVersion) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    return user;
  }

  private resolveTokenVersion(version: unknown): number {
    return typeof version === 'number' &&
      Number.isFinite(version) &&
      version >= 0
      ? Math.floor(version)
      : 0;
  }

  private resolveActiveShip(user: User): Ship | null {
    return this.resolveActiveAssignment(user)?.ship ?? null;
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

  private buildShipPositionDto(
    assignment: (UserShip & { currentPlanet?: Planet | null }) | null,
  ): ShipPositionDto | null {
    const planetCandidate: Planet | null = assignment?.currentPlanet ?? null;
    if (!planetCandidate) {
      return null;
    }

    const planet = planetCandidate;
    const hasHex =
      typeof planet.hexQ === 'number' && typeof planet.hexR === 'number';

    return {
      planetId: planet.id,
      planetName: planet.name,
      hex: hasHex
        ? {
            q: planet.hexQ as number,
            r: planet.hexR as number,
          }
        : null,
    };
  }

  private async assignStarterShip(
    user: User,
    manager: EntityManager,
  ): Promise<void> {
    const shipRepository = manager.getRepository(Ship);
    const planetRepository = manager.getRepository(Planet);
    const userShipRepository = manager.getRepository(UserShip);

    const startingPlanet = await this.resolveStartingPlanet(planetRepository);

    const starterShip = shipRepository.create({
      name: STARTING_SHIP_BLUEPRINT.name,
      level: STARTING_SHIP_BLUEPRINT.level,
      price: STARTING_SHIP_BLUEPRINT.price,
      cargoCapacity: STARTING_SHIP_BLUEPRINT.cargoCapacity,
      fuelCapacity: STARTING_SHIP_BLUEPRINT.fuelCapacity,
      fuelCurrent: STARTING_SHIP_BLUEPRINT.fuelCapacity,
      speed: STARTING_SHIP_BLUEPRINT.speed,
    });

    const savedShip = await shipRepository.save(starterShip);

    const assignment = userShipRepository.create({
      user,
      ship: savedShip,
      isActive: true,
      currentPlanet: startingPlanet,
    });

    await userShipRepository.save(assignment);
  }

  private async resolveStartingPlanet(
    planetRepository: Repository<Planet>,
  ): Promise<Planet> {
    const preferredPlanet = await planetRepository.findOne({
      where: { name: this.startingPlanetName },
    });

    if (preferredPlanet) {
      return preferredPlanet;
    }

    const [fallbackPlanet] = await planetRepository.find({
      take: 1,
      order: { id: 'ASC' },
    });

    if (!fallbackPlanet) {
      throw new BadRequestException(
        'Unable to assign a starting location. No planets exist.',
      );
    }

    return fallbackPlanet;
  }
}
