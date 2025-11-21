import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Ship } from '../entities/ship.entity';
import { Planet } from '../entities/planet.entity';
import { UserShip } from '../entities/user-ship.entity';
import { TravelLog } from '../entities/travel-log.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { TravelRequestDto } from './dto/travel-request.dto';
import { TravelResponseDto } from './dto/travel-response.dto';
import { JwtService } from '@nestjs/jwt';
import { EventService } from '../events/event.service';
export declare class TravelService {
    private readonly userRepository;
    private readonly shipRepository;
    private readonly planetRepository;
    private readonly userShipRepository;
    private readonly travelLogRepository;
    private readonly inventoryRepository;
    private readonly jwtService;
    private readonly eventService;
    constructor(userRepository: Repository<User>, shipRepository: Repository<Ship>, planetRepository: Repository<Planet>, userShipRepository: Repository<UserShip>, travelLogRepository: Repository<TravelLog>, inventoryRepository: Repository<PlayerInventory>, jwtService: JwtService, eventService: EventService);
    travel(token: string, travelRequest: TravelRequestDto): Promise<TravelResponseDto>;
    private verifySessionToken;
    private ensureSessionIsCurrent;
    private resolveTokenVersion;
    private resolveActiveAssignment;
    private buildLoggedInUserDto;
}
