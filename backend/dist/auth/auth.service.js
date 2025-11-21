"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = require("crypto");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const ship_entity_1 = require("../entities/ship.entity");
const user_ship_entity_1 = require("../entities/user-ship.entity");
const jwt_1 = require("@nestjs/jwt");
const planet_entity_1 = require("../entities/planet.entity");
const STARTING_SHIP_BLUEPRINT = {
    name: 'Founders Shuttle',
    level: 1,
    price: 0,
    cargoCapacity: 25,
    fuelCapacity: 75,
    speed: 6,
};
let AuthService = class AuthService {
    userRepository;
    jwtService;
    saltRounds = 12;
    startingPlanetName;
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.startingPlanetName =
            process.env.STARTING_PLANET_NAME?.trim() || 'Alpha Prime';
    }
    async register({ email: rawEmail, password: rawPassword, }) {
        const email = this.normalizeEmailInput(rawEmail);
        const password = this.ensureString(rawPassword, 'Password must be a string');
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email is already registered');
        }
        const passwordHash = await bcrypt.hash(password, this.saltRounds);
        const username = await this.generateUniqueUsername(email);
        const user = this.userRepository.create({
            email,
            passwordHash,
            username,
        });
        const savedUser = await this.userRepository.manager.transaction(async (manager) => {
            const transactionalUserRepository = manager.getRepository(user_entity_1.User);
            const persistedUser = await transactionalUserRepository.save(user);
            await this.assignStarterShip(persistedUser, manager);
            return persistedUser;
        });
        return {
            id: savedUser.id,
            email: savedUser.email,
            username: savedUser.username,
            createdAt: savedUser.createdAt,
        };
    }
    async login({ email: rawEmail, password: rawPassword, }) {
        const email = this.normalizeEmailInput(rawEmail);
        const password = this.ensureString(rawPassword, 'Password must be a string');
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
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        return this.buildSessionDto(user);
    }
    async resumeSession(token) {
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
    async logout(token) {
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
    async generateUniqueUsername(email) {
        const localPart = email.split('@')[0];
        const sanitizedBase = localPart
            .replace(/[^a-z0-9]/gi, '')
            .toLowerCase()
            .slice(0, 18) || 'captain';
        let candidate = sanitizedBase;
        let attempts = 0;
        while (await this.userRepository.findOne({ where: { username: candidate } })) {
            const suffix = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(2, '0');
            const trimmedBase = sanitizedBase.slice(0, Math.max(1, 18 - suffix.length));
            candidate = `${trimmedBase}-${suffix}`;
            attempts += 1;
            if (attempts > 50) {
                candidate = `captain-${(0, crypto_1.randomUUID)().slice(0, 6)}`;
            }
        }
        return candidate;
    }
    buildLoggedInUserDto(user) {
        const activeAssignment = this.resolveActiveAssignment(user);
        const activeShip = activeAssignment?.ship ?? null;
        let ship = null;
        if (activeShip) {
            const pricedShip = activeShip;
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
            };
            ship = snapshot;
        }
        const fuelStats = activeShip
            ? {
                current: activeShip.fuelCurrent,
                capacity: activeShip.fuelCapacity,
                percentage: activeShip.fuelCapacity > 0
                    ? Math.round((activeShip.fuelCurrent / activeShip.fuelCapacity) * 100)
                    : 0,
            }
            : {
                current: null,
                capacity: null,
                percentage: null,
            };
        const stats = {
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
    buildSessionDto(user) {
        const sessionVersion = this.resolveTokenVersion(user.sessionVersion);
        const payload = { sub: user.id, email: user.email, ver: sessionVersion };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: this.buildLoggedInUserDto(user),
        };
    }
    normalizeEmailInput(email) {
        const stringEmail = this.ensureString(email, 'Email must be a string');
        return stringEmail.trim().toLowerCase();
    }
    ensureString(value, message) {
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException(message);
        }
        return value;
    }
    async verifySessionToken(token) {
        try {
            return await this.jwtService.verifyAsync(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired session token');
        }
    }
    ensureSessionIsCurrent(user, payload) {
        if (!user) {
            throw new common_1.UnauthorizedException('Session is no longer valid');
        }
        const tokenVersion = this.resolveTokenVersion(payload.ver);
        if (this.resolveTokenVersion(user.sessionVersion) !== tokenVersion) {
            throw new common_1.UnauthorizedException('Session is no longer valid');
        }
        return user;
    }
    resolveTokenVersion(version) {
        return typeof version === 'number' &&
            Number.isFinite(version) &&
            version >= 0
            ? Math.floor(version)
            : 0;
    }
    resolveActiveShip(user) {
        return this.resolveActiveAssignment(user)?.ship ?? null;
    }
    resolveActiveAssignment(user) {
        const relations = user.userShips;
        const assignments = Array.isArray(relations)
            ? relations
            : [];
        const activeAssignment = assignments.find((userShip) => userShip.isActive && userShip.ship);
        return activeAssignment ?? null;
    }
    buildShipPositionDto(assignment) {
        const planetCandidate = assignment?.currentPlanet ?? null;
        if (!planetCandidate) {
            return null;
        }
        const planet = planetCandidate;
        const hasHex = typeof planet.hexQ === 'number' && typeof planet.hexR === 'number';
        return {
            planetId: planet.id,
            planetName: planet.name,
            hex: hasHex
                ? {
                    q: planet.hexQ,
                    r: planet.hexR,
                }
                : null,
        };
    }
    async assignStarterShip(user, manager) {
        const shipRepository = manager.getRepository(ship_entity_1.Ship);
        const planetRepository = manager.getRepository(planet_entity_1.Planet);
        const userShipRepository = manager.getRepository(user_ship_entity_1.UserShip);
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
    async resolveStartingPlanet(planetRepository) {
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
            throw new common_1.BadRequestException('Unable to assign a starting location. No planets exist.');
        }
        return fallbackPlanet;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map