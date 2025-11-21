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
export declare class EventController {
    private readonly eventService;
    private readonly jwtService;
    private readonly userRepository;
    private readonly shipRepository;
    private readonly userShipRepository;
    private readonly inventoryRepository;
    constructor(eventService: EventService, jwtService: JwtService, userRepository: Repository<User>, shipRepository: Repository<Ship>, userShipRepository: Repository<UserShip>, inventoryRepository: Repository<PlayerInventory>);
    private verifySessionToken;
    private extractToken;
    getTravelEvents(authorization: string | undefined): Promise<EventResponseDto[]>;
    getActiveEvents(authorization: string | undefined, planetId?: string, turn?: string): Promise<EventResponseDto[]>;
    submitEventChoice(authorization: string | undefined, choiceRequest: EventChoiceRequestDto): Promise<EventChoiceResponseDto>;
}
