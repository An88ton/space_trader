/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { UserShip } from '../entities/user-ship.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: { sign: jest.Mock; verifyAsync: jest.Mock };
  let transactionManager: { getRepository: jest.Mock };
  let transactionSpy: jest.Mock;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verifyAsync: jest.fn(),
    };

    transactionManager = {
      getRepository: jest.fn(),
    };
    transactionSpy = jest
      .fn()
      .mockImplementation(
        (callback: (manager: typeof transactionManager) => Promise<unknown>) =>
          callback(transactionManager),
      );
    (userRepository as unknown as { manager: { transaction: jest.Mock } }).manager = {
      transaction: transactionSpy,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('registers a new user with hashed password', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    userRepository.findOne
      .mockResolvedValueOnce(null) // email lookup
      .mockResolvedValueOnce(null); // username lookup

    const unsavedUser = {
      email: 'pilot@example.com',
      username: 'pilot',
      passwordHash: 'hashed-password',
    } as User;
    const savedUser = {
      ...unsavedUser,
      id: 1,
      createdAt: new Date(),
    } as User;

    userRepository.create.mockReturnValue(unsavedUser);

    const transactionalUserRepository = {
      save: jest.fn().mockResolvedValue(savedUser),
    };
    const planetRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 99, name: 'Alpha Prime' } as Planet),
      find: jest.fn(),
    };
    const shipRepository = {
      create: jest.fn().mockReturnValue({ id: 22 } as Ship),
      save: jest.fn().mockResolvedValue({ id: 22 } as Ship),
    };
    const userShipAssignment = { id: 301, user: savedUser } as UserShip;
    const userShipRepository = {
      create: jest.fn().mockReturnValue(userShipAssignment),
      save: jest.fn().mockResolvedValue(userShipAssignment),
    };

    transactionManager.getRepository.mockImplementation((entity) => {
      if (entity === User) {
        return transactionalUserRepository as unknown as Repository<User>;
      }
      if (entity === Planet) {
        return planetRepository as unknown as Repository<Planet>;
      }
      if (entity === Ship) {
        return shipRepository as unknown as Repository<Ship>;
      }
      if (entity === UserShip) {
        return userShipRepository as unknown as Repository<UserShip>;
      }
      throw new Error('Unexpected repository request');
    });

    const result = await authService.register({
      email: 'Pilot@Example.com ',
      password: 'secretpass',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('secretpass', 12);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'pilot@example.com',
      passwordHash: 'hashed-password',
      username: 'pilot',
    });
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(transactionalUserRepository.save).toHaveBeenCalledWith(unsavedUser);
    expect(shipRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cargoCapacity: 25,
        fuelCapacity: 75,
        speed: 6,
      }),
    );
    expect(userShipRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ user: savedUser }),
    );
    expect(result).toMatchObject({
      id: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
    });
  });

  it('throws when email already exists', async () => {
    userRepository.findOne.mockResolvedValueOnce({} as User);

    await expect(
      authService.register({
        email: 'pilot@example.com',
        password: 'secretpass',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('issues a session when login succeeds', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const user = {
      id: 7,
      email: 'pilot@example.com',
      passwordHash: 'hash',
      username: 'pilot-01',
      rank: 'Captain',
      reputation: 0,
      credits: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      userShips: [],
      sessionVersion: 1,
    } as unknown as User;

    userRepository.findOne.mockResolvedValue(user);

    const session = await authService.login({
      email: 'pilot@example.com',
      password: 'secretpass',
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      ver: user.sessionVersion,
    });
    expect(session.accessToken).toBe('signed-token');
    expect(session.user).toMatchObject({
      id: user.id,
      email: user.email,
      username: user.username,
      stats: {
        credits: user.credits,
        reputation: user.reputation,
        rank: user.rank,
        cargoCapacity: null,
        cargoUsed: 0,
        cargoItems: [],
        fuel: {
          current: null,
          capacity: null,
          percentage: null,
        },
      },
    });
    expect(session.user.position).toBeNull();
  });

  it('throws when session token is invalid during resume', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(authService.resumeSession('bad-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('includes ship snapshot and fuel stats when a ship is assigned', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const ship = {
      id: 4,
      name: 'Starlifter',
      level: 5,
      price: 60000,
      cargoCapacity: 120,
      fuelCapacity: 80,
      fuelCurrent: 40,
      speed: 9,
      acquiredAt: new Date(),
    };
    const planet = {
      id: 55,
      name: 'Nexus Station',
      hexQ: 1,
      hexR: 1,
    };

    const userWithShip = {
      id: 11,
      email: 'captain@example.com',
      passwordHash: 'hash',
      username: 'captain-11',
      rank: 'Commander',
      reputation: 2500,
      credits: 123456,
      createdAt: new Date(),
      updatedAt: new Date(),
      userShips: [
        {
          ship,
          isActive: true,
          currentPlanet: planet,
        },
      ],
      sessionVersion: 2,
    } as unknown as User;

    userRepository.findOne.mockResolvedValue(userWithShip);

    const session = await authService.login({
      email: 'captain@example.com',
      password: 'secretpass',
    });

    expect(session.user.ship).toMatchObject({
      id: ship.id,
      level: ship.level,
      price: ship.price,
      cargoCapacity: ship.cargoCapacity,
      fuelCapacity: ship.fuelCapacity,
      fuelCurrent: ship.fuelCurrent,
    });
    expect(session.user.stats).toEqual({
      credits: userWithShip.credits,
      reputation: userWithShip.reputation,
      cargoCapacity: ship.cargoCapacity,
      fuel: {
        current: ship.fuelCurrent,
        capacity: ship.fuelCapacity,
        percentage: 50,
      },
    });
    expect(session.user.position).toEqual({
      planetId: planet.id,
      planetName: planet.name,
      hex: { q: planet.hexQ, r: planet.hexR },
    });
  });
  it('rejects session resumption when the session version has advanced', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 5,
      email: 'pilot@example.com',
      ver: 1,
    });

    userRepository.findOne.mockResolvedValue({
      id: 5,
      sessionVersion: 2,
    } as unknown as User);

    await expect(authService.resumeSession('token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('increments the session version during logout', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 9,
      email: 'pilot@example.com',
      ver: 3,
    });

    const user = {
      id: 9,
      sessionVersion: 3,
    } as unknown as User;

    userRepository.findOne.mockResolvedValue(user);

    await authService.logout('token');

    expect(user.sessionVersion).toBe(4);
    expect(userRepository.save).toHaveBeenCalledWith(user);
  });
});
