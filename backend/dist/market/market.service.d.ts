import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { Good } from '../entities/good.entity';
import { UserShip } from '../entities/user-ship.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { PlanetMarket } from '../entities/planet-market.entity';
import { BuyGoodsDto } from './dto/buy-goods.dto';
import { SellGoodsDto } from './dto/sell-goods.dto';
import { LoggedInUserDto } from '../auth/dto/logged-in-user.dto';
type SessionTokenPayload = {
    sub: number;
    email: string;
    ver?: number;
};
export declare class MarketService {
    private readonly userRepository;
    private readonly shipRepository;
    private readonly planetRepository;
    private readonly goodRepository;
    private readonly userShipRepository;
    private readonly inventoryRepository;
    private readonly planetMarketRepository;
    private readonly jwtService;
    private readonly dataSource;
    constructor(userRepository: Repository<User>, shipRepository: Repository<Ship>, planetRepository: Repository<Planet>, goodRepository: Repository<Good>, userShipRepository: Repository<UserShip>, inventoryRepository: Repository<PlayerInventory>, planetMarketRepository: Repository<PlanetMarket>, jwtService: JwtService, dataSource: DataSource);
    verifySessionToken(token: string): Promise<SessionTokenPayload>;
    buyGoods(token: string, buyGoodsDto: BuyGoodsDto): Promise<LoggedInUserDto>;
    sellGoods(token: string, sellGoodsDto: SellGoodsDto): Promise<LoggedInUserDto>;
    getInventory(token: string): Promise<{
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
    }>;
    private calculateCargoUsage;
    private resolveActiveAssignment;
    private ensureSessionIsCurrent;
    private resolveTokenVersion;
    private buildLoggedInUserDto;
}
export {};
