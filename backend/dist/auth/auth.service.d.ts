import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisteredUserDto } from './dto/registered-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { SessionDto } from './dto/session.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly saltRounds;
    private readonly startingPlanetName;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register({ email: rawEmail, password: rawPassword, }: RegisterUserDto): Promise<RegisteredUserDto>;
    login({ email: rawEmail, password: rawPassword, }: LoginUserDto): Promise<SessionDto>;
    resumeSession(token: string): Promise<SessionDto>;
    logout(token: string): Promise<{
        success: true;
    }>;
    private generateUniqueUsername;
    private buildLoggedInUserDto;
    private buildSessionDto;
    private normalizeEmailInput;
    private ensureString;
    private verifySessionToken;
    private ensureSessionIsCurrent;
    private resolveTokenVersion;
    private resolveActiveShip;
    private resolveActiveAssignment;
    private buildShipPositionDto;
    private assignStarterShip;
    private resolveStartingPlanet;
}
