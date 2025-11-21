import { Repository, DataSource } from 'typeorm';
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
type SessionTokenPayload = {
    sub: number;
    email: string;
    ver?: number;
};
export declare class ShipyardService {
    private readonly userRepository;
    private readonly shipRepository;
    private readonly planetRepository;
    private readonly userShipRepository;
    private readonly inventoryRepository;
    private readonly jwtService;
    private readonly dataSource;
    constructor(userRepository: Repository<User>, shipRepository: Repository<Ship>, planetRepository: Repository<Planet>, userShipRepository: Repository<UserShip>, inventoryRepository: Repository<PlayerInventory>, jwtService: JwtService, dataSource: DataSource);
    verifySessionToken(token: string): Promise<SessionTokenPayload>;
    getAvailableShips(): Promise<ShipyardShipDto[]>;
    getUserShips(token: string): Promise<UserShipDto[]>;
    buyShip(token: string, buyShipDto: BuyShipDto): Promise<LoggedInUserDto>;
    sellShip(token: string, sellShipDto: SellShipDto): Promise<LoggedInUserDto>;
    private buildLoggedInUserDto;
    private resolveActiveAssignment;
    private ensureSessionIsCurrent;
    private resolveTokenVersion;
}
export {};
